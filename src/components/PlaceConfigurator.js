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
import imageCompression from "browser-image-compression";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";

import { useMaterialUIController, setOpenConfigurator } from "context";
import { supabase } from "../SupabaseClient";
import { v4 as uuidv4 } from "uuid";
import "../App.css";

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

// ── fetchContinent via Rest Countries ────────────────────────────────
async function fetchContinent(countryName) {
  // fullText=true gives the best chance to match exact name
  const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`;
  const res = await fetch(url);
  if (!res.ok) {
    console.warn("Rest Countries lookup failed for", countryName, res.status);
    return null;
  }
  const [record] = await res.json();
  // `region` is the continent (e.g. "Europe", "Asia")
  return record?.region || null;
}


export default function PlaceConfigurator({
  countryCode: initialCountryCode,
  userId,
  accessToken,
  onPlacePick,
  onActivateMapClick,
  initialData = {},
  onPlaceSelected,
  onCancel,
}) {
  const inputHeight = 48;
  const outlinedInputSx = {
    "& .MuiOutlinedInput-root": {
      minHeight: inputHeight,

      // default outline
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#F18F01",
      },

      // hover state
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "#F18F01CC",
      },

      // focused state
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#F18F01",
      },
    },

    "& .MuiOutlinedInput-input": {
      height: inputHeight,
      boxSizing: "border-box",
      padding: "12px 14px",
    },
  };

  const [controller, dispatch] = useMaterialUIController();
  const { openConfigurator, darkMode } = controller;
  const theme = useTheme();
  const [mainImageStatus, setMainImageStatus] = useState("idle");
  const [selectedPlace, setSelectedPlace] = useState(initialData);
  const [searchCountry, setSearchCountry] = useState(initialCountryCode || "");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
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

  // upload helper (with compression)
  const uploadImage = async (file) => {
    // 1) compress down to max 1000px width/height
    const compressedFile = await imageCompression(file, {
      maxWidthOrHeight: 1000,
      useWebWorker: true,
      // optional: adjust quality between 0.6–1.0
      initialQuality: 0.8,
    });

    // 2) build a UUID path (same as before)
    const ext = compressedFile.name.split(".").pop();
    const path = `${uuidv4()}.${ext}`;

    // 3) upload the compressed blob
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, compressedFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: compressedFile.type,
      });
    if (error) throw error;

    // 4) get the public URL
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
        user_id: userId,
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
        iso: selectedPlace.iso || null,
      };
      if (mainImageFile) {
        payload["Main Image"] = await uploadImage(mainImageFile);
      }
      if (multiImageFiles.length) {
        const urls = await Promise.all(multiImageFiles.map(uploadImage));
        payload.Images = urls.join(",");
      }

      // --- NEW: also insert/upsert into your `cities` table ---
      const cityPayload = {
        Name: selectedPlace.city,
        Country: selectedPlace.country
      };
      const { error: cityError } = await supabase
        .from("cities")
        .upsert([cityPayload], { onConflict: ["Name", "Country"] });
      if (cityError) throw cityError;


      // --- fetch continent dynamically and upsert countries ---
      let continent = null;
      try {
        continent = await fetchContinent(selectedPlace.country);
      } catch (err) {
        console.warn("Could not fetch continent:", err);
      }

      const countryPayload = {
        name: selectedPlace.country,
        continent,
      };
      const { error: countryError } = await supabase
        .from("countries")
        .upsert([countryPayload], { onConflict: ["name"] });
      if (countryError) throw countryError;

      const { error } = await supabase.from("pins").insert([payload]);
      if (error) throw error;
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
        Name: (
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
        City:
          selectedPlace.iso && selectedPlace.iso.toUpperCase() === "PEAK"
            ? ""
            : selectedPlace.city || "",



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
          border: "1px solid rgba(243, 143, 1, 0.6)",
          boxShadow:
            "inset 4px 4px 10px rgba(0,0,0,0.4), inset -4px -4px 10px rgba(255,255,255,0.1), 0 6px 15px rgba(0,0,0,0.3)",
          borderRadius: "12px",
          overflow: "hidden",
        },
      }}
      PaperProps={{
        sx: {
          zIndex: 1100,
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
          sx={{
            cursor: "pointer",
            color: "#F18F01",
            fontSize: "24px !important",
          }}
        >
          close
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
        pt={1}
        pb={3}
        px={{ xs: 2, sm: 3 }}
      >
        {/* Country filter */}
        <FormControl fullWidth variant="outlined" sx={{ mb: { xs: 1.5, sm: 2 } }}>
          <InputLabel
            id="search-country-label"
            sx={{
              color: "#fff",
              "&.Mui-focused": { color: "#fff" },
              "&.MuiInputLabel-shrink": { color: "#fff" },
            }}
          >
            Search Country
          </InputLabel>

          <Select
            labelId="search-country-label"
            label="Search Country"
            value={searchCountry}
            onChange={(e) => {
              setSearchCountry(e.target.value);
              setSelectedPlace(null);
            }}
            // --- outline styles ---
            sx={{
              height: "48px",
              width: "100%",
              // default outline
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#F18F01",
              },
              // hover outline
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#F18F01CC",
              },
              // focus outline
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#F18F01",
              },
            }}

            // --- menu (dropdown) styles ---
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: "rgba(241,143,1,1) !important",
                  border: "1px solid #F18F01",
                  mt: 1,
                  "& .MuiMenuItem-root": {
                    color: "#fff",
                  },
                  "& .MuiMenuItem-root:hover": {
                    bgcolor: "rgba(0,0,0,0.2)",
                  },
                  "& .MuiMenuItem-root.Mui-selected, & .MuiMenuItem-root[aria-selected='true']": {
                    bgcolor: "rgba(241,143,1,0.8)",
                    color: "white",
                  },
                },
              },
            }}
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
          onPlaceSelected={async (p) => {
            console.log("Mapbox result:", p);
            // 1) Pull out coordinates (Mapbox gives you p.center === [lng, lat])
            const [lng, lat] = Array.isArray(p.center)
              ? p.center
              : [p.lng, p.lat];

            // 2) Prepare Title & Address for your UI/payload
            const name = p.text || p.landmark || "";
            const address = p.place_name || "";

            // 3) Build the reverse-geocode URL WITHOUT encoding the comma
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${accessToken}`;
            console.log("Reverse-geocode URL:", url);


            // 4) Fetch & pick out country/place from the full feature stack
            let country = "", city = "";
            try {
              const res = await fetch(url);
              if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
              const { features = [] } = await res.json();
              // find the first feature of type "place" or "region"
              city = features.find(f => f.place_type.includes("place"))?.text
                || features.find(f => f.place_type.includes("region"))?.text
                || "";
              // find the first feature of type "country"
              country = features.find(f => f.place_type.includes("country"))?.text || "";
            } catch (err) {
              console.error("Reverse-geocode failed:", err);
            }

            // 5) Merge into your place object and fire off
            const enriched = { ...p, name, address, lat, lng, country, city };
            console.log("→ enriched place:", enriched);
            setSelectedPlace(enriched);
            onPlacePick?.(enriched);
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
              InputLabelProps={{
                sx: {
                  color: "#fff",
                  "&.Mui-focused": { color: "#fff" },
                  "&.MuiInputLabel-shrink": { color: "#fff" },
                },
              }}
              sx={{ mt: { xs: 1, sm: 2 }, ...outlinedInputSx }}
            />
            <TextField
              fullWidth
              label="Post Summary"
              value={form["Post Summary"]}
              onChange={(e) => setForm({ ...form, ["Post Summary"]: e.target.value })}
              InputLabelProps={{
                sx: {
                  color: "#fff",
                  "&.Mui-focused": { color: "#fff" },
                  "&.MuiInputLabel-shrink": { color: "#fff" },
                },
              }}
              sx={outlinedInputSx}
            />
            <input type="hidden" name="Latitude" value={form.Latitude} />
            <input type="hidden" name="Longitude" value={form.Longitude} />
            <TextField
              fullWidth
              label="Country"
              value={form.countryName}
              onChange={(e) => setForm({ ...form, countryName: e.target.value })}
              InputLabelProps={{
                sx: {
                  color: "#fff",
                  "&.Mui-focused": { color: "#fff" },
                  "&.MuiInputLabel-shrink": { color: "#fff" },
                },
              }}
              sx={outlinedInputSx}
            />
            <input type="hidden" name="countryName" value={form.countryName} />
            <TextField
              fullWidth
              label="City"
              value={form.City}
              required
              onChange={(e) => setForm({ ...form, City: e.target.value })}
              InputLabelProps={{
                sx: {
                  color: "#fff",
                  "&.Mui-focused": { color: "#fff" },
                  "&.MuiInputLabel-shrink": { color: "#fff" },
                },
              }}
              sx={outlinedInputSx}
            />

            <FormControl fullWidth variant="outlined" sx={{ mb: { xs: 1.5, sm: 2 } }}>
              <InputLabel
                sx={{
                  color: "#fff",
                  "&.Mui-focused": { color: "#fff" },
                  "&.MuiInputLabel-shrink": {
                    color: "#fff",
                  }
                }}
              >
                Category
              </InputLabel>
              <Select
                labelId="category-label"
                label="category"
                variant="outlined"
                value={form.Category}
                onChange={(e) => setForm({ ...form, Category: e.target.value })}
                sx={{
                  // default outline
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#F18F01",
                  },
                  // hover outline
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#F18F01CC",
                  },
                  // focused outline (root gets Mui-focused)
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#F18F01",
                  },
                  height: "48px",
                }}
                // --- menu (dropdown) styles ---
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: "rgba(241,143,1,1) !important",
                      border: "1px solid #F18F01",
                      mt: 1,
                      "& .MuiMenuItem-root": {
                        color: "#fff",
                      },
                      "& .MuiMenuItem-root:hover": {
                        bgcolor: "rgba(0,0,0,0.2)",
                      },
                      "& .MuiMenuItem-root.Mui-selected, & .MuiMenuItem-root[aria-selected='true']": {
                        bgcolor: "rgba(241,143,1,0.8)",
                        color: "white",
                      },
                    },
                  },
                }}
              >
                <MenuItem value="Category1">Category1</MenuItem>
                <MenuItem value="Category2">Category2</MenuItem>
                <MenuItem value="Category3">Category3</MenuItem>
              </Select>
            </FormControl>
            <div>
              <label style={{ color: "#fff", marginBottom: 8, display: "block" }}>
                Information
              </label>
              <Button
                variant="outlined"
                fullWidth
                sx={{ borderColor: "#F18F01", color: "#fff", textTransform: "none" }}
                onClick={() => setIsEditorOpen(true)}
              >
                Open text editor
              </Button>
            </div>

            <MDBox display="flex" gap={2}>
              <TextField
                fullWidth
                label="Ranking"
                type="number"
                value={form.Ranking}
                onChange={(e) => setForm({ ...form, Ranking: e.target.value })}
                InputLabelProps={{
                  sx: {
                    color: "#fff",
                    "&.Mui-focused": { color: "#fff" },
                    "&.MuiInputLabel-shrink": { color: "#fff" },
                  },
                }}
                sx={outlinedInputSx}
              />
              <TextField
                fullWidth
                label="Average Costs"
                type="number"
                value={form["Average Costs"]}
                onChange={(e) => setForm({ ...form, ["Average Costs"]: e.target.value })}
                InputLabelProps={{
                  sx: {
                    color: "#fff",
                    "&.Mui-focused": { color: "#fff" },
                    "&.MuiInputLabel-shrink": { color: "#fff" },
                  },
                }}
                sx={outlinedInputSx}
              />
            </MDBox>
            <MDBox display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={{ xs: 1, sm: 2 }} mt={1}>
              <div>
                <Button
                  variant={mainImageFile ? "contained" : "outlined"}
                  onClick={() => mainImageInputRef.current.click()}
                  sx={{
                    width: { xs: "138px !important", sm: "auto", },
                    borderColor: !mainImageFile ? "#F18F01" : undefined,
                    color: !mainImageFile ? "white !important" : "white !important",
                    mb: { xs: 1, sm: 0 },
                    textTransform: "none",
                    ...(mainImageFile && {
                      backgroundColor: "rgba(241,143,1,0.5) !important",
                      color: "#fff !important",
                      "&:hover": {
                        backgroundColor: "#D17C01 !important",
                      }
                    })
                  }}
                >
                  {mainImageFile ? "Image uploaded" : "Upload Main Image"}

                </Button>
                <input type="file" accept="image/*" ref={mainImageInputRef} style={{ display: "none" }} onChange={(e) => setMainImageFile(e.target.files[0])} />

              </div>
              <div>
                <Button
                  variant={multiImageFiles.length ? "contained" : "outlined"}
                  onClick={() => multiImageInputRef.current.click()}
                  sx={{
                    width: { xs: "138px !important", sm: "auto", },
                    borderColor: !multiImageFiles.length ? "#F18F01" : undefined,
                    color: !multiImageFiles ? "white !important" : "white !important",
                    mb: { xs: 1, sm: 0 },
                    textTransform: "none",
                    ...(multiImageFiles.length && {
                      backgroundColor: "rgba(241,143,1,0.5) !important",
                      color: "#fff !important",
                      "&:hover": {
                        backgroundColor: "#D17C01 !important",
                      }
                    })
                  }}>
                  {multiImageFiles.length ? "Images uploaded" : "Additional Images"}

                </Button>
                <input type="file" accept="image/*" multiple ref={multiImageInputRef} style={{ display: "none" }} onChange={(e) => setMultiImageFiles(Array.from(e.target.files))} />

              </div>
            </MDBox>
            <MDBox display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={{ xs: 1, sm: 2 }} mt={1}>
              <Button variant="contained" type="submit" sx={{ width: { xs: "100%", sm: "100%" }, backgroundColor: "#F18F01", color: "white !important", mb: { xs: 1, sm: 0 }, fontWeight: 600 }}>
                Save Pin
              </Button>
              <Button variant="outlined" onClick={e => { e.stopPropagation(); handleCancelForm(); }} sx={{ width: { xs: "100%", sm: "100%" }, borderColor: "#F18F01", color: "white !important", fontWeight: 600 }}>
                Cancel
              </Button>
            </MDBox>

            {/* optional spacer to pad bottom */}
            <MDBox height={150} />
          </MDBox>
        </form>
      </MDBox>
      <Dialog
        open={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2,
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.6)",
            boxShadow:
              "inset 4px 4px 10px rgba(0,0,0,0.4), inset -4px -4px 10px rgba(255,255,255,0.1), 0 6px 15px rgba(0,0,0,0.3)",
          },
        }}
      >
        <DialogTitle>Edit Information</DialogTitle>
        <DialogContent>
          <MDBox
            sx={{
              // Toolbar base
              "& .ql-toolbar": {
                backgroundColor: "rgba(241,143,1,0.2)",
                borderColor: "#F18F01 !important",

              },
              "& .ql-toolbar .ql-picker-item:hover": {
                color: "#F18F01 !important",
              },
              "& .ql-toolbar .ql-picker-label:hover::after": {
                borderTop: "6px solid #F18F01 !important",

              },

              // Active format (bold, italic, etc.)
              "& .ql-toolbar .ql-active, & .ql-toolbar .ql-active svg": {
                color: "#F18F01 !important",
                stroke: "#F18F01 !important",
                fill: "#F18F01 !important",
              },

              // Dropdown menu
              "& .ql-toolbar .ql-picker-options": {
                backgroundColor: "#222",
                borderColor: "#F18F01 !important",
                color: "white !important",
              },
              // Editor area
              "& .ql-container": {
                borderColor: "#F18F01 !important",
              },
              "& .ql-editor": {
                backgroundColor: "transparent",
                color: "white !important",
                minHeight: "300px",
              },
            }}
          >
            <ReactQuill
              className="custon-quill"
              theme="snow"
              value={form.Information}
              onChange={(val) => setForm({ ...form, Information: val })}
              style={{ marginBottom: "1rem" }}
              modules={{
                toolbar: [
                  [{ header: [1, 2, 3, false] }],
                  ["bold", "italic", "underline"], // no "link"
                  [{ list: "ordered" }, { list: "bullet" }],
                ],
              }}

            />
          </MDBox>

          <Button
            variant="outlined"
            onClick={() => setIsEditorOpen(false)}
            sx={{ borderColor: "#F18F01", color: "#fff", mt: 0 }}
          >
            Done
          </Button>
        </DialogContent>
      </Dialog>

    </ConfiguratorRoot>

  );
}
