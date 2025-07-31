// src/components/PinsSection.jsx
import React, { useState } from "react";
import {
  Box,
  Grid,
  Card,
  CircularProgress,
  Button,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ReorderIcon from "@mui/icons-material/Reorder";
import WindowIcon from "@mui/icons-material/Window";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import ImageGridGallery from "./ImageGridGallery";
import ReactMarkdown from "react-markdown";
import "./PinSection.css";
import { supabase } from "SupabaseClient";

const headerStyles = {
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  background:
    "linear-gradient(145deg, rgba(241,143,1,0.3) 0%, rgba(241,143,1,0) 100%)",
  border: "1px solid rgba(255,255,255,0.6)",
  boxShadow:
    "inset 4px 4px 10px rgba(241,143,1,0.), inset -4px -4px 10px rgba(241,143,1,0.1), 0 6px 15px rgba(241,143,1,0.3)",
  borderRadius: "12px",
  p: 3,
};

export default function PinsSection({
  pins,
  setPins, // make sure setPins is passed from parent to update state after deletion
  profile,
  loadingPins,
  openLightbox,
  isOwner = false,
  onEditClick,
}) {
  const [viewMode, setViewMode] = useState("list");
  const [expandedPinId, setExpandedPinId] = useState(null);

  const pinsByMonthYear = pins.reduce((acc, pin) => {
    const d = new Date(pin.created_at);
    const month = d.toLocaleString("default", { month: "long" });
    const year = d.getFullYear();
    const key = `${month} ${year}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(pin);
    return acc;
  }, {});

  if (!profile) return null;

  const handleDeleteClick = async (pin) => {
    if (!window.confirm("Are you sure you want to delete this pin?")) return;

    try {
      // 1. Delete the pin row from database
      const { error: deletePinError } = await supabase
        .from("pins")
        .delete()
        .eq("id", pin.id);

      if (deletePinError) {
        alert("Failed to delete pin: " + deletePinError.message);
        return;
      }

      // 2. Delete associated images from storage bucket "pins-images"
      // Assuming Images is JSON array or comma-separated URLs
      let imageUrls = [];
      try {
        const parsed = JSON.parse(pin.Images || "[]");
        imageUrls = Array.isArray(parsed)
          ? parsed.map((u) => u.trim())
          : [];
      } catch {
        imageUrls = (pin.Images || "").split(",").map((u) => u.trim());
      }

      // Add the main image as well if present and different from Images
      const mainImage = pin["Main Image"]?.trim();
      if (mainImage && !imageUrls.includes(mainImage)) {
        imageUrls.unshift(mainImage);
      }

      // Extract file paths from URLs by removing public URL prefix
      // Example: https://xyz.supabase.co/storage/v1/object/public/pins-images/filename.jpg
      // We want: pins-images/filename.jpg or just filename.jpg depending on your storage structure
      // Assuming your storage path is just the filename part after "pins-images/"
      const bucketFolder = "pins-images/";

      for (const url of imageUrls) {
        try {
          // Extract path inside bucket
          const pathIndex = url.indexOf(bucketFolder);
          if (pathIndex === -1) continue; // skip if not found

          const filePath = url.substring(pathIndex + bucketFolder.length);

          // Delete file from storage bucket
          const { error: deleteFileError } = await supabase.storage
            .from("pins-images")
            .remove([filePath]);

          if (deleteFileError) {
            console.warn(
              "Failed to delete image from storage:",
              filePath,
              deleteFileError.message
            );
          }
        } catch (err) {
          console.warn("Error deleting image file:", err);
        }
      }

      // 3. Remove the pin from local state to update UI
      setPins((prev) => prev.filter((p) => p.id !== pin.id));
      window.dispatchEvent(new CustomEvent("pinDeleted", { detail: pin.id }));
    } catch (err) {
      alert("Error deleting pin: " + err.message);
    }
  };

  return (
    <>
      <Box mb={2} sx={headerStyles}>
        <MDTypography variant="h5" color="white" mb={1}>
          Pins
        </MDTypography>
        <Box
          display="flex"
          gap={3}
          borderBottom="1px solid #444"
          justifyContent="center"
        >
          <Box
            onClick={() => {
              setViewMode("list");
              setExpandedPinId(null);
            }}
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
        <Box textAlign="center">
          <CircularProgress size={24} />
        </Box>
      ) : pins.length > 0 ? (
        viewMode === "list" ? (
          <MDBox display="flex" flexDirection="column" gap={0.05}>
            {pins.map((pin) => {
              let imageUrls = [];

              try {
                const raw = pin.Images || "";
                const parsed = JSON.parse(raw);
                imageUrls = Array.isArray(parsed)
                  ? parsed.map((u) => u.trim())
                  : raw.split(",").map((u) => u.trim());
              } catch {
                imageUrls = (pin.Images || "").split(",").map((u) => u.trim());
              }

              const main = pin["Main Image"]?.trim();
              if (main)
                imageUrls = [main, ...imageUrls.filter((u) => u !== main)];

              return (
                <Card
                  key={pin.id}
                  sx={{ ...headerStyles, p: 3, mb: 3, position: "relative" }}
                >
                  {isOwner && (
                    <>
                      <IconButton
                        size="small"
                        onClick={() => onEditClick(pin)}
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 40,
                          color: "#F18F01",
                          backgroundColor: "rgba(0,0,0,0.3)",
                          "&:hover": { backgroundColor: "rgba(0,0,0,0.5)" },
                        }}
                        aria-label="edit pin"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(pin)}
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          color: "#FF4D4F",
                          backgroundColor: "rgba(0,0,0,0.3)",
                          "&:hover": { backgroundColor: "rgba(0,0,0,0.5)" },
                        }}
                        aria-label="delete pin"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </>
                  )}

                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={
                          profile.avatar_url ||
                          "https://www.gravatar.com/avatar/?d=mp&s=150"
                        }
                        alt={profile.full_name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </Box>

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
                  <Box sx={{ mb: 2, color: "white", fontSize: "14px" }}>
                    <div className="react-markdown">
                      <ReactMarkdown breaks>{pin.Information}</ReactMarkdown>
                    </div>
                  </Box>

                  <Box mb={2}>
                    <ImageGridGallery
                      imageUrls={imageUrls}
                      height={300}
                      onImageClick={(i) =>
                        openLightbox(
                          imageUrls.map((src) => ({ src })),
                          i
                        )
                      }
                    />
                  </Box>
                </Card>
              );
            })}
          </MDBox>
        ) : (
          <MDBox display="flex" flexDirection="column" gap={4}>
            {expandedPinId ? (
              <>
                <Box sx={{ textAlign: "right" }}>
                  <Button
                    size="small"
                    onClick={() => setExpandedPinId(null)}
                    sx={{ mb: 2, textTransform: "none", color: "#F18F01" }}
                  >
                    ← Back to Grid
                  </Button>
                </Box>
                {(() => {
                  const pin = pins.find((p) => p.id === expandedPinId);
                  if (!pin) return null;

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
                  if (main)
                    imageUrls = [main, ...imageUrls.filter((u) => u !== main)];

                  return (
                    <Card sx={{ ...headerStyles, p: 3, position: "relative" }}>
                      {isOwner && (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => onEditClick(pin)}
                            sx={{
                              position: "absolute",
                              top: 8,
                              right: 40,
                              color: "#F18F01",
                              backgroundColor: "rgba(0,0,0,0.3)",
                              "&:hover": {
                                backgroundColor: "rgba(0,0,0,0.5)",
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(pin)}
                            sx={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              color: "#FF4D4F",
                              backgroundColor: "rgba(0,0,0,0.3)",
                              "&:hover": {
                                backgroundColor: "rgba(0,0,0,0.5)",
                              },
                            }}
                            aria-label="delete pin"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}

                      <Box display="flex" alignItems="center" gap={2} mb={1}>
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: "50%",
                            overflow: "hidden",
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={profile.avatar_url}
                            alt={profile.full_name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </Box>

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
                      <Box sx={{ mb: 2, color: "white", fontSize: "14px" }}>
                        <div className="react-markdown">
                          <ReactMarkdown breaks>
                            {pin.Information}
                          </ReactMarkdown>
                        </div>
                      </Box>

                      <Box mb={2}>
                        <ImageGridGallery
                          imageUrls={imageUrls}
                          height={300}
                          onImageClick={(i) =>
                            openLightbox(
                              imageUrls.map((src) => ({ src })),
                              i
                            )
                          }
                        />
                      </Box>
                    </Card>
                  );
                })()}
              </>
            ) : (
              Object.entries(pinsByMonthYear).map(([monthYear, monthPins]) => (
                <Box key={monthYear}>
                  <MDTypography variant="h5" color="white" mb={2}>
                    {monthYear}
                  </MDTypography>
                  <Grid container spacing={1} alignItems="stretch">
                    {monthPins.map((pin) => {
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
                      if (main)
                        imageUrls = [
                          main,
                          ...imageUrls.filter((u) => u !== main),
                        ];

                      return (
                        <Grid item xs={12} sm={6} md={4} key={pin.id}>
                          <Card
                            onClick={() => setExpandedPinId(pin.id)}
                            sx={{
                              cursor: "pointer",
                              ...headerStyles,
                              p: 0.5,
                              display: "flex",
                              flexDirection: "column",
                              flex: 1,
                            }}
                          >
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
                                height={120}
                                onImageClick={(i) =>
                                  openLightbox(
                                    imageUrls.map((src) => ({ src })),
                                    i
                                  )
                                }
                              />
                            </Box>
                            <Box
                              display="flex"
                              alignItems="center"
                              gap={1}
                              mt={1}
                            >
                              <Box
                                sx={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: "50%",
                                  overflow: "hidden",
                                  flexShrink: 0,
                                }}
                              >
                                <img
                                  src={profile.avatar_url}
                                  alt={profile.full_name}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              </Box>

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
                            <MDTypography
                              variant="caption"
                              color="white"
                              sx={{ display: "block", mt: 1, ml: 4.5 }}
                            >
                              {new Date(pin.created_at).toLocaleDateString()}
                            </MDTypography>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              ))
            )}
          </MDBox>
        )
      ) : (
        <MDTypography>No pins yet.</MDTypography>
      )}
    </>
  );
}
