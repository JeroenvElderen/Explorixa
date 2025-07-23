// src/components/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "SupabaseClient";
import {
  Box,
  Avatar,
  Typography,
  Grid,
  CircularProgress,
} from "@mui/material";
import FollowButton from "components/pinpage/FollowButton";
import PinCard from "examples/Charts/PinCard";
import StarField from "components/StarField";
import { useSavedPins } from "components/SavedPinsContext";
import ListDialog from "components/AddToList/AddToListDialog";

export default function ProfilePage() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [pins, setPins] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPins, setLoadingPins] = useState(true);

  // for the AddToList dialog
  const [listDialogOpen, setListDialogOpen] = useState(false);
  const [dialogPin, setDialogPin] = useState(null);

  const {
    pins: savedPins,      // favorites
    save, remove,         // add/remove favorite
    beenTherePins, saveBeenThere, removeBeenThere,
    wantToGoPins,  saveWantToGo,  removeWantToGo,
  } = useSavedPins();

  // Fetch profile
  useEffect(() => {
    supabase
      .from("profiles")
      .select("user_id, Username, full_name, avatar_url, bio")
      .eq("user_id", userId)
      .single()
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setProfile(data);
      })
      .finally(() => setLoadingProfile(false));
  }, [userId]);

  // Fetch pins
  useEffect(() => {
    supabase
      .from("pins")
      .select('id, Name, "Main Image", created_at, been_there, want_to_go, saved_count')
      .eq("user_id", userId)
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setPins(data || []);
      })
      .finally(() => setLoadingPins(false));
  }, [userId]);

  if (loadingProfile)
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  if (!profile)
    return (
      <Box textAlign="center" mt={4}>
        User not found.
      </Box>
    );

  // Handlers for toggles…
  const toggleBeenThere = async (pin) => {
    const next = !beenTherePins.some(p => p.id === pin.id);
    const newCount = next ? (pin.been_there||0) + 1 : Math.max((pin.been_there||1) - 1, 0);
    await supabase.from("pins").update({ been_there: newCount }).eq("id", pin.id);
    next ? saveBeenThere(pin) : removeBeenThere(pin);
    setPins(arr => arr.map(p => p.id===pin.id ? {...p, been_there:newCount} : p));
  };

  const toggleWantToGo = async (pin) => {
    const next = !wantToGoPins.some(p => p.id === pin.id);
    const newCount = next ? (pin.want_to_go||0) + 1 : Math.max((pin.want_to_go||1) - 1, 0);
    await supabase.from("pins").update({ want_to_go: newCount }).eq("id", pin.id);
    next ? saveWantToGo(pin) : removeWantToGo(pin);
    setPins(arr => arr.map(p => p.id===pin.id ? {...p, want_to_go:newCount} : p));
  };

  const handleSaveClick = (pin) => {
    // open the “Add to list” dialog
    setDialogPin(pin);
    setListDialogOpen(true);
  };

  const handleDialogSaved = () => {
    // after dialog: mark saved locally & bump count
    setPins(arr =>
      arr.map(p =>
        p.id === dialogPin.id
          ? { ...p, saved_count: (p.saved_count || 0) + 1 }
          : p
      )
    );
    save(dialogPin);
    setListDialogOpen(false);
    setDialogPin(null);
  };

  return (
    <>
      <StarField />
      <Box p={4} maxWidth={800} mx="auto">
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar src={profile.avatar_url} sx={{ width: 80, height: 80 }} />
          <Box>
            <Typography variant="h5">
              {profile.full_name || profile.Username}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              @{profile.Username}
            </Typography>
          </Box>
          <FollowButton authorId={profile.user_id} />
        </Box>

        {profile.bio && (
          <Box mt={2}>
            <Typography variant="body1">{profile.bio}</Typography>
          </Box>
        )}

        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Pins by {profile.Username}
          </Typography>
          {loadingPins ? (
            <CircularProgress size={24} />
          ) : pins.length > 0 ? (
            <Grid container spacing={2}>
              {pins.map((pin) => {
                const isFav       = savedPins.some(p => p.id === pin.id);
                const isBeenThere = beenTherePins.some(p => p.id === pin.id);
                const isWantToGo  = wantToGoPins.some(p => p.id === pin.id);

                return (
                  <Grid item key={pin.id} xs={12} sm={6} md={4}>
                    <PinCard
                      color="info"
                      title={pin.Name}
                      description={pin.Information}
                      date={pin.created_at?.slice(0, 10) || ""}
                      imageurl={pin["Main Image"]}
                      imagealt={pin.Name}

                      /* —— SAVES —— */
                      isSaved={isFav}
                      savedCount={pin.saved_count || 0}
                      onSave={() => handleSaveClick(pin)}

                      /* —— BEEN THERE —— */
                      isBeenThere={isBeenThere}
                      beenThereCount={pin.been_there || 0}
                      onBeenThere={() => toggleBeenThere(pin)}

                      /* —— WANT TO GO —— */
                      isWantToGo={isWantToGo}
                      wantToGoCount={pin.want_to_go || 0}
                      onWantToGo={() => toggleWantToGo(pin)}
                    />
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Typography>No pins yet.</Typography>
          )}
        </Box>
      </Box>

      {/* AddToList dialog just like in PopupComponent */}
      <ListDialog
        open={listDialogOpen}
        onClose={() => {
          setListDialogOpen(false);
          setDialogPin(null);
        }}
        pin={dialogPin}
        onSaved={handleDialogSaved}
      />
    </>
  );
}
