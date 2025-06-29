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

import { useMaterialUIController, setOpenConfigurator } from "context";
import { supabase } from "../SupabaseClient";
import { v4 as uuidv4 } from "uuid";

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

  // open/close
  const handleClose = () => setOpenConfigurator(dispatch, false);
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
      // build payload
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

      // upload main image
      if (mainImageFile) {
        payload["Main Image"] = await uploadImage(mainImageFile);
      }

      // upload additional images
      if (multiImageFiles.length) {
        const urls = await Promise.all(multiImageFiles.map(uploadImage));
        payload.Images = urls.join(",");
      }

      // insert into Supabase
      const { error } = await supabase.from("pins").insert([payload]);
      if (error) throw error;

      alert("Pin saved!");

      window.location.reload();

      onPlaceSelected?.(payload); // notify parent
      handleCancelForm();
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }
  };

  // sync selectedPlace → hidden form fields
  useEffect(() => {
    if (selectedPlace) {
      setForm((f) => ({
        ...f,
        Name:
          selectedPlace.text && selectedPlace.text.length
            ? selectedPlace.text
            : selectedPlace.name
            ? selectedPlace.name
            : selectedPlace.landmark || "",
        Latitude: selectedPlace.lat,
        Longitude: selectedPlace.lng,
        countryName: selectedPlace.country,
        City: selectedPlace.city,
      }));
    }
  }, [selectedPlace]);

  // if parent gives new initialData
  useEffect(() => {
    if (initialData) setSelectedPlace(initialData);
  }, [initialData]);

  return (
    <ConfiguratorRoot
      variant="temporary"
      anchor="right"
      open={openConfigurator}
      onClose={handleClose}
      ModalProps={{ hideBackdrop: true }}
      PaperProps={{
        sx: {
          pointerEvents: "auto",
        },
      }}
      sx={{
        pointerEvents: "none",
        "& .MuiDrawer-paper": {
          top: { xs: "20px", sm: "0px" },
          bottom: { xs: "20px", sm: "0px" },
          left: { xs: "20px", sm: "auto" },
          right: { xs: "20px", sm: "0px" },
          width: { xs: "92vw", sm: 380 },
          height: { xs: "calc(100vh - 20vh)", sm: "100vh" },
          pointerEvents: "auto",
          borderRadius: { xs: "25px", sm: "0px"}
        },
      }}
      ownerState={{ openConfigurator }}
    >
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
          sx={{
            fontSize: { xs: "1.15rem", sm: "1.5rem" },
            fontWeight: 600,
          }}
        >
          Create a New Pin
        </MDTypography>
        <Icon
          onClick={handleCancelForm}
          sx={({ typography: { size }, palette: { dark, white } }) => ({
            fontSize: `${size.lg} !important`,
            color: darkMode ? white.main : dark.main,
            cursor: "pointer",
            transform: "translateY(5px)",
          })}
        >
          close
        </Icon>
      </MDBox>
      <Divider />
      <MDBox pt={0} pb={3} px={{ xs: 2, sm: 3 }}>
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
              onChange={(e) =>
                setForm({ ...form, ["Post Summary"]: e.target.value })
              }
              sx={outlinedInputSx}
            />

            {/* hidden coords/country/city */}
            <input type="hidden" name="Latitude" value={form.Latitude} />
            <input type="hidden" name="Longitude" value={form.Longitude} />
            <input type="hidden" name="countryName" value={form.countryName} />

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
                onChange={(e) =>
                  setForm({ ...form, Category: e.target.value })
                }
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
              onChange={(e) =>
                setForm({ ...form, Information: e.target.value })
              }
              multiline
              rows={2}
              sx={{
                "& .MuiInputBase-input": { padding: "12px" },
                ...outlinedInputSx,
              }}
            />
          <MDBox
            display="flex"
            gap={2}
            >
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
              onChange={(e) =>
                setForm({ ...form, ["Average Costs"]: e.target.value })
              }
              sx={outlinedInputSx}
            />
            </MDBox>

            {/* Main image upload */}
            <div>
              <Button
                onClick={() => mainImageInputRef.current.click()}
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  mb: { xs: 1, sm: 0 },
                  textTransform: "none",
                }}
              >
                Upload Main Image
              </Button>
              <input
                type="file"
                accept="image/*"
                ref={mainImageInputRef}
                style={{ display: "none" }}
                onChange={(e) => setMainImageFile(e.target.files[0])}
              />
              {mainImageFile && <span style={{ fontSize: 13 }}> {mainImageFile.name} </span>}
            </div>

            {/* Additional images */}
            <div>
              <Button
                onClick={() => multiImageInputRef.current.click()}
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  mb: { xs: 1, sm: 0 },
                  textTransform: "none",
                }}
              >
                Upload Additional Images
              </Button>
              <input
                type="file"
                accept="image/*"
                multiple
                ref={multiImageInputRef}
                style={{ display: "none" }}
                onChange={(e) => setMultiImageFiles(Array.from(e.target.files))}
              />
              {multiImageFiles.length > 0 && (
                <span style={{ fontSize: 13 }}>
                  {multiImageFiles.map((f) => f.name).join(", ")}
                </span>
              )}
            </div>

            {/* Responsive button group */}
            <MDBox
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              gap={{ xs: 1, sm: 2 }}
              mt={1}
            >
              <Button
                variant="contained"
                type="submit"
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  mb: { xs: 1, sm: 0 },
                  fontWeight: 600,
                }}
              >
                Save Pin
              </Button>
              <Button
                variant="outlined"
                onClick={handleCancelForm}
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  fontWeight: 600,
                }}
              >
                Cancel
              </Button>
            </MDBox>
          </MDBox>
        </form>
      </MDBox>
    </ConfiguratorRoot>
  );
}
