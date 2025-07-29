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
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InputAdornment from "@mui/material/InputAdornment";
import WallpaperIcon from "@mui/icons-material/Wallpaper";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PlaceSearch from "./PlaceSearch";
import CurrencySelector from "components/PlaceConfigurator/CurrencySelector"; // <-- adjust path if needed
import { supabase } from "SupabaseClient";
import { upsertCityAndCountry } from "utils/dbHelpers";
import {
  COUNTRY_TO_CURRENCY,
  COUNTRY_OPTIONS,
} from "components/PlaceConfigurator/constants"; // <-- adjust path

const categories = ["Category1", "Category2", "Category3"]; // Replace with your actual categories

export default function PostComposer({ user, userId, accessToken, onClose }) {
  // States
  const [title, setTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [mainImage, setMainImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [saving, setSaving] = useState(false);

  const [showPlaceSearch, setShowPlaceSearch] = useState(false);
  const [city, setCity] = useState("");
  const [countryName, setCountryName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [iso, setIso] = useState("");
  const [address, setAddress] = useState("");

  // Currency state & anchor for menu
  const [currency, setCurrency] = useState("");
  const [currencyAnchor, setCurrencyAnchor] = useState(null);

  // New fields
  const [ranking, setRanking] = useState("");
  const [averageCosts, setAverageCosts] = useState("");
  const [category, setCategory] = useState("");

  // Error and UI states
  const [errorSnackOpen, setErrorSnackOpen] = useState(false);
  const [errorPopperOpen, setErrorPopperOpen] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [previewTitle, setPreviewTitle] = useState("");

  // Refs
  const mainRef = useRef();
  const galleryRef = useRef();
  const locationBtnRef = useRef(null);

  // Show hint tooltip once
  useEffect(() => {
    setHintOpen(true);
    const t = setTimeout(() => setHintOpen(false), 5000);
    return () => clearTimeout(t);
  }, []);

  // Backdrop styles
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

  // Preview dialog helpers
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

  // File handlers
  const handleMainChange = (e) => {
    const f = e.target.files[0];
    if (f) setMainImage(f);
  };
  const handleGalleryChange = (e) => {
    const arr = Array.from(e.target.files);
    if (arr.length) setGalleryImages((prev) => prev.concat(arr));
  };
  const removeGalleryImage = (idx) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // Currency selector handlers
  const handleCurrencyClick = (event) => {
    setCurrencyAnchor(event.currentTarget);
  };
  const handleCurrencyClose = () => {
    setCurrencyAnchor(null);
  };
  const handleCurrencySelect = (code) => {
    setCurrency(code);
    handleCurrencyClose();
  };

  // Auto-fill currency mapping example (extend as needed)
  const currencyMap = {
    USA: "USD",
    Germany: "EUR",
    // Add more country-to-currency mappings here
  };

  // Save post handler
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

      // Upload main image
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

      // Upload gallery images
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

      // Upsert city and country
      await upsertCityAndCountry(city, countryName);

      // Insert pin record
      const { error: insertError } = await supabase.from("pins").insert([
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
          Currency: currency || null,
          Ranking: ranking ? parseInt(ranking, 10) : null,
          "Average Costs": averageCosts ? parseFloat(averageCosts) : null,
          Category: category || null,
        },
      ]);
      if (insertError) throw insertError;

      alert("Post saved successfully!");

      // Reset all fields
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
      setCurrency("");
      setRanking("");
      setAverageCosts("");
      setCategory("");
      onClose?.();
    } catch (err) {
      console.error(err);
      alert("Failed to save post.");
    }

    setSaving(false);
  };

  return (
    <Box sx={{ ...backdropStyles, p: 3, position: "relative" }}>
      {/* Close button */}
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
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            overflow: "hidden",
          }}
        >
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
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.5)" },
          "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
          "& .MuiOutlinedInput-input": { color: "#fff" },
        }}
      />

      {/* Category Dropdown */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={category}
          label="Category"
          onChange={(e) => setCategory(e.target.value)}
          sx={{
            height: 48,
            "& .MuiSelect-select": {
              display: "flex",
              alignItems: "center",
              height: "100%",
              padding: "0 14px",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#rgba(255,255,255,0.5)",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#F18F01CC",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#F18F01",
            },
          }}
        >
          {categories.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Currency dropdown popup */}
      <CurrencySelector
        anchorEl={currencyAnchor}
        currency={currency}
        onSelect={handleCurrencySelect}
        onClose={handleCurrencyClose}
      />

      {/* Hidden Inputs */}
      <input type="hidden" name="iso" value={iso} />
      <input type="hidden" name="Currency" value={currency} />

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
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255,255,255,0.5)",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#F18F01",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#F18F01",
            },
          },
        }}
        sx={{
          mb: 2,
          "& .MuiInputBase-input": { fontSize: "14px", padding: "12px" },
        }}
      />

      {/* Ranking */}
      <TextField
        fullWidth
        label="Ranking"
        type="number"
        value={ranking}
        onChange={(e) => setRanking(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* Average Costs */}
      <TextField
        fullWidth
        label="Average Costs"
        type="number"
        value={averageCosts}
        onChange={(e) => setAverageCosts(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* Currency selector button */}
      <Button
        variant="outlined"
        onClick={handleCurrencyClick}
        sx={{ mb: 2, color: "#F18F01", borderColor: "#F18F01" }}
      >
        Currency: {currency || "Select"}
      </Button>

      {/* Currency selector popup */}
      <CurrencySelector
        anchorEl={currencyAnchor}
        currency={currency}
        onSelect={(code) => setCurrency(code)}
        onClose={() => setCurrencyAnchor(null)}
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

            console.log("Detected country:", place.country);
            const detectedCurrency = COUNTRY_TO_CURRENCY[place.country] || "";
            console.log("Detected currency:", detectedCurrency);
            setCurrency(detectedCurrency);

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
            mainImage
              ? openPreview([mainImage], "Main Image")
              : mainRef.current.click()
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
            tooltip: {
              sx: { bgcolor: "warning.main", color: "warning.contrastText" },
            },
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
            <Button onClick={() => mainRef.current.click()}>
              Change Image
            </Button>
          )}
          {previewTitle === "Gallery Images" && (
            <Button onClick={() => galleryRef.current.click()}>
              Add Images
            </Button>
          )}
          <Button onClick={closePreview}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
