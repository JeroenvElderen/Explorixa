// src/components/PlaceConfigurator.jsx

import React, { useState, useEffect, useRef } from "react";
import ConfiguratorRoot from "examples/Configurator/ConfiguratorRoot";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Icon from "@mui/material/Icon";
import Divider from "@mui/material/Divider";
import PlaceSearch from "components/PlaceSearch";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import { useTheme } from "@mui/material/styles";

import { useMaterialUIController, setOpenConfigurator } from "context";
import { supabase } from "../SupabaseClient";
import { v4 as uuidv4 } from "uuid";
import zIndex from "@mui/material/styles/zIndex";

// storage bucket
const BUCKET = "pins-images";

const COUNTRY_OPTIONS = [
  { code: "", name: "All Countries" },
  { code: "se", name: "Sweden" },
  { code: "us", name: "United States" },
  { code: "de", name: "Germany" },
  { code: "fr", name: "France" },
  { code: "af", name: "Afghanistan" },
];

export default function PlaceConfigurator({
  countryCode: initialCountryCode,
  accessToken,
  onPlacePick,
  onActivateMapClick,
  initialData = {},
  onPlaceSelected,
  onCancel,
}) {
  const inputHeight = 48;
  const outlinedInputSx = {
    "& .MuiOutlinedInput-input": {
      height: inputHeight,
      boxSizing: "border-box",
      padding: "12px 14px",
    },
    "& .MuiOutlinedInput-root": {
      minHeight: inputHeight,
    },
  };

  const [controller, dispatch] = useMaterialUIController();
  const { openConfigurator, darkMode } = controller;
  const theme = useTheme();

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
    // hidden fields
    Latitude: "",
    Longitude: "",
    countryName: "",
    City: "",
  });

  // image refs + files
  const mainImageInputRef = useRef(null);
  const multiImageInputRef = useRef(null);
  const [mainImageFile, setMainImageFile] = useState(null);
  const [multiImageFiles, setMultiImageFiles] = useState([]);

  // open/close handlers
  const handleCancelForm = () => {
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
    setOpenConfigurator(dispatch, false);
    onCancel?.();
  };

  // upload helper
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

  // submit handler
  const handleSubmit = async (e) => {
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
        const urls = await Promise.all(multiImageFiles.map(uploadImage));
        payload.Images = urls.join(",");
      }
      const { error } = await supabase.from("pins").insert([payload]);
      if (error) throw error;
      alert("Pin saved!");
      window.location.reload();
      onPlaceSelected?.(payload);
      handleCancelForm();
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }
  };

  // sync selectedPlace → form
  useEffect(() => {
    if (selectedPlace) {
      setForm((f) => ({
        ...f,
        Name:(
      selectedPlace.name?.trim() ||
      selectedPlace.text?.trim() ||
      selectedPlace.address?.trim() ||    // ← new fallback
      selectedPlace.landmark?.trim() ||
      selectedPlace.category?.trim() ||
      ""
    ),
        Latitude: selectedPlace.lat,
        Longitude: selectedPlace.lng,
        countryName: selectedPlace.country,
        City: selectedPlace.city,
      }));
    }
  }, [selectedPlace]);

  // update on initialData change
  useEffect(() => {
  if (initialData && Object.keys(initialData).length > 0) {
    setSelectedPlace(initialData);
  }
}, [initialData]);

  return (
    <ConfiguratorRoot
      variant="persistent"
      anchor="right"
      open={openConfigurator}
      onClose={handleCancelForm}
      ModalProps={{ hideBackdrop: true, disablePortal: false }}
      sx={{
    // only restyle the inner paper element
    "& .MuiDrawer-paper": {
      backdropFilter: "blur(20px)",
      top: 15,
      right: 15,
      bottom: 15,
      height: "97vh",
      WebkitBackdropFilter: "blur(20px)",
      background:
        "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
      border: "1px solid rgba(255, 255, 255, 0.6)",
      boxShadow:
        "inset 4px 4px 10px rgba(0,0,0,0.4), inset -4px -4px 10px rgba(255,255,255,0.1), 0 6px 15px rgba(0,0,0,0.3)",
      borderRadius: "12px",
      overflow: "hidden",
    },
  }}
      PaperProps={{
        sx: {
          zIndex: 1200,
          pointerEvents: "auto",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          [theme.breakpoints.down("sm")]: {
            width: "calc(100vw - 30px) !important",
            maxWidth: "calc(100vw - 30px) !important",
            height: "calc(100vh - 30px) !important",
            
          },
          [theme.breakpoints.up("sm")]: {
            width: 400,
            maxWidth: "400px",
          }
        },
      }}
      ownerState={{ openConfigurator }}
    >
      {/* 1. Header */}
      <MDBox
        display="flex"
        justifyContent="space-between"
        alignItems="baseline"
        pt={{ xs: 2, sm: 4 }}
        pb={0.5}
        px={{ xs: 2, sm: 3 }}
      >
        <MDTypography
          variant="h5"
          sx={{ fontSize: { xs: "1.15rem", sm: "1.5rem" }, fontWeight: 600 }}
        >
          Create a New Pin
        </MDTypography>
        <Icon
          onClick={e => {
            e.stopPropagation();
            handleCancelForm();
          }}
        >
          Close
        </Icon>
      </MDBox>

      <Divider />

      {/* 2. Scrollable body */}
      <MDBox
        sx={{
          flex: 1,
          overflowY: "auto",
          pointerEvents: "auto",
        }}
        pt={0}
        pb={3}
        px={{ xs: 2, sm: 3 }}
      >
        {/* Country filter */}
        <FormControl fullWidth variant="standard" sx={{ mb: { xs: 1.5, sm: 2 } }}>
          <InputLabel id="search-country-label">Search Country</InputLabel>
          <Select
            labelId="search-country-label"
            value={searchCountry}
            onChange={(e) => {
              setSearchCountry(e.target.value);
              setSelectedPlace(null);
            }}
            sx={{ height: "48px" }}
          >
            {COUNTRY_OPTIONS.map((opt) => (
              <MenuItem key={opt.code} value={opt.code}>
                {opt.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Map search */}
        <PlaceSearch
          countryCode={searchCountry || null}
          accessToken={accessToken}
          onPlaceSelected={(p) => {
            setSelectedPlace(p);
            onPlacePick?.(p);
          }}
          onActivateMapClick={onActivateMapClick}
          inputClass="place-search-input"
          suggestionClass="place-search-suggestions"
        />

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <MDBox display="flex" flexDirection="column" gap={{ xs: 1.5, sm: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={form.Name}
              onChange={(e) => setForm({ ...form, Name: e.target.value })}
              required
              sx={{ mt: { xs: 1, sm: 2 }, ...outlinedInputSx }}
            />
            <TextField
              fullWidth
              label="Post Summary"
              value={form["Post Summary"]}
              onChange={(e) => setForm({ ...form, ["Post Summary"]: e.target.value })}
              sx={outlinedInputSx}
            />
            <input type="visible" name="Latitude" value={form.Latitude} />
            <input type="visible" name="Longitude" value={form.Longitude} />
            <input type="visible" name="countryName" value={form.countryName} />
            <TextField
              fullWidth
              label="City"
              value={form.City}
              onChange={(e) => setForm({ ...form, City: e.target.value })}
              sx={outlinedInputSx}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={form.Category}
                onChange={(e) => setForm({ ...form, Category: e.target.value })}
                sx={{ height: "48px" }}
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
              rows={2}
              sx={{ "& .MuiInputBase-input": { padding: "12px" }, ...outlinedInputSx }}
            />
            <MDBox display="flex" gap={2}>
              <TextField
                fullWidth
                label="Ranking"
                type="number"
                value={form.Ranking}
                onChange={(e) => setForm({ ...form, Ranking: e.target.value })}
                sx={outlinedInputSx}
              />
              <TextField
                fullWidth
                label="Average Costs"
                type="number"
                value={form["Average Costs"]}
                onChange={(e) => setForm({ ...form, ["Average Costs"]: e.target.value })}
                sx={outlinedInputSx}
              />
            </MDBox>
            <div>
              <Button onClick={() => mainImageInputRef.current.click()} sx={{ width: { xs: "100%", sm: "auto" }, mb: { xs: 1, sm: 0 }, textTransform: "none" }}>
                Upload Main Image
              </Button>
              <input type="file" accept="image/*" ref={mainImageInputRef} style={{ display: "none" }} onChange={(e) => setMainImageFile(e.target.files[0])} />
              {mainImageFile && <span style={{ fontSize: 13 }}>{mainImageFile.name}</span>}
            </div>
            <div>
              <Button onClick={() => multiImageInputRef.current.click()} sx={{ width: { xs: "100%", sm: "auto" }, mb: { xs: 1, sm: 0 }, textTransform: "none" }}>
                Upload Additional Images
              </Button>
              <input type="file" accept="image/*" multiple ref={multiImageInputRef} style={{ display: "none" }} onChange={(e) => setMultiImageFiles(Array.from(e.target.files))} />
              {multiImageFiles.length > 0 && <span style={{ fontSize: 13 }}>{multiImageFiles.map((f) => f.name).join(", ")}</span>}
            </div>
            <MDBox display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={{ xs: 1, sm: 2 }} mt={1}>
              <Button variant="contained" type="submit" sx={{ width: { xs: "100%", sm: "auto" }, mb: { xs: 1, sm: 0 }, fontWeight: 600 }}>
                Save Pin
              </Button>
              <Button variant="outlined" onClick={e => {e.stopPropagation(); handleCancelForm();}} sx={{ width: { xs: "100%", sm: "auto" }, fontWeight: 600 }}>
                Cancel
              </Button>
            </MDBox>

            {/* optional spacer to pad bottom */}
            <MDBox height={150} />
          </MDBox>
        </form>
      </MDBox>
    </ConfiguratorRoot>
  );
}
