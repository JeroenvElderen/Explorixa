// src/pages/Overview.jsx
import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import SaveIcon from "@mui/icons-material/Save";
import StarField from "components/StarField";
import SimpleResponsiveNavbar from "examples/Navbars/ResponsiveNavbar/allpage";

import MDBox from "../../components/MDBox";
import MDTypography from "../../components/MDTypography";

import DashboardLayout from "../../examples/LayoutContainers/DashboardLayout";
import Footer from "../../examples/Footer";
import ProfilesList from "../../examples/Lists/ProfilesList";
import DefaultProjectCard from "../../examples/Cards/ProjectCards/DefaultProjectCard";

import Header from "../../layouts/profile/components/Header";
import PlatformSettings from "../../layouts/profile/components/PlatformSettings";

import { supabase } from "../../SupabaseClient";
import { useSavedPins } from "components/SavedPinsContext";

// slugify helper
const slugify = (str = "") =>
  str
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^\w-]/g, "");

export default function Overview() {
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState("");
  const isEditing = activeTab === 2;

  const [formValues, setFormValues] = useState({
    full_name: "",
    mobile: "",
    email: "",
    location: "",
    description: "",
    facebook_url: "",
    instagram_url: "",
    background_url: "",
  });

  const { pins, remove } = useSavedPins();

  // Seed form state from Supabase profile row
  const seedForm = (data) => {
    setFormValues({
      full_name: data.full_name || "",
      mobile: data.mobile || "",
      email: data.email || "",
      location: data.location || "",
      description: data.description || data.bio || "",
      facebook_url: data.facebook_url || "",
      instagram_url: data.instagram_url || "",
      background_url: data.background_url || "",
    });
    setAvatarUrl(data.avatar_url || "");
  };

  // Fetch current user's profile
  async function fetchProfile() {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return setProfile(null);

    const { data } = await supabase
      .from("profiles")
      .select("*, avatar_url, background_url")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
      seedForm(data);
    }
  }

  // Subscribe to auth changes and clean up correctly
  useEffect(() => {
    fetchProfile();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) fetchProfile();
      else setProfile(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleChange = (field) => (e) =>
    setFormValues((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    const updates = {
      user_id: profile.user_id,
      full_name: formValues.full_name,
      mobile: formValues.mobile,
      email: formValues.email,
      location: formValues.location,
      background_url: formValues.background_url,
      avatar_url: avatarUrl,
      description: formValues.description,
    };
    const { data, error } = await supabase
      .from("profiles")
      .upsert(updates, { onConflict: "user_id" })
      .select()
      .single();
    if (error) return console.error(error);
    setProfile(data);
    seedForm(data);
    setActiveTab(0);
  };

  if (!profile) {
    return (
      <DashboardLayout>
        <MDBox p={4}>
          <MDTypography variant="h5" align="center">
            Loading profile...
          </MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  // Remove saved‐pin: delete join, decrement count, update context
  const handleRemove = async (pin) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1) delete junction row
    await supabase
      .from("list_pins")
      .delete()
      .eq("pin_id", pin.id)
      .eq("user_id", user.id);

    // 2) decrement saved_count
    await supabase
      .from("pins")
      .update({ saved_count: Math.max((pin.saved_count || 1) - 1, 0) })
      .eq("id", pin.id);

    // 3) remove locally
    remove(pin);
  };

  // Build the ProfilesList items for each saved pin
  const savedPinsProfiles = pins.map((p) => {
    const name = p.Name || "Untitled";
    const rawDesc = String(p["Post Summary"] || p.Information || "");
    const description =
      rawDesc.length > 100 ? `${rawDesc.slice(0, 100)}…` : rawDesc;
    const mainImage =
      p["Main Image"] ||
      (Array.isArray(p.Images) && p.Images[0]) ||
      "";

    return {
      image: mainImage,
      name,
      description,
      action: {
        type: "internal",
        // adjust continent/country parts as needed
        route: `/Destinations/World_destinations/UnknownContinent/UnknownCountry/${slugify(name)}`,
        label: "Read More",
        color: "info",
      },
      onRemove: () => handleRemove(p),
    };
  });

  return (
    <>
      <StarField backgroundUrl={formValues.background_url || profile.background_url} />

      <DashboardLayout>
        <SimpleResponsiveNavbar />

        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          avatarUrl={avatarUrl}
          onAvatarChange={setAvatarUrl}
        >
          {/* Bio Hero */}
          <MDBox mt={2} mb={3} px={4} py={1} sx={{ textAlign: "center" }}>
            <MDTypography variant="h4" gutterBottom>
              About Me
            </MDTypography>
            {isEditing ? (
              <TextField
                fullWidth
                multiline
                rows={3}
                size="small"
                value={formValues.description}
                onChange={handleChange("description")}
                inputProps={{ style: { fontSize: "14px" } }}
                helperText="Edit your bio here"
              />
            ) : (
              <MDTypography variant="body1" sx={{ maxWidth: 600, mx: "auto" }}>
                {profile.description || profile.bio || "No bio set yet."}
              </MDTypography>
            )}
          </MDBox>
          <Divider />

          {/* Profile Info & Saved Pins */}
          <MDBox mt={5} mb={3}>
            <Grid container spacing={1}>
              {activeTab === 2 && (
                <Grid item xs={12} md={6} xl={4}>
                  <PlatformSettings />
                </Grid>
              )}

              <Grid item xs={12} md={6} xl={4} sx={{ display: "flex" }}>
                <Divider orientation="vertical" sx={{ ml: -1 }} />

                <MDBox
                  sx={{
                    p: 2,
                    width: "100%",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    background:
                      "linear-gradient(145deg, rgba(241,143,1,0.3) 0%, rgba(241,143,1,0) 100%)",
                    border: "1px solid rgba(255,255,255,0.6)",
                    boxShadow:
                      "inset 4px 4px 10px rgba(241,143,1,0.4), inset -4px -4px 10px rgba(241,143,1,0.1), 0 6px 15px rgba(241,143,1,0.3)",
                    borderRadius: "12px",
                  }}
                >
                  <MDTypography variant="h6" mb={2}>
                    Profile Information
                  </MDTypography>
                  {["full_name", "mobile", "email", "location"].map((field) => (
                    <MDBox key={field} mb={1}>
                      <MDTypography
                        variant="caption"
                        color="white"
                        sx={{ fontSize: "12px" }}
                      >
                        {field.replace(/_/g, " ").toUpperCase()}
                      </MDTypography>
                      {isEditing ? (
                        <TextField
                          fullWidth
                          size="small"
                          value={formValues[field]}
                          onChange={handleChange(field)}
                          inputProps={{ style: { fontSize: "14px" } }}
                        />
                      ) : (
                        <MDTypography sx={{ fontSize: "16px" }}>
                          {profile[field] || "—"}
                        </MDTypography>
                      )}
                    </MDBox>
                  ))}

                  {isEditing && (
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
                  )}
                </MDBox>

                <Divider orientation="vertical" sx={{ mx: 0 }} />
              </Grid>

              <Grid item xs={12} md={6} xl={activeTab === 2 ? 4 : 8}>
                <ProfilesList
                  title="Saved Pins"
                  profiles={savedPinsProfiles}
                  shadow={false}
                />
              </Grid>
            </Grid>
          </MDBox>

          {/* My Pins Section */}
          <MDBox pt={2} px={2} lineHeight={1.25}>
            <MDTypography variant="h6" fontWeight="medium">
              My Pins
            </MDTypography>
          </MDBox>
          <MDBox p={2}>
            <Grid container spacing={1}>
              <DefaultProjectCard />
            </Grid>
          </MDBox>
        </Header>

        <Footer />
      </DashboardLayout>
    </>
  );
}
