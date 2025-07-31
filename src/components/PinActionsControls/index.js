// src/components/PinActionsControls/PinActionsControls.jsx
import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { Box, IconButton, Typography } from "@mui/material";
import FlagIcon from "@mui/icons-material/Flag";
import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { supabase } from "../../SupabaseClient";
import ListDialog from "../AddToList/AddToListDialog";

/**
 * Centralized pin action controls: been there, want to go, save.
 * Caller passes current pin and receives updated row via onUpdated.
 */
export default function PinActionsControls({ pin, onUpdated, user }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [working, setWorking] = useState(false);

  const ensureUser = useCallback(() => {
    if (!user?.id) {
      alert("You must be logged in to perform this action.");
      return false;
    }
    return true;
  }, [user]);

  const mutateField = async (field, delta) => {
    if (!pin?.id) return;
    setWorking(true);
    try {
      const { data: current, error: fetchErr } = await supabase
        .from("pins")
        .select(field)
        .eq("id", pin.id)
        .single();
      if (fetchErr) throw fetchErr;
      const currentVal = Number(current?.[field] ?? 0);
      const nextVal = Math.max(currentVal + delta, 0);
      const { data: updated, error: updateErr } = await supabase
        .from("pins")
        .update({ [field]: nextVal })
        .eq("id", pin.id)
        .select()
        .single();
      if (updateErr) throw updateErr;
      onUpdated?.(updated);
    } catch (e) {
      console.error(`Failed to update ${field}:`, e);
      alert("Error updating. Please try again.");
    } finally {
      setWorking(false);
    }
  };

  const toggleBeenThere = async () => {
    if (!ensureUser()) return;
    await mutateField("been_there", 1);
  };

  const toggleWantToGo = async () => {
    if (!ensureUser()) return;
    await mutateField("want_to_go", 1);
  };

  const handleSave = async () => {
    if (!ensureUser()) return;
    setDialogOpen(true);
  };

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Box textAlign="center">
        <IconButton
          aria-label="been there"
          disabled={working}
          onClick={toggleBeenThere}
          size="small"
          sx={{ color: "green" }}
        >
          {Number(pin.been_there || 0) > 0 ? (
            <FlagIcon fontSize="small" />
          ) : (
            <OutlinedFlagIcon fontSize="small" />
          )}
        </IconButton>
        <Typography variant="caption" display="block">
          {pin.been_there || 0}
        </Typography>
      </Box>

      <Box textAlign="center">
        <IconButton
          aria-label="want to go"
          disabled={working}
          onClick={toggleWantToGo}
          size="small"
          sx={{ color: "gold" }}
        >
          {Number(pin.want_to_go || 0) > 0 ? (
            <StarIcon fontSize="small" />
          ) : (
            <StarBorderIcon fontSize="small" />
          )}
        </IconButton>
        <Typography variant="caption" display="block">
          {pin.want_to_go || 0}
        </Typography>
      </Box>

      <Box textAlign="center">
        <IconButton
          aria-label="save"
          disabled={working}
          onClick={handleSave}
          size="small"
          sx={{ color: "error.main" }}
        >
          {Number(pin.saved_count || 0) > 0 ? (
            <FavoriteIcon fontSize="small" />
          ) : (
            <FavoriteBorderIcon fontSize="small" />
          )}
        </IconButton>
        <Typography variant="caption" display="block">
          {pin.saved_count || 0}
        </Typography>
      </Box>

      <ListDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        pin={pin}
        onSaved={async () => {
          try {
            const { data: current, error: fetchErr } = await supabase
              .from("pins")
              .select("saved_count")
              .eq("id", pin.id)
              .single();
            if (fetchErr) throw fetchErr;
            const currentVal = Number(current?.saved_count || 0);
            const { data: updated, error: updateErr } = await supabase
              .from("pins")
              .update({ saved_count: currentVal + 1 })
              .eq("id", pin.id)
              .select()
              .single();
            if (updateErr) throw updateErr;
            onUpdated?.(updated);
          } catch (e) {
            console.error("Error bumping saved_count after list save:", e);
          }
          setDialogOpen(false);
        }}
      />
    </Box>
  );
}

PinActionsControls.propTypes = {
  pin: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    saved_count: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    been_there: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    want_to_go: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }).isRequired,
  onUpdated: PropTypes.func,
  user: PropTypes.object,
};
