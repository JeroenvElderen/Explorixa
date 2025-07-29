import React, { useRef, useState } from "react";
import { Card, Box, TextField, Button } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
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
  p: 2,
};

export default function EditProfileCard({
  profile,
  onProfileUpdate,
  onEditClick,
}) {
  const [localProfile, setLocalProfile] = useState(profile || {});
  const bgInputRef = useRef(null);
  const avatarInputRef = useRef(null);

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

  // NEW: Handle avatar upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    const ext = file.name.split(".").pop();
    const path = `${profile.user_id}/avatar.${ext}`;

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
    setLocalProfile((prev) => ({ ...prev, avatar_url: bustedUrl }));
  };

  if (!profile) return null;

  return (
    <Card sx={cardStyles}>
      <MDTypography variant="h6" mb={2} textAlign="center">
        Edit Profile
      </MDTypography>

      {/* Avatar Upload Section */}
      <MDBox mb={2} textAlign="center">
        <Box
          component="img"
          src={localProfile.avatar_url || "https://www.gravatar.com/avatar/?d=mp&s=150"}
          alt="Avatar Preview"
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            objectFit: "cover",
            cursor: "pointer",
            mb: 1,
          }}
          onClick={() => avatarInputRef.current?.click()}
        />
        <input
          type="file"
          accept="image/*"
          ref={avatarInputRef}
          style={{ display: "none" }}
          onChange={handleAvatarUpload}
        />
        <Button
          variant="outlined"
          size="small"
          onClick={() => avatarInputRef.current?.click()}
        >
          Change Avatar
        </Button>
      </MDBox>

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
  );
}
