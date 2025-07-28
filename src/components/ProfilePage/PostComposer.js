import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  Divider,
  TextField,
  Snackbar,
  Alert,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import WallpaperIcon from "@mui/icons-material/Wallpaper";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PlaceSearch from "./PlaceSearch";
import { supabase } from "SupabaseClient";

export default function PostComposer({ user, userId, accessToken, onClose }) {
  // ---- form state ----
  const [title, setTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [mainImage, setMainImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [saving, setSaving] = useState(false);

  // place‐related state
  const [showPlaceSearch, setShowPlaceSearch] = useState(false);
  const [city, setCity] = useState("");
  const [countryName, setCountryName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [iso, setIso] = useState("");
  const [address, setAddress] = useState("");

  // error indicators
  const [errorSnackOpen, setErrorSnackOpen] = useState(false);
  const [errorPopperOpen, setErrorPopperOpen] = useState(false);

  // hint tooltip (on mount)
  const [hintOpen, setHintOpen] = useState(false);

  // preview dialog
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [previewTitle, setPreviewTitle] = useState("");

  // refs to hidden file inputs
  const mainRef = useRef();
  const galleryRef = useRef();
  const locationBtnRef = useRef(null);

  // show hint tooltip once
  useEffect(() => {
    setHintOpen(true);
    const t = setTimeout(() => setHintOpen(false), 5000);
    return () => clearTimeout(t);
  }, []);

  // backdrop styles shared
  const backdropStyles = {
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    background:
      "linear-gradient(145deg, rgba(241,143,1,0.3) 0%, rgba(241,143,1,0) 100%)",
    border: "1px solid rgba(255,255,255,0.6)",
    boxShadow:
      "inset 4px 4px 10px rgba(241,143,1,0.4), inset -4px -4px 10px rgba(241,143,1,0.1), 0 6px 15px rgba(241,143,1,0.3)",
    borderRadius: "12px",
  };

  // helper to open preview dialog
  const openPreview = (files, title) => {
    previewFiles.forEach(URL.revokeObjectURL);
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviewFiles(urls);
    setPreviewTitle(title);
    setPreviewOpen(true);
  };
  const closePreview = () => {
    previewFiles.forEach(URL.revokeObjectURL);
    setPreviewOpen(false);
    setPreviewFiles([]);
  };

  // file handlers (no auto‑preview)
  const handleMainChange = (e) => {
    const f = e.target.files[0];
    if (f) setMainImage(f);
  };
  const handleGalleryChange = (e) => {
    const arr = Array.from(e.target.files);
    if (arr.length) setGalleryImages((prev) => prev.concat(arr));
  };

  // remove one gallery image by index
  const removeGalleryImage = (idx) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // save handler
  const handleSavePost = async () => {
    if (!latitude || !longitude) {
      setErrorSnackOpen(true);
      setErrorPopperOpen(true);
      setTimeout(() => setErrorPopperOpen(false), 3000);
      return;
    }
    if (!postContent.trim()) {
      alert("Please write something.");
      return;
    }
    setSaving(true);

    try {
      let mainImageUrl = null;
      const galleryUrls = [];

      // --- UPLOAD MAIN IMAGE ---
      if (mainImage) {
        const fileName = `${Date.now()}-${mainImage.name}`;
        const { data, error } = await supabase.storage
          .from("pins-images")
          .upload(fileName, mainImage);
        if (error) throw new Error("Main image upload failed");

        const { data: pu } = supabase.storage
          .from("pins-images")
          .getPublicUrl(data.path);

        mainImageUrl = pu.publicUrl;
      }

      // --- UPLOAD GALLERY IMAGES ---
      for (const file of galleryImages) {
        const fileName = `${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from("pins-images")
          .upload(fileName, file);
        if (!error) {
          const { data: pu } = supabase.storage
            .from("pins-images")
            .getPublicUrl(data.path);
          galleryUrls.push(pu.publicUrl);
        }
      }

      // --- INSERT PIN RECORD ---
      const { error: insertError } = await supabase
        .from("pins")
        .insert([
          {
            user_id: userId,
            Name: title || "Untitled Post",
            Information: postContent,
            "Main Image": mainImageUrl,
            Images: JSON.stringify(galleryUrls),
            City: city || null,
            countryName: countryName || null,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            iso: iso || null,
            address: address || null,
          },
        ]);
      if (insertError) throw insertError;

      alert("Post saved successfully!");

      // reset form
      setTitle("");
      setPostContent("");
      setMainImage(null);
      setGalleryImages([]);
      setShowPlaceSearch(false);
      setCity("");
      setCountryName("");
      setLatitude("");
      setLongitude("");
      setIso("");
      setAddress("");
      onClose?.();
    } catch (err) {
      console.error(err);
      alert("Failed to save post.");
    }

    setSaving(false);
  };

  return (
    <Box sx={{ ...backdropStyles, p: 3, position: "relative" }}>
      {/* Close */}
      <Button
        onClick={onClose}
        sx={{
          position: "absolute",
          top: 13,
          right: 26,
          minWidth: 0,
          p: 0,
          color: "#aaa",
          fontSize: "1.2rem",
        }}
      >
        ×
      </Button>

      {/* Avatar + Name */}
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <Box sx={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden" }}>
          <img
            src={user?.avatar}
            alt={user?.full_name || "avatar"}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Box>
        <Typography fontWeight={600} color="#fff">
          {user?.full_name || "You"}
        </Typography>
      </Stack>

      {/* Title */}
      <TextField
        fullWidth
        variant="outlined"
        label="Title"
        placeholder="Give your post a title…"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{
          mb: 2,
          bgcolor: "transparent",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
          "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
          "& .MuiOutlinedInput-input": { color: "#fff" },
        }}
      />

      {/* Hidden fields */}
      <input type="hidden" name="countryName" value={countryName} />
      <input type="hidden" name="City" value={city} />
      <input type="hidden" name="latitude" value={latitude} />
      <input type="hidden" name="longitude" value={longitude} />
      <input type="hidden" name="iso" value={iso} />
      <input type="hidden" name="address" value={address} />

      {/* Content */}
      <TextField
        fullWidth
        multiline
        minRows={4}
        placeholder="What's on your mind?"
        value={postContent}
        onChange={(e) => setPostContent(e.target.value)}
        variant="outlined"
        InputProps={{
          sx: {
            bgcolor: "transparent",
            color: "#fff",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.5)" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#F18F01" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#F18F01" },
          },
        }}
        sx={{
          mb: 2,
          "& .MuiInputBase-input": { fontSize: "14px", padding: "12px" },
        }}
      />

      {/* PlaceSearch */}
      <Box mb={2} sx={{ display: showPlaceSearch ? "block" : "none" }}>
        <PlaceSearch
          accessToken={accessToken}
          countryCode={null}
          onPlaceSelected={(place) => {
            if (!title.trim())
              setTitle(place.landmark || place.address || place.city || "");
            setCity(place.city || "");
            setCountryName(place.country || "");
            setLatitude(place.lat?.toString() || "");
            setLongitude(place.lng?.toString() || "");
            setIso(place.iso || "");
            setAddress(place.address || "");
            setShowPlaceSearch(false);
          }}
        />
      </Box>

      <Divider sx={{ my: 2, borderColor: "#333" }} />

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} mb={2}>
        <Button
          variant="outlined"
          startIcon={<WallpaperIcon />}
          onClick={() =>
            mainImage ? openPreview([mainImage], "Main Image") : mainRef.current.click()
          }
          sx={{ flex: 1, color: "#F18F01", borderColor: "#F18F01" }}
        >
          Main image
        </Button>
        <Button
          variant="outlined"
          startIcon={<PhotoLibraryIcon />}
          onClick={() =>
            galleryImages.length
              ? openPreview(galleryImages, "Gallery Images")
              : galleryRef.current.click()
          }
          sx={{ flex: 1, color: "#F18F01", borderColor: "#F18F01" }}
        >
          Photo/video
        </Button>
        <Tooltip
          title="Location required!"
          arrow
          open={errorPopperOpen}
          placement="top-start"
          componentsProps={{
            tooltip: { sx: { bgcolor: "warning.main", color: "warning.contrastText" } },
            arrow: { sx: { color: "warning.main" } },
          }}
        >
          <Button
            variant="outlined"
            startIcon={<LocationOnIcon />}
            onClick={() => {
              setShowPlaceSearch((v) => !v);
              setHintOpen(false);
            }}
            ref={locationBtnRef}
            sx={{ flex: 1, color: "#F18F01", borderColor: "#F18F01" }}
          >
            Location
          </Button>
        </Tooltip>
      </Stack>

      {/* Post button + snack */}
      <Button
        variant="contained"
        fullWidth
        onClick={handleSavePost}
        disabled={saving}
        sx={{ backgroundColor: "#F18F01", color: "#000" }}
      >
        {saving ? "Saving…" : "Post"}
      </Button>

      <Snackbar
        open={errorSnackOpen}
        autoHideDuration={3000}
        onClose={() => setErrorSnackOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setErrorSnackOpen(false)}
          severity="warning"
          sx={{ width: "100%" }}
        >
          Location required!
        </Alert>
      </Snackbar>

      {/* Hidden file inputs */}
      <input
        ref={mainRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleMainChange}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={handleGalleryChange}
      />

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={closePreview}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: backdropStyles }}
      >
        <DialogTitle>{previewTitle}</DialogTitle>
        <DialogContent dividers sx={{ position: "relative", p: 2 }}>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {previewFiles.map((url, i) => (
              <Box key={i} sx={{ position: "relative" }}>
                <Box
                  component="img"
                  src={url}
                  sx={{
                    width: previewFiles.length > 1 ? 100 : "100%",
                    height: previewFiles.length > 1 ? 100 : "auto",
                    objectFit: "cover",
                    borderRadius: 1,
                  }}
                />
                {previewTitle === "Gallery Images" && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      removeGalleryImage(i);
                      closePreview();
                      openPreview(
                        galleryImages.filter((_, idx) => idx !== i),
                        previewTitle
                      );
                    }}
                    sx={{
                      position: "absolute",
                      top: 2,
                      right: 2,
                      bgcolor: "rgba(0,0,0,0.5)",
                      color: "#fff",
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          {previewTitle === "Main Image" && (
            <Button onClick={() => mainRef.current.click()}>Change Image</Button>
          )}
          {previewTitle === "Gallery Images" && (
            <Button onClick={() => galleryRef.current.click()}>Add Images</Button>
          )}
          <Button onClick={closePreview}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
