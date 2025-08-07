// src/hooks/usePin.js
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../SupabaseClient";
import { normalizeImages, sluggify } from "../utils";
import { useSavedPins } from "../components/SavedPinsContext";

export function usePin(pinSlug) {
  const {
    pins,
    save,
    remove,
    beenTherePins,
    saveBeenThere,
    removeBeenThere,
    wantToGoPins,
    saveWantToGo,
    removeWantToGo,
  } = useSavedPins(); 

  const [pin, setPin] = useState(null);
  const [loading, setLoading] = useState(true);

  // derive reaction state from context
  const isSaved = !!pin && pins.some((p) => p.id === pin.id);
  const isBeenThere = !!pin && beenTherePins.some((p) => p.id === pin.id);
  const isWantToGo = !!pin && wantToGoPins.some((p) => p.id === pin.id);

  // 1. Load & format pin on slug change
  useEffect(() => {
    let cancelled = false;

    async function loadPin() {
      setLoading(true);
      try {
        const nameFromSlug = pinSlug?.replace(/_/g, " ") || "";

        // 1a) Try fetch by Name
        let { data: pinData, error } = await supabase
          .from("pins")
          .select(`
            *,
            addedBy:profiles!pins_user_id_fkey(
              Username,
              full_name,
              avatar_url,
              user_id
            )
          `)
          .eq("Name", nameFromSlug)
          .maybeSingle();

        // 1b) Fallback via slug→ID map
        if (!pinData && !cancelled) {
          const { data: allPins } = await supabase
            .from("pins")
            .select(`id, "Name"`);

          const slugMap = {};
          allPins?.forEach((p) => {
            slugMap[sluggify(p.Name)] = p.id;
          });

          const fallbackId = slugMap[sluggify(pinSlug)];
          if (fallbackId) {
            const { data: fallbackPin } = await supabase
              .from("pins")
              .select(`
                *,
                addedBy:profiles!pins_user_id_fkey(
                  Username,
                  full_name,
                  avatar_url,
                  user_id
                )
              `)
              .eq("id", fallbackId)
              .maybeSingle();

            pinData = fallbackPin;
          }
        }

        // 1c) Format & set
        if (pinData && !cancelled) {
          const formattedPin = {
            ...pinData,
            latitude: Number(pinData.latitude),
            longitude: Number(pinData.longitude),
            Images: normalizeImages(pinData.Images),
            addedBy: pinData.addedBy
              ? {
                  username: pinData.addedBy.Username || pinData.addedBy.full_name,
                  avatarUrl: pinData.addedBy.avatar_url,
                  userId: pinData.addedBy.user_id,
                }
              : null,
          };
          setPin(formattedPin);
        }
      } catch (err) {
        console.error("Error loading pin:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPin();
    return () => {
      cancelled = true;
    };
  }, [pinSlug]);

  // 2. Toggle "Been There"
  const toggleBeenThere = useCallback(async () => {
    if (!pin) return;
    const next = !isBeenThere;
    const newCount = next
      ? (pin.been_there || 0) + 1
      : Math.max((pin.been_there || 1) - 1, 0);

    setPin((p) => ({ ...p, been_there: newCount }));
    await supabase.from("pins").update({ been_there: newCount }).eq("id", pin.id);
    next ? saveBeenThere(pin) : removeBeenThere(pin);
  }, [pin, isBeenThere, saveBeenThere, removeBeenThere]);

  // 3. Toggle "Want to Go"
  const toggleWantToGo = useCallback(async () => {
    if (!pin) return;
    const next = !isWantToGo;
    const newCount = next
      ? (pin.want_to_go || 0) + 1
      : Math.max((pin.want_to_go || 1) - 1, 0);

    setPin((p) => ({ ...p, want_to_go: newCount }));
    await supabase.from("pins").update({ want_to_go: newCount }).eq("id", pin.id);
    next ? saveWantToGo(pin) : removeWantToGo(pin);
  }, [pin, isWantToGo, saveWantToGo, removeWantToGo]);

  // 4. Toggle "Saved"
  const toggleSave = useCallback(async () => {
    if (!pin) return;
    const newCount = isSaved
      ? Math.max((pin.saved_count || 1) - 1, 0)
      : (pin.saved_count || 0) + 1;

    setPin((p) => ({ ...p, saved_count: newCount }));
    await supabase
      .from("pins")
      .update({ saved_count: newCount })
      .eq("id", pin.id);

    isSaved ? remove(pin) : save(pin);
  }, [pin, isSaved, save, remove]);

  return {
    pin,
    loading,
    isBeenThere,
    isWantToGo,
    isSaved,
    toggleBeenThere,
    toggleWantToGo,
    toggleSave,
  };
}
