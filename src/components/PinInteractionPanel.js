// src/components/PinInteractionPanel/PinInteractionPanel.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { Box, IconButton, Typography, Tooltip } from "@mui/material";
import FlagIcon from "@mui/icons-material/Flag";
import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { supabase } from "../SupabaseClient";
import ListDialog from "./AddToList/AddToListDialog";
import useSupabaseUser from "../hooks/useSupabaseUser";

/**
 * Unified panel: been_there, want_to_go, save (with list dialog).
 * Reflects whether current user has toggled each and adjusts global counters.
 */
export default function PinInteractionPanel({ pin: initialPin, onUpdated }) {
  const user = useSupabaseUser();
  const [pin, setPin] = useState(initialPin);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hasBeenThere, setHasBeenThere] = useState(false);
  const [hasWantToGo, setHasWantToGo] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [userListsContainingPin, setUserListsContainingPin] = useState([]);

  const refreshState = useCallback(
    async (forcePin = initialPin) => {
      if (!forcePin?.id) return;

      // fetch global pin counts
      const { data: freshPin, error: pinErr } = await supabase
        .from("pins")
        .select("been_there, want_to_go, saved_count")
        .eq("id", forcePin.id)
        .single();

      const mergedPin = !pinErr && freshPin ? { ...forcePin, ...freshPin } : forcePin;
      setPin(mergedPin);
      onUpdated?.(mergedPin);

      if (!user?.id) {
        setHasBeenThere(false);
        setHasWantToGo(false);
        setIsSaved(false);
        setUserListsContainingPin([]);
        return;
      }

      const pinId = forcePin.id;

      // been there membership
      try {
        const { count: beenCount } = await supabase
          .from("user_been_there")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("pin_id", pinId);
        setHasBeenThere(beenCount > 0);
      } catch (e) {
        console.error("fetch been there membership failed", e);
        setHasBeenThere(false);
      }

      // want to go membership
      try {
        const { count: wantCount } = await supabase
          .from("user_want_to_go")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("pin_id", pinId);
        setHasWantToGo(wantCount > 0);
      } catch (e) {
        console.error("fetch want to go membership failed", e);
        setHasWantToGo(false);
      }

      // saved / list membership
      try {
        const { data: listPins, error: lpErr } = await supabase
          .from("list_pins")
          .select("list_id")
          .eq("pin_id", pinId);
        if (lpErr) throw lpErr;
        const listIds = (listPins || []).map((r) => r.list_id);
        if (listIds.length === 0) {
          setIsSaved(false);
          setUserListsContainingPin([]);
        } else {
          const { data: userLists, error: listsErr } = await supabase
            .from("lists")
            .select("id")
            .in("id", listIds)
            .eq("user_id", user.id);
          if (listsErr) throw listsErr;
          const owned = (userLists || []).map((l) => l.id);
          setUserListsContainingPin(owned);
          setIsSaved(owned.length > 0);
        }
      } catch (e) {
        console.error("list_pins / lists fetch error:", e);
        setIsSaved(false);
        setUserListsContainingPin([]);
      }
    },
    [initialPin, onUpdated, user]
  );

  useEffect(() => {
    setPin(initialPin);
  }, [initialPin]);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  const guardUser = () => {
    if (!user?.id) {
      alert("You must be logged in to do that.");
      return false;
    }
    return true;
  };

  const mutateGlobalCount = async (field, delta) => {
    if (!pin?.id) return;
    const { data: current, error: fetchErr } = await supabase
      .from("pins")
      .select(field)
      .eq("id", pin.id)
      .single();
    if (fetchErr) {
      console.error("fetch error", fetchErr);
      return null;
    }
    const currentVal = Number(current?.[field] ?? 0);
    const nextVal = Math.max(currentVal + delta, 0);
    const { data: updated, error: updateErr } = await supabase
      .from("pins")
      .update({ [field]: nextVal })
      .eq("id", pin.id)
      .select()
      .single();
    if (updateErr) {
      console.error("update error", updateErr);
      return null;
    }
    setPin((p) => ({ ...p, [field]: nextVal }));
    onUpdated?.(updated);
    return updated;
  };

  const toggleBeenThere = async () => {
    if (!guardUser()) return;
    setLoading(true);
    try {
      if (hasBeenThere) {
        await supabase
          .from("user_been_there")
          .delete()
          .eq("user_id", user.id)
          .eq("pin_id", pin.id);
        await mutateGlobalCount("been_there", -1);
      } else {
        await supabase
          .from("user_been_there")
          .insert({ user_id: user.id, pin_id: pin.id });
        await mutateGlobalCount("been_there", 1);
      }
      setHasBeenThere((h) => !h);
    } catch (e) {
      console.error("toggleBeenThere failed", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleWantToGo = async () => {
    if (!guardUser()) return;
    setLoading(true);
    try {
      if (hasWantToGo) {
        await supabase
          .from("user_want_to_go")
          .delete()
          .eq("user_id", user.id)
          .eq("pin_id", pin.id);
        await mutateGlobalCount("want_to_go", -1);
      } else {
        await supabase
          .from("user_want_to_go")
          .insert({ user_id: user.id, pin_id: pin.id });
        await mutateGlobalCount("want_to_go", 1);
      }
      setHasWantToGo((w) => !w);
    } catch (e) {
      console.error("toggleWantToGo failed", e);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteClick = async () => {
    if (!guardUser()) return;
    if (isSaved === null) return;
    setLoading(true);
    try {
      if (isSaved && userListsContainingPin.length) {
        await supabase
          .from("list_pins")
          .delete()
          .in("list_id", userListsContainingPin)
          .eq("pin_id", pin.id);
        await mutateGlobalCount("saved_count", -1);
        setIsSaved(false);
      } else if (!isSaved) {
        setDialogOpen(true);
      }
    } catch (e) {
      console.error("favorite toggle failed", e);
    } finally {
      setLoading(false);
      await refreshState();
    }
  };

  const handleAfterListSaved = async () => {
    // Assume the dialog already inserted into list_pins; just refresh counts/membership.
    await refreshState();
  };

  const initialized =
    typeof hasBeenThere === "boolean" &&
    typeof hasWantToGo === "boolean" &&
    typeof isSaved === "boolean";

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={2}
      sx={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRadius: 12,
        px: 2,
        py: 1,
        opacity: initialized ? 1 : 0.9,
        transition: "opacity .2s ease",
      }}
    >
      {/* Been There */}
      <Tooltip title="Been there">
        <Box textAlign="center" sx={{ minWidth: 50 }}>
          <IconButton
            aria-label="been there"
            onClick={toggleBeenThere}
            disabled={loading}
            size="small"
            sx={{
              backgroundColor: hasBeenThere
                ? "rgba(40,167,69,0.15)"
                : "transparent",
              "&:hover": {
                backgroundColor: hasBeenThere
                  ? "rgba(40,167,69,0.25)"
                  : "rgba(40,167,69,0.08)",
              },
              transition: "background-color .2s ease",
            }}
          >
            {hasBeenThere ? (
              <FlagIcon fontSize="small" sx={{ color: "green" }} />
            ) : (
              <OutlinedFlagIcon fontSize="small" sx={{ color: "green" }} />
            )}
          </IconButton>
          <Typography
            variant="caption"
            display="block"
            sx={{ color: "#fff", mt: 0.5 }}
          >
            {pin.been_there || 0}
          </Typography>
        </Box>
      </Tooltip>

      {/* Want To Go */}
      <Tooltip title="Want to go">
        <Box textAlign="center" sx={{ minWidth: 50 }}>
          <IconButton
            aria-label="want to go"
            onClick={toggleWantToGo}
            disabled={loading}
            size="small"
            sx={{
              backgroundColor: hasWantToGo
                ? "rgba(255,215,0,0.15)"
                : "transparent",
              "&:hover": {
                backgroundColor: hasWantToGo
                  ? "rgba(255,215,0,0.25)"
                  : "rgba(255,215,0,0.08)",
              },
              transition: "background-color .2s ease",
            }}
          >
            {hasWantToGo ? (
              <StarIcon fontSize="small" sx={{ color: "gold" }} />
            ) : (
              <StarBorderIcon fontSize="small" sx={{ color: "gold" }} />
            )}
          </IconButton>
          <Typography
            variant="caption"
            display="block"
            sx={{ color: "#fff", mt: 0.5 }}
          >
            {pin.want_to_go || 0}
          </Typography>
        </Box>
      </Tooltip>

      {/* Save / Favorite */}
      <Tooltip title="Save">
        <Box textAlign="center" sx={{ minWidth: 50 }}>
          <IconButton
            aria-label="save"
            onClick={handleFavoriteClick}
            disabled={loading}
            size="small"
            sx={{
              backgroundColor: isSaved
                ? "rgba(241,143,1,0.15)"
                : "transparent",
              "&:hover": {
                backgroundColor: isSaved
                  ? "rgba(241,143,1,0.25)"
                  : "rgba(241,143,1,0.08)",
              },
              transition: "background-color .2s ease",
            }}
          >
            {isSaved ? (
              <FavoriteIcon fontSize="small" sx={{ color: "error.main" }} />
            ) : (
              <FavoriteBorderIcon
                fontSize="small"
                sx={{ color: "error.main" }}
              />
            )}
          </IconButton>
          <Typography
            variant="caption"
            display="block"
            sx={{ color: "#fff", mt: 0.5 }}
          >
            {pin.saved_count || 0}
          </Typography>
        </Box>
      </Tooltip>

      <ListDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        pin={pin}
        onSaved={async () => {
          await handleAfterListSaved();
          setDialogOpen(false);
        }}
      />
    </Box>
  );
}

PinInteractionPanel.propTypes = {
  pin: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    been_there: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    want_to_go: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    saved_count: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }).isRequired,
  onUpdated: PropTypes.func,
};
