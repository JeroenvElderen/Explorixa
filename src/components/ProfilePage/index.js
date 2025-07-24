// src/components/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "SupabaseClient";
import {
  Box,
  Avatar,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  Typography,
  Divider
} from "@mui/material";
import FollowButton from "components/pinpage/FollowButton";
import StarField from "components/StarField";
import { useSavedPins } from "components/SavedPinsContext";
import ListDialog from "components/AddToList/AddToListDialog";
import SimpleResponsiveNavbar from "examples/Navbars/ResponsiveNavbar/allpage";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import PinActions from "./PinActions";
import ImageGridGallery from "./ImageGridGallery";
import ReorderIcon from "@mui/icons-material/Reorder";
import WindowIcon from "@mui/icons-material/Window";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import { line } from "stylis";
import HomeIcon from "@mui/icons-material/Home";
import LocationOnIcon from "@mui/icons-material/LocationOn";

export default function ProfilePage() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [pins, setPins] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPins, setLoadingPins] = useState(true);

  const [listDialogOpen, setListDialogOpen] = useState(false);
  const [dialogPin, setDialogPin] = useState(null);

  // 🔥 Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxSlides, setLightboxSlides] = useState([]);

  // 🔥 View mode state
  const [viewMode, setViewMode] = useState("list");

  const {
    pins: savedPins,
    save,
    remove,
    beenTherePins,
    saveBeenThere,
    removeBeenThere,
    wantToGoPins,
    saveWantToGo,
    removeWantToGo,
  } = useSavedPins();

  // Fetch profile
  useEffect(() => {
    supabase
      .from("profiles")
      .select(
        "user_id, Username, full_name, email, location, avatar_url, description, from_location"
      )
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
      .select(
        'id, Name, "Main Image", created_at, been_there, want_to_go, saved_count, Information, Images'
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setPins(data || []);
      })
      .finally(() => setLoadingPins(false));
  }, [userId]);

  const toggleBeenThere = async (pin) => {
    const next = !beenTherePins.some((p) => p.id === pin.id);
    const newCount = next
      ? (pin.been_there || 0) + 1
      : Math.max((pin.been_there || 1) - 1, 0);
    await supabase
      .from("pins")
      .update({ been_there: newCount })
      .eq("id", pin.id);
    next ? saveBeenThere(pin) : removeBeenThere(pin);
    setPins((arr) =>
      arr.map((p) => (p.id === pin.id ? { ...p, been_there: newCount } : p))
    );
  };

  const toggleWantToGo = async (pin) => {
    const next = !wantToGoPins.some((p) => p.id === pin.id);
    const newCount = next
      ? (pin.want_to_go || 0) + 1
      : Math.max((pin.want_to_go || 1) - 1, 0);
    await supabase
      .from("pins")
      .update({ want_to_go: newCount })
      .eq("id", pin.id);
    next ? saveWantToGo(pin) : removeWantToGo(pin);
    setPins((arr) =>
      arr.map((p) => (p.id === pin.id ? { ...p, want_to_go: newCount } : p))
    );
  };

  const handleSaveClick = (pin) => {
    setDialogPin(pin);
    setListDialogOpen(true);
  };

  const handleDialogSaved = () => {
    setPins((arr) =>
      arr.map((p) =>
        p.id === dialogPin.id
          ? { ...p, saved_count: (p.saved_count || 0) + 1 }
          : p
      )
    );
    save(dialogPin);
    setListDialogOpen(false);
    setDialogPin(null);
  };

  if (loadingProfile) {
    return (
      <DashboardLayout>
        <SimpleResponsiveNavbar />
        <MDBox textAlign="center" mt={6}>
          <CircularProgress />
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <SimpleResponsiveNavbar />
        <MDBox textAlign="center" mt={6}>
          <MDTypography variant="h5">User not found.</MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  // Group pins by year
  const pinsByYear = pins.reduce((acc, pin) => {
    const year = new Date(pin.created_at).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(pin);
    return acc;
  }, {});

  // Sort years descending
  const sortedYears = Object.keys(pinsByYear)
    .map(Number)
    .sort((a, b) => b - a);

  // Group pins by month and year (for grid view)
  const pinsByMonthYear = pins.reduce((acc, pin) => {
    const d = new Date(pin.created_at);
    const month = d.toLocaleString("default", { month: "long" });
    const year = d.getFullYear();
    const key = `${month} ${year}`; // e.g. "July 2025"
    if (!acc[key]) acc[key] = [];
    acc[key].push(pin);
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <SimpleResponsiveNavbar />
      <StarField />

      <MDBox px={2} py={4} maxWidth="100vw" mx="auto">
        {/* Profile Card */}
        <Card
          sx={{
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            background:
              "linear-gradient(145deg, rgba(241, 143, 1, 0.3) 0%, rgba(241,143,1,0) 100%)",
            border: "1px solid rgba(255,255,255,0.6)",
            boxShadow:
              "inset 4px 4px 10px rgba(241,143,1,0.4), inset -4px -4px 10px rgba(241,143,1,0.1), 0 6px 15px rgba(241,143,1,0.3)",
            borderRadius: "12px",
            p: 3,
            mb: 4,
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar src={profile.avatar_url} sx={{ width: 80, height: 80 }} />
              <Box>
                <MDTypography variant="h5">
                  @{profile.Username || profile.full_name || "Unknown User"}
                </MDTypography>
              </Box>
              <FollowButton authorId={profile.user_id} />
            </Box>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* Profile Info */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                background:
                  "linear-gradient(145deg, rgba(241,143,1,0.3) 0%, rgba(241,143,1,0) 100%)",
                border: "1px solid rgba(255,255,255,0.6)",
                boxShadow:
                  "inset 4px 4px 10px rgba(241,143,1,0.4), inset -4px -4px 10px rgba(241,143,1,0.1), 0 6px 15px rgba(241,143,1,0.3)",
                borderRadius: "12px",
                p: 3,
              }}
            >
              <MDTypography variant="h6" mb={2}>
                Intro
              </MDTypography>
               <MDTypography variant="body1" fontSize="14px" textAlign="center">
                  {profile.description}
                </MDTypography>
                <Divider sx={{ backgroundColor: "#F18F01", height: 2, my: 2 }} />
              {/* Location Home Icon */}
              <MDBox display="flex"alignItems="center"mb={1}>
                <HomeIcon sx={{ fontSize: 16, color: "#F18F01", mr: 1 }} />
                <MDTypography sx={{ fontSize: "16px"}}>
                  Lives in {profile.location || "-"}
                </MDTypography>
              </MDBox>
              {/* From (Map pin icon) */}
              <MDBox display="flex" alignItems="center" mb={1}>
                <LocationOnIcon sx={{ fontSize: 16, color: "#F18F01", mr: 1 }} />
                <MDTypography sx={{ fontSize: "16px" }}>
                  From {profile.from_location || "-"}
                </MDTypography>
              </MDBox>
            </Card>
            
            <Card
              sx={{
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                background:
                  "linear-gradient(145deg, rgba(241,143,1,0.3) 0%, rgba(241,143,1,0) 100%)",
                border: "1px solid rgba(255,255,255,0.6)",
                boxShadow:
                  "inset 4px 4px 10px rgba(241,143,1,0.4), inset -4px -4px 10px rgba(241,143,1,0.1), 0 6px 15px rgba(241,143,1,0.3)",
                borderRadius: "12px",
                p: 3,
              }}
            >
              <MDTypography variant="h6" mb={2}>
                Intro
              </MDTypography>
               <MDTypography variant="body1" fontSize="14px" textAlign="center">
                  {profile.description}
                </MDTypography>
                <Divider sx={{ backgroundColor: "#F18F01", height: 2, my: 2 }} />
              {/* Location Home Icon */}
              <MDBox display="flex"alignItems="center"mb={1}>
                <HomeIcon sx={{ fontSize: 16, color: "#F18F01", mr: 1 }} />
                <MDTypography sx={{ fontSize: "16px"}}>
                  Lives in {profile.location || "-"}
                </MDTypography>
              </MDBox>
              {/* From (Map pin icon) */}
              <MDBox display="flex" alignItems="center" mb={1}>
                <LocationOnIcon sx={{ fontSize: 16, color: "#F18F01", mr: 1 }} />
                <MDTypography sx={{ fontSize: "16px" }}>
                  From {profile.from_location || "-"}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>

              
          {/* Pins */}
          <Grid item xs={12} md={8}>
            {/* Posts Header */}
            <Box
              mb={2}
              sx={{
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                background:
                  "linear-gradient(145deg, rgba(241,143,1,0.3) 0%, rgba(241,143,1,0) 100%)",
                border: "1px solid rgba(255,255,255,0.6)",
                boxShadow:
                  "inset 4px 4px 10px rgba(241,143,1,0.4), inset -4px -4px 10px rgba(241,143,1,0.1), 0 6px 15px rgba(241,143,1,0.3)",
                borderRadius: "12px",
                p: 3,
              }}
            >
              <MDTypography variant="h5" color="white" mb={1}>
                Pins
              </MDTypography>

              <Box
                display="flex"
                gap={3}
                borderBottom="1px solid #444"
                justifyContent={"center"}
              >
                <Box
                  onClick={() => setViewMode("list")}
                  sx={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    pb: 1,
                    cursor: "pointer",
                    borderBottom:
                      viewMode === "list"
                        ? "3px solid #F18F01"
                        : "3px solid transparent",
                    color: viewMode === "list" ? "#F18F01" : "#aaa",
                    fontWeight: 500,
                    fontSize: "14px",
                  }}
                >
                  <ReorderIcon fontSize="small" /> List view
                </Box>

                <Box
                  onClick={() => setViewMode("grid")}
                  sx={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    pb: 1,
                    cursor: "pointer",
                    borderBottom:
                      viewMode === "grid"
                        ? "3px solid #F18F01"
                        : "3px solid transparent",
                    color: viewMode === "grid" ? "#F18F01" : "#aaa",
                    fontWeight: 500,
                    fontSize: "14px",
                  }}
                >
                  <WindowIcon fontSize="small" /> Grid view
                </Box>
              </Box>
            </Box>

            {loadingPins ? (
              <CircularProgress size={24} />
            ) : pins.length > 0 ? (
              viewMode === "list" ? (
                // Existing List View //
                <MDBox display="flex" flexDirection="column" gap={3}>
                  {pins.map((pin) => {
                    const isFav = savedPins.some((p) => p.id === pin.id);
                    const isBeenThere = beenTherePins.some(
                      (p) => p.id === pin.id
                    );
                    const isWantToGo = wantToGoPins.some(
                      (p) => p.id === pin.id
                    );
                    let imageUrls = [];

                    try {
                      const raw = pin.Images || "";
                      const parsed = JSON.parse(raw);

                      if (Array.isArray(parsed)) {
                        imageUrls = parsed.map((url) => url.trim());
                      } else {
                        imageUrls = raw.split(",").map((url) => url.trim());
                      }
                    } catch (e) {
                      imageUrls = (pin.Images || "")
                        .split(",")
                        .map((url) => url.trim());
                    }

                    const mainImage = pin["Main Image"]?.trim();
                    if (mainImage) {
                      imageUrls = [
                        mainImage,
                        ...imageUrls.filter((url) => url !== mainImage),
                      ];
                    }

                    return (
                      <Card
                        key={pin.id}
                        sx={{
                          backdropFilter: "blur(20px)",
                          WebkitBackdropFilter: "blur(20px)",
                          background:
                            "linear-gradient(145deg, rgba(241, 143, 1, 0.3) 0%, rgba(241,143,1,0) 100%)",
                          border: "1px solid rgba(255,255,255,0.6)",
                          boxShadow:
                            "inset 4px 4px 10px rgba(241,143,1,0.4), inset -4px -4px 10px rgba(241,143,1,0.1), 0 6px 15px rgba(241,143,1,0.3)",
                          borderRadius: "12px",
                          p: 3,
                          mb: 4,
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={2} mb={1}>
                          <Avatar src={profile.avatar_url} />
                          <Box>
                            <MDTypography variant="subtitle2">
                              {profile.full_name || profile.Username}
                            </MDTypography>
                            <MDTypography variant="caption" color="white">
                              {new Date(pin.created_at).toLocaleDateString()}
                            </MDTypography>
                          </Box>
                        </Box>

                        <MDTypography variant="h6">{pin.Name}</MDTypography>
                        <MDTypography variant="body2" sx={{ mb: 2 }}>
                          {pin.Information}
                        </MDTypography>

                        <Box mb={2}>
                          <ImageGridGallery
                            imageUrls={imageUrls}
                            onImageClick={(index) => {
                              setLightboxSlides(
                                imageUrls.map((src) => ({ src }))
                              );
                              setLightboxIndex(index);
                              setLightboxOpen(true);
                            }}
                          />
                        </Box>

                        <Box display="flex" gap={2} flexWrap="wrap">
                          <PinActions
                            isSaved={isFav}
                            savedCount={pin.saved_count || 0}
                            onSave={() => handleSaveClick(pin)}
                            isBeenThere={isBeenThere}
                            beenThereCount={pin.been_there || 0}
                            onBeenThere={() => toggleBeenThere(pin)}
                            isWantToGo={isWantToGo}
                            wantToGoCount={pin.want_to_go || 0}
                            onWantToGo={() => toggleWantToGo(pin)}
                          />
                        </Box>
                      </Card>
                    );
                  })}
                </MDBox>
              ) : (
                // ── new grid view ──
                <MDBox display="flex" flexDirection="column" gap={4}>
                  {Object.entries(pinsByMonthYear).map(
                    ([monthYear, monthPins]) => (
                      <Box key={monthYear}>
                        <MDTypography variant="h5" color="white" mb={2}>
                          {monthYear}
                        </MDTypography>
                        <Grid container spacing={3} alignItems="stretch">
                          {monthPins.map((pin) => {
                            // — reuse your image‐parsing logic from above —
                            let imageUrls = [];
                            try {
                              const parsed = JSON.parse(pin.Images || "[]");
                              imageUrls = Array.isArray(parsed)
                                ? parsed.map((u) => u.trim())
                                : [];
                            } catch {
                              imageUrls = (pin.Images || "")
                                .split(",")
                                .map((u) => u.trim());
                            }
                            const main = (pin["Main Image"] || "").trim();
                            if (main) {
                              imageUrls = [
                                main,
                                ...imageUrls.filter((u) => u !== main),
                              ];
                            }

                            return (
                              <Grid
                                item
                                xs={12}
                                sm={6}
                                md={4}
                                lg={3}
                                key={pin.id}
                                sx={{ display: "flex" }}
                              >
                                <Card
                                  sx={{
                                    backdropFilter: "blur(20px)",
                                    WebkitBackdropFilter: "blur(20px)",
                                    background:
                                      "linear-gradient(145deg, rgba(241, 143, 1, 0.3) 0%, rgba(241,143,1,0) 100%)",
                                    border: "1px solid rgba(255,255,255,0.6)",
                                    boxShadow:
                                      "inset 4px 4px 10px rgba(241,143,1,0.4), inset -4px -4px 10px rgba(241,143,1,0.1), 0 6px 15px rgba(241,143,1,0.3)",
                                    borderRadius: "12px",
                                    p: 0.5,
                                    mb: 4,
                                    display: "flex",
                                    flexDirection: "column",
                                    flex: 1,
                                  }}
                                >
                                  {/* 1) Collage of up to 4 images */}
                                  <Box
                                    sx={{
                                      width: "100%",
                                      height: 120,
                                      overflow: "hidden",
                                      borderRadius: "8px",
                                      mb: 1,
                                    }}
                                  >
                                    <ImageGridGallery
                                      imageUrls={imageUrls}
                                      onImageClick={(i) => {
                                        setLightboxSlides(
                                          imageUrls.map((src) => ({ src }))
                                        );
                                        setLightboxIndex(i);
                                        setLightboxOpen(true);
                                      }}
                                      sx={{ width: "100%", height: "100%" }}
                                    />
                                  </Box>
                                  {/* 2) Avatar + 2‑line clamp of text */}
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    gap={1}
                                    mt={1}
                                  >
                                    <Avatar
                                      src={profile.avatar_url}
                                      sx={{ width: 24, height: 24 }}
                                    />
                                    <MDTypography
                                      variant="body2"
                                      sx={{
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                        flexGrow: 1,
                                        fontSize: "12px",
                                        lineHeight: 1.2,
                                      }}
                                    >
                                      {pin.Information}
                                    </MDTypography>
                                  </Box>

                                  {/* 3) Date */}
                                  <MDTypography
                                    variant="caption"
                                    color="white"
                                    sx={{ display: "block", mt: 1, ml: 4, }}
                                  >
                                    {new Date(
                                      pin.created_at
                                    ).toLocaleDateString()}
                                  </MDTypography>
                                </Card>
                              </Grid>
                            );
                          })}
                        </Grid>
                      </Box>
                    )
                  )}
                </MDBox>
              )
            ) : (
              <MDTypography>No pins yet.</MDTypography>
            )}
          </Grid>
        </Grid>
      </MDBox>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
        index={lightboxIndex}
        plugins={[Thumbnails, Zoom]}
      />

      <ListDialog
        open={listDialogOpen}
        onClose={() => {
          setListDialogOpen(false);
          setDialogPin(null);
        }}
        pin={dialogPin}
        onSaved={handleDialogSaved}
      />

      <Footer />
    </DashboardLayout>
  );
}
