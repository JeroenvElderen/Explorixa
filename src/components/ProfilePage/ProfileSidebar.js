// src/components/ProfileSidebar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Grid, Card, Box, Divider, TextField, Button } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import HomeIcon from "@mui/icons-material/Home";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import { supabase } from "SupabaseClient";

const cardStyles = {
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  background:
    "linear-gradient(145deg, rgba(241,143,1,0.3) 0%, rgba(241,143,1,0) 100%)",
  border: "1px solid rgba(255,255,255,0.6)",
  boxShadow:
    "inset 4px 4px 10px rgba(241,143,1,0.4), inset -4px -4px 10px rgba(241,143,1,0.1), 0 6px 15px rgba(241,143,1,0.3)",
  borderRadius: "12px",
  p: 3,
};

export default function ProfileSidebar({
  profile,
  followers,
  latestPhotos,
  navigate,
  openLightbox,
  isOwner,
  onProfileUpdate,
  editing,
  onEditClick,
}) {
  const [localProfile, setLocalProfile] = useState(profile || {});
  const bgInputRef = useRef(null);

  useEffect(() => {
    if (profile) setLocalProfile(profile);
  }, [profile]);

  const handleSave = async () => {
    const updates = {
      ...localProfile,
      user_id: profile.user_id,
    };

    const { data, error } = await supabase
      .from("profiles")
      .upsert(updates, { onConflict: "user_id" })
      .select()
      .single();

    if (error) {
      console.error("Failed to save profile:", error);
      return;
    }

    setLocalProfile(data);
    onProfileUpdate?.(data);
    alert("Profile updated!");

    onEditClick?.();
  };

  const handleBgUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    const ext = file.name.split(".").pop();
    const path = `${profile.user_id}/background.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("pins-images")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      console.error(uploadError);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("pins-images").getPublicUrl(path);

    const bustedUrl = `${publicUrl}?t=${Date.now()}`;
    setLocalProfile((prev) => ({ ...prev, background_url: bustedUrl }));
  };

  if (!profile) return null;

  return (
    <Grid item xs={12} md={4} id="edit-section">
      <Box display="flex" flexDirection="column" gap={3}>
        {/* Editable Profile Info */}
        {isOwner && editing && (
          <Card sx={cardStyles}>
            <MDTypography variant="h6" mb={2} textAlign="center">
              Edit Profile
            </MDTypography>

            {[
              "Username",
              "full_name",
              "email",
              "location",
              "from_location",
              "description",
            ].map((field) => (
              <MDBox key={field} mb={2}>
                <MDTypography variant="caption" sx={{ fontSize: "12px" }}>
                  {field.replace(/_/g, " ").toUpperCase()}
                </MDTypography>
                {field === "description" ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={localProfile[field] || ""}
                    onChange={(e) =>
                      setLocalProfile((prev) => ({
                        ...prev,
                        [field]: e.target.value,
                      }))
                    }
                    sx={{ mt: 0.5 }}
                    inputProps={{ style: { fontSize: "14px" } }}
                  />
                ) : (
                  <TextField
                    fullWidth
                    size="small"
                    value={localProfile[field] || ""}
                    onChange={(e) =>
                      setLocalProfile((prev) => ({
                        ...prev,
                        [field]: e.target.value,
                      }))
                    }
                    sx={{ mt: 0.5 }}
                    inputProps={{ style: { fontSize: "14px" } }}
                  />
                )}
              </MDBox>
            ))}

            {/* Background Image Upload */}
            <MDBox mb={2}>
              <MDTypography variant="caption" sx={{ fontSize: "12px" }}>
                BACKGROUND IMAGE
              </MDTypography>
              <input
                type="file"
                accept="image/*"
                ref={bgInputRef}
                style={{ display: "none" }}
                onChange={handleBgUpload}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={() => bgInputRef.current?.click()}
                sx={{ mt: 1 }}
              >
                Upload…
              </Button>
              {localProfile.background_url && (
                <MDBox mt={1}>
                  <img
                    src={localProfile.background_url}
                    alt="bg preview"
                    style={{
                      width: "100%",
                      borderRadius: 4,
                      maxHeight: 100,
                      objectFit: "cover",
                    }}
                  />
                </MDBox>
              )}
            </MDBox>

            <MDBox textAlign="right">
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                startIcon={<SaveIcon />}
              >
                Save
              </Button>
            </MDBox>
          </Card>
        )}

        {/* Intro */}
        <Card sx={cardStyles}>
          <MDTypography variant="h6" mb={2}>
            Intro
          </MDTypography>
          <MDTypography variant="body1" fontSize="14px" textAlign="center">
            {profile.description}
          </MDTypography>
          <Divider sx={{ backgroundColor: "#F18F01", height: 2, my: 2 }} />
          <MDBox display="flex" alignItems="center" mb={1}>
            <HomeIcon sx={{ fontSize: 16, color: "#F18F01", mr: 1 }} />
            <MDTypography sx={{ fontSize: "16px" }}>
              Lives in {profile.location || "-"}
            </MDTypography>
          </MDBox>
          <MDBox display="flex" alignItems="center" mb={1}>
            <LocationOnIcon sx={{ fontSize: 16, color: "#F18F01", mr: 1 }} />
            <MDTypography sx={{ fontSize: "16px" }}>
              From {profile.from_location || "-"}
            </MDTypography>
          </MDBox>
        </Card>

        {/* Photos */}
        <Card sx={cardStyles}>
          <MDTypography variant="h6" mb={2}>
            Photos
          </MDTypography>
          <Grid container spacing={1}>
            {latestPhotos.map((photo, idx) => (
              <Grid item xs={4} mb={-1} key={idx}>
                <Box
                  component="img"
                  src={photo.src}
                  alt={`Photo ${idx + 1}`}
                  sx={{
                    width: "100%",
                    aspectRatio: "1 / 1",
                    objectFit: "cover",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    openLightbox(
                      latestPhotos.map((p) => ({ src: p.src })),
                      idx
                    )
                  }
                />
              </Grid>
            ))}
          </Grid>
        </Card>

        {/* Followers */}
        <Card sx={cardStyles}>
          <MDTypography variant="h6" mb={2}>
            Followers
          </MDTypography>
          <Grid container spacing={1}>
            {followers.length === 0 ? (
              <MDTypography
                variant="body2"
                color="textSecondary"
                textAlign="center"
                sx={{ width: "100%" }}
              >
                No followers yet.
              </MDTypography>
            ) : (
              followers.map((f) => (
                <Grid item xs={4} key={f.user_id}>
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="flex-start"
                    sx={{ textAlign: "center" }}
                  >
                    <Box
                      component="img"
                      src={f.avatar_url}
                      alt={f.Username || f.full_name}
                      onClick={() => navigate(`/profile/${f.user_id}`)}
                      sx={{
                        width: "100%",
                        aspectRatio: "1 / 1",
                        objectFit: "cover",
                        borderRadius: "8px",
                        cursor: "pointer",
                        marginBottom: "2px",
                      }}
                    />
                    <MDTypography
                      sx={{
                        fontSize: "12px",
                        lineHeight: 1.2,
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,
                        overflow: "hidden",
                        width: "100%",
                      }}
                    >
                      {f.Username || f.full_name || "User"}
                    </MDTypography>
                  </Box>
                </Grid>
              ))
            )}
          </Grid>
        </Card>
      </Box>
    </Grid>
  );
}
