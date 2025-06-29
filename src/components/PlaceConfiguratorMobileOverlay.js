// src/components/PlaceConfiguratorMobileOverlay.jsx

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Slide,
  Divider,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ConfiguratorRoot from "examples/Configurator/ConfiguratorRoot"; // only if you still need some shared styles
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import PlaceSearch from "components/PlaceSearch";
import { useTheme } from "@mui/material/styles";
import { useMaterialUIController, setOpenConfigurator } from "context";
import { supabase } from "../SupabaseClient";
import { v4 as uuidv4 } from "uuid";

const BUCKET = "pins-images";
const COUNTRY_OPTIONS = [
  { code: "", name: "All Countries" },
  { code: "se", name: "Sweden" },
  { code: "us", name: "United States" },
  { code: "de", name: "Germany" },
  { code: "fr", name: "France" },
  { code: "af", name: "Afghanistan" },
];

// Transition for full-screen Dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function PlaceConfiguratorMobileOverlay({
  open,
  onClose,
  countryCode: initialCountryCode,
  accessToken,
  onPlacePick,
  onActivateMapClick,
  initialData = {},
  onPlaceSelected,
  onCancel,
}) {
  const theme = useTheme();
  const [controller, dispatch] = useMaterialUIController();
  const [, setController] = useMaterialUIController();
  const [selectedPlace, setSelectedPlace] = useState(initialData);
  const [searchCountry, setSearchCountry] = useState(initialCountryCode || "");
  const [form, setForm] = useState({
    Name: "",
    "Post Summary": "",
    Information: "",
    Category: "",
    Ranking: "",
    "Average Costs": "",
    MainImage: "",
    Images: [],
    Latitude: "",
    Longitude: "",
    countryName: "",
    City: "",
  });
  const mainImageInputRef = useRef(null);
  const multiImageInputRef = useRef(null);
  const [mainImageFile, setMainImageFile] = useState(null);
  const [multiImageFiles, setMultiImageFiles] = useState([]);

  // Reset form when closed
  useEffect(() => {
    if (!open) {
      setSelectedPlace(null);
      setForm({
        Name: "",
        "Post Summary": "",
        Information: "",
        Category: "",
        Ranking: "",
        "Average Costs": "",
        MainImage: "",
        Images: [],
        Latitude: "",
        Longitude: "",
        countryName: "",
        City: "",
      });
      setMainImageFile(null);
      setMultiImageFiles([]);
    }
  }, [open]);

  // sync selectedPlace → form fields
  useEffect(() => {
    if (selectedPlace) {
      setForm((f) => ({
        ...f,
        Name:
          selectedPlace.text?.length
            ? selectedPlace.text
            : selectedPlace.name || selectedPlace.landmark || "",
        Latitude: selectedPlace.lat,
        Longitude: selectedPlace.lng,
        countryName: selectedPlace.country,
        City: selectedPlace.city,
      }));
    }
  }, [selectedPlace]);

  const uploadImage = async (file) => {
    const ext = file.name.split(".").pop();
    const path = `${uuidv4()}.${ext}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlace?.lat || !selectedPlace?.lng) {
      alert("Please choose a place on the map first.");
      return;
    }
    try {
      const payload = {
        Name: form.Name,
        "Post Summary": form["Post Summary"],
        Information: form.Information,
        Category: form.Category,
        Ranking: form.Ranking || null,
        "Average Costs": form["Average Costs"] || null,
        latitude: parseFloat(selectedPlace.lat),
        longitude: parseFloat(selectedPlace.lng),
        countryName: selectedPlace.country,
        City: selectedPlace.city,
      };
      if (mainImageFile) {
        payload["Main Image"] = await uploadImage(mainImageFile);
      }
      if (multiImageFiles.length) {
        payload.Images = (await Promise.all(multiImageFiles.map(uploadImage))).join(",");
      }
      const { error } = await supabase.from("pins").insert([payload]);
      if (error) throw error;
      alert("Pin saved!");
      onPlaceSelected?.(payload);
      onClose();
      onCancel?.();
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }
  };

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
    >
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
          <MDTypography variant="h6" component="div" sx={{ ml: 2, flex: 1 }}>
            Create a New Pin
          </MDTypography>
        </Toolbar>
      </AppBar>
      <Divider />
      <MDBox p={2}>
        <FormControl fullWidth variant="standard" sx={{ mb: 2 }}>
          <InputLabel id="mobile-search-country">Search Country</InputLabel>
          <Select
            labelId="mobile-search-country"
            value={searchCountry}
            onChange={(e) => {
              setSearchCountry(e.target.value);
              setSelectedPlace(null);
            }}
            sx={{ mb: 2 }}
          >
            {COUNTRY_OPTIONS.map((opt) => (
              <MenuItem key={opt.code} value={opt.code}>
                {opt.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <PlaceSearch
          countryCode={searchCountry || null}
          accessToken={accessToken}
          onPlaceSelected={(p) => {
            setSelectedPlace(p);
            onPlacePick?.(p);
          }}
          onActivateMapClick={onActivateMapClick}
        />

        <form onSubmit={handleFormSubmit}>
          <MDBox display="flex" flexDirection="column" gap={2} mt={2}>
            <TextField
              fullWidth
              label="Title"
              value={form.Name}
              onChange={(e) => setForm({ ...form, Name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Post Summary"
              value={form["Post Summary"]}
              onChange={(e) =>
                setForm({ ...form, "Post Summary": e.target.value })
              }
            />
            <TextField
              fullWidth
              label="City"
              value={form.City}
              onChange={(e) => setForm({ ...form, City: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={form.Category}
                onChange={(e) =>
                  setForm({ ...form, Category: e.target.value })
                }
              >
                <MenuItem value="Category1">Category1</MenuItem>
                <MenuItem value="Category2">Category2</MenuItem>
                <MenuItem value="Category3">Category3</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Information"
              value={form.Information}
              onChange={(e) => setForm({ ...form, Information: e.target.value })}
              multiline
              rows={3}
            />
            <MDBox display="flex" gap={2}>
              <TextField
                fullWidth
                label="Ranking"
                type="number"
                value={form.Ranking}
                onChange={(e) =>
                  setForm({ ...form, Ranking: e.target.value })
                }
              />
              <TextField
                fullWidth
                label="Average Costs"
                type="number"
                value={form["Average Costs"]}
                onChange={(e) =>
                  setForm({ ...form, "Average Costs": e.target.value })
                }
              />
            </MDBox>
            <div>
              <Button onClick={() => mainImageInputRef.current.click()}>
                Upload Main Image
              </Button>
              <input
                type="file"
                accept="image/*"
                ref={mainImageInputRef}
                style={{ display: "none" }}
                onChange={(e) => setMainImageFile(e.target.files[0])}
              />
              {mainImageFile && <span> {mainImageFile.name}</span>}
            </div>
            <div>
              <Button onClick={() => multiImageInputRef.current.click()}>
                Upload Additional Images
              </Button>
              <input
                type="file"
                accept="image/*"
                multiple
                ref={multiImageInputRef}
                style={{ display: "none" }}
                onChange={(e) =>
                  setMultiImageFiles(Array.from(e.target.files))
                }
              />
              {multiImageFiles.length > 0 && (
                <span> {multiImageFiles.map((f) => f.name).join(", ")}</span>
              )}
            </div>
            <MDBox display="flex" gap={2} mt={2}>
              <Button type="submit" variant="contained" fullWidth>
                Save Pin
              </Button>
              <Button variant="outlined" onClick={onClose} fullWidth>
                Cancel
              </Button>
            </MDBox>
          </MDBox>
        </form>
      </MDBox>
    </Dialog>
  );
}
