// src/components/PlaceConfigurator.jsx

import React, { useState, useEffect } from "react";
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
import outlined from "assets/theme/components/button/outlined";

// Add any additional countries you need here:
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
  onPlaceSelected,
  initialData = {},
  onActivateMapClick,
}) {
  // Define shared input height and styles
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
  const selectSx = {
    "& .MuiSelect-select": {
      height: inputHeight,
      boxSizing: "border-box",
      padding: "12px",
    },
  };

  const [controller, dispatch] = useMaterialUIController();
  const { openConfigurator, darkMode } = controller;

  const [selectedPlace, setSelectedPlace] = useState(initialData);
  const [searchCountry, setSearchCountry] = useState(initialCountryCode || "");

  const [form, setForm] = useState({
    Name: "",
    Latitude: "",
    Longitude: "",
    countryName: "",
    City: "",
    Category: "",
    Information: "",
    Ranking: "",
    "Average Costs": "",
    "Post Summary": "",
  });

  const handleClose = () => setOpenConfigurator(dispatch, false);

  const handlePlaceSelected = (place) => {
    setSelectedPlace(place);
    onPlacePick?.(place);
  };

  const handleCountryChange = (e) => {
    setSearchCountry(e.target.value);
    setSelectedPlace(null);
    setForm((f) => ({
      ...f,
      Name: "",
      Latitude: "",
      Longitude: "",
      countryName: "",
      City: "",
    }));
  };

  const handleCancelForm = () => setSelectedPlace(null);

  const handleSubmitForm = (formData) => {
    console.log("Submitted pin data:", formData);
    onPlaceSelected?.(formData);
    setSelectedPlace(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  useEffect(() => {
    if (selectedPlace) {
      console.log("Selected place payload:", selectedPlace);
      setForm((prev) => ({
        ...prev,
        Name: selectedPlace.landmark || "",
        Latitude: selectedPlace.lat || "",
        Longitude: selectedPlace.lng || "",
        countryName: selectedPlace.country || "",
        City: selectedPlace.city || "",
      }));
    }
  }, [selectedPlace]);

  useEffect(() => {
    if (initialData) {
      setSelectedPlace(initialData);
    }
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
        width: 360,
        maxWidth: "80vw",
        height: "100vh",
      }
    }}
    ownerState={{ openConfigurator }}
    >
      <MDBox
        display="flex"
        justifyContent="space-between"
        alignItems="baseline"
        pt={4}
        pb={0.5}
        px={3}
      >
        <MDTypography variant="h5">
          {selectedPlace ? "Create a New Pin" : "Create a New Pin"}
        </MDTypography>
        <Icon
          sx={({ typography: { size }, palette: { dark, white } }) => ({
            fontSize: `${size.lg} !important`,
            color: darkMode ? white.main : dark.main,
            stroke: "currentColor",
            strokeWidth: "2px",
            cursor: "pointer",
            transform: "translateY(5px)",
          })}
          onClick={handleClose}
        >
          close
        </Icon>
      </MDBox>
      <Divider />
      <MDBox pt={0} pb={3} px={3}>
        <FormControl fullWidth variant="standard" sx={{ mb: 2 }}>
          <InputLabel id="search-country-label">Search Country</InputLabel>
          <Select
            labelId="search-country-label"
            value={searchCountry}
            onChange={handleCountryChange}
            label="Search Country"
            sx={{ height: "48px" }}
          >
            {COUNTRY_OPTIONS.map((opt) => (
              <MenuItem key={opt.code} value={opt.code} >
                {opt.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <PlaceSearch
          countryCode={searchCountry || null}
          accessToken={accessToken}
          onPlaceSelected={handlePlaceSelected}
          onActivateMapClick={onActivateMapClick}
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitForm(form);
          }}
        >
          <MDBox display="flex" flexDirection="column" gap={2}>
            <TextField
              fullWidth
              label="Title"
              name="Name"
              value={form.Name}
              onChange={handleChange}
              required
              sx={{ mt: 1, ...outlinedInputSx }}
            />
            <TextField
              fullWidth
              label="Post Summary"
              name="Post Summary"
              value={form["Post Summary"]}
              onChange={handleChange}
              sx={outlinedInputSx}
            />
            <TextField
              fullWidth
              label="Latitude"
              name="Latitude"
              value={form.Latitude}
              onChange={handleChange}
              required
              sx={{
                ...outlinedInputSx,
                display: "none",
              }}

            />
            <TextField
              fullWidth
              label="Longitude"
              name="Longitude"
              value={form.Longitude}
              onChange={handleChange}
              required
              sx={{
                ...outlinedInputSx,
                display: "none",
              }}
            />
            <TextField
              fullWidth
              label="Country"
              name="countryName"
              value={form.countryName}
              onChange={handleChange}
              sx={{
                ...outlinedInputSx,
                display: "none",
              }}
            />
            <TextField
              fullWidth
              label="City"
              name="City"
              value={form.City}
              onChange={handleChange}
              sx={outlinedInputSx}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                name="Category"
                value={form.Category}
                onChange={handleChange}
                label="Category"
                sx={{ height: "48px"}}
              >
                <MenuItem value="Category1">Category1</MenuItem>
                <MenuItem value="Category2">Category2</MenuItem>
                <MenuItem value="Category3">Category3</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Information"
              name="Information"
              value={form.Information}
              onChange={handleChange}
              multiline
              rows={2}
              sx={{
                "& .MuiInputBase-input": {
                  padding: "12px",
                },
              }}
            />
            <TextField
              fullWidth
              label="Ranking"
              name="Ranking"
              value={form.Ranking}
              onChange={handleChange}
              type="number"
              sx={outlinedInputSx}
            />
            <TextField
              fullWidth
              label="Average Costs"
              name="Average Costs"
              value={form["Average Costs"]}
              onChange={handleChange}
              type="number"
              sx={outlinedInputSx}
            />

            <Button variant="contained" type="submit" color="primary">
              Save Pin
            </Button>
            <Button
              variant="outlined"
              type="button"
              onClick={handleCancelForm}
              color="secondary"
            >
              Cancel
            </Button>
          </MDBox>
        </form>
      </MDBox>
    </ConfiguratorRoot>
  );
}
