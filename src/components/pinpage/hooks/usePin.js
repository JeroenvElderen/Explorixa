// src/hooks/usePin.js
import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useTheme, useMediaQuery } from "@mui/material";
import { supabase } from "../../../SupabaseClient";
import normalizeImages from "../../../utils/normalizeImages";

export default function usePin() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { pinSlug } = useParams();
  const { state } = useLocation();
  const pinFromState = state?.pin || null;

  const [pin, setPin] = useState(pinFromState);
  const [loading, setLoading] = useState(!pinFromState);
  const [notFound, setNotFound] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
  }, []);

  useEffect(() => {
    let canceled = false;
    async function load() {
      setLoading(true);
      setNotFound(false);
      try {
        const name = pinSlug.replace(/_/g, " ");
        let { data: pData } = await supabase
          .from("pins")
          .select(
            `*, addedBy:profiles!pins_user_id_fkey(Username, full_name, avatar_url, user_id)`
          )
          .eq("Name", name)
          .maybeSingle();

        if (!pData) {
          const { data: allPins } = await supabase.from("pins").select("id, Name");
          const map = {};
          allPins.forEach(p => {
            map[p.Name.toLowerCase().split(" ").join("_")] = p.id;
          });
          const id = map[pinSlug];
          if (id) {
            const { data: fData } = await supabase
              .from("pins")
              .select(
                `*, addedBy:profiles!pins_user_id_fkey(Username, full_name, avatar_url, user_id)`
              )
              .eq("id", id)
              .maybeSingle();
            pData = fData;
          }
        }

        if (pData && !canceled) {
          setPin({
            ...pData,
            latitude: Number(pData.latitude),
            longitude: Number(pData.longitude),
            Images: normalizeImages(pData.Images),
            addedBy: pData.addedBy
              ? {
                  userId: pData.addedBy.user_id,
                  username: pData.addedBy.Username || pData.addedBy.full_name,
                  avatarUrl: pData.addedBy.avatar_url,
                }
              : null,
          });
        } else if (!pData && !canceled) {
          setNotFound(true);
        }
      } catch (e) {
        console.error(e);
      }
      if (!canceled) setLoading(false);
    }
    load();
    return () => {
      canceled = true;
    };
  }, [pinSlug]);

  const updatePinInfo = async newInfo => {
    if (!pin) return;
    await supabase.from("pins").update({ Information: newInfo }).eq("id", pin.id);
    setPin(p => ({ ...p, Information: newInfo }));
  };

  const images = [];
  if (pin && pin["Main Image"]) images.push(pin["Main Image"]);
  if (pin && Array.isArray(pin.Images)) images.push(...pin.Images);

  return {
    pin,
    loading,
    notFound,
    currentUserId,
    setPin,
    infoDialogOpen,
    setInfoDialogOpen,
    updatePinInfo,
    isMobile,
    images,
  };
}
