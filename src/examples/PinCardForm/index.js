// src/components/PinCardForm.jsx

import React, { useState, useEffect, useRef, useMemo } from "react";
import PropTypes from "prop-types";
import { v4 as uuidv4 } from "uuid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import imageCompression from "browser-image-compression";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import ReactMarkdown from "react-markdown";

import PlaceSearchInput from "components/PlaceSearchInput";
import MDBox from "../../components/MDBox";
import MDTypography from "../../components/MDTypography";
import { supabase } from "../../SupabaseClient";

const BUCKET = "pins-images";
const COUNTRY_OPTIONS = [
  { code: "", name: "All Countries" },
  { code: "af", name: "Afghanistan" },
  { code: "se", name: "Sweden" },
  { code: "de", name: "Germany" },
  { code: "fr", name: "France" },
];

function PinCardForm({ onCancel, onSubmit, initialData = {}, countryName: propCountry }) {
  const [form, setForm] = useState({
    Name:            initialData.Name           || "",
    "Post Summary":  initialData["Post Summary"]|| "",
    Information:     initialData.Information    || "",
    Category:        initialData.Category       || "",
    Ranking:         initialData.Ranking        || "",
    "Average Costs": initialData["Average Costs"]||"",
    Latitude:        initialData.Latitude       || "",
    Longitude:       initialData.Longitude      || "",
    countryName:     initialData.countryName    || propCountry || "",
    City:            initialData.City           || "",
    Images:          [],
    "Main Image":    "",
  });

  // Place search country code
  const countryCode = useMemo(() => {
    const map = Object.fromEntries(
      COUNTRY_OPTIONS.map(o => [o.name.toLowerCase(), o.code])
    );
    return map[form.countryName.toLowerCase()] || "";
  }, [form.countryName]);

  const [searchCountry, setSearchCountry] = useState(countryCode);
  useEffect(() => setSearchCountry(countryCode), [countryCode]);

  const [placeSelected, setPlaceSelected] = useState(!!initialData.Latitude);
  const [mainImageFile, setMainImageFile] = useState(null);
  const [multiImageFiles, setMultiImageFiles] = useState([]);
  const [authorId, setAuthorId] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const mainImageInputRef  = useRef(null);
  const multiImageInputRef = useRef(null);

  // get user id
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      setAuthorId(session?.user?.id || "");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // image upload helper
  const uploadImage = async file => {
    const compressed = await imageCompression(file, {
      maxWidthOrHeight: 1000,
      initialQuality: 0.8
    });
    const ext = compressed.name.split(".").pop();
    const path = `${uuidv4()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET)
      .upload(path, compressed, { cacheControl:"3600", upsert:false, contentType:compressed.type });
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  };

  const upsertCity = async (city, country) => {
    if (!city || !country) return;
    const { data: existing } = await supabase
      .from("cities")
      .select("id")
      .eq("Name", city)
      .eq("Country", country)
      .maybeSingle();
    if (!existing) {
      await supabase.from("cities").insert([{ Name:city, Country:country }]);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.Name) return alert("Title is required.");
    if (!placeSelected)  return alert("Please choose a place first.");

    try {
      const mainUrl  = mainImageFile   ? await uploadImage(mainImageFile) : "";
      const extras   = multiImageFiles.length
                     ? await Promise.all(multiImageFiles.map(uploadImage))
                     : [];
      const payload = {
        user_id:      authorId,
        Name:         form.Name,
        "Post Summary": form["Post Summary"],
        Information:  form.Information,
        Category:     form.Category,
        Ranking:      form.Ranking ? parseInt(form.Ranking, 10) : null,
        "Average Costs": form["Average Costs"]
                         ? parseFloat(form["Average Costs"])
                         : null,
        latitude:     parseFloat(form.Latitude),
        longitude:    parseFloat(form.Longitude),
        countryName:  form.countryName,
        City:         form.City,
        "Main Image": mainUrl,
        Images:       extras.join(","),
      };

      await upsertCity(form.City.trim(), form.countryName.trim());
      const { error } = await supabase.from("pins").insert([payload]);
      if (error) throw error;
      onSubmit?.(payload);
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }
  };

  return (
    <Card sx={{ height: "100%" }}>
      <MDBox p={3}>
        <MDTypography variant="h5" mb={2}>
          Create a New Pin
        </MDTypography>

        <PlaceSearchInput
          countryCode={searchCountry || undefined}
          onPlaceSelected={({ lat, lng, country, city, landmark, text }) => {
            setForm(f => ({
              ...f,
              Name:         landmark || text || f.Name,
              Latitude:     lat.toFixed(6),
              Longitude:    lng.toFixed(6),
              countryName:  country,
              City:         city,
            }));
            setPlaceSelected(true);
          }}
        />

        {placeSelected && (
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth name="Name" label="Title"
              value={form.Name} onChange={handleChange}
              sx={{ mt: 2 }} required
            />
            <TextField
              fullWidth name="Post Summary" label="Post Summary"
              value={form["Post Summary"]} onChange={handleChange}
              sx={{ mt: 2 }}
            />

            {/* Markdown editor dialog */}
            <MDBox mt={2}>
              <Button onClick={() => setIsEditorOpen(true)}>
                {showPreview ? "Edit Information" : "Open Information Editor"}
              </Button>
            </MDBox>
            <Dialog
              open={isEditorOpen}
              onClose={() => setIsEditorOpen(false)}
              fullWidth maxWidth="md"
            >
              <DialogTitle>
                {showPreview ? "Preview Information" : "Edit Information"}
              </DialogTitle>
              <DialogContent>
                {showPreview ? (
                  <Box sx={{
                    p: 2, minHeight: 200,
                    background: "#111", color:"#fff",
                    overflowY:"auto"
                  }}>
                    <ReactMarkdown>
                      {form.Information || ""}
                    </ReactMarkdown>
                  </Box>
                ) : (
                  <SimpleMDE
                    value={form.Information}
                    onChange={val =>
                      setForm(f => ({ ...f, Information: val }))
                    }
                    options={{
                      autofocus: true,
                      spellChecker: false,
                      toolbar: [
                        ["bold","italic","heading"],
                        ["unordered-list","ordered-list","quote","link"]
                      ],
                    }}
                    textareaProps={{
                      style: {
                        color:"white",
                        backgroundColor:"transparent",
                        minHeight:"200px"
                      }
                    }}
                    className="white-simplemde"
                  />
                )}
                <MDBox mt={1}>
                  <Button
                    variant="outlined"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? "Back to Edit" : "Preview"}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => setIsEditorOpen(false)}
                    sx={{ ml: 1 }}
                  >
                    Done
                  </Button>
                </MDBox>
              </DialogContent>
            </Dialog>

            {/* rest of fields */}
            <TextField
              fullWidth name="Latitude" label="Latitude"
              value={form.Latitude} onChange={handleChange}
              sx={{ mt: 2 }} required
            />
            <TextField
              fullWidth name="Longitude" label="Longitude"
              value={form.Longitude} onChange={handleChange}
              sx={{ mt: 2 }} required
            />
            <TextField
              fullWidth name="countryName" label="Country"
              value={form.countryName} onChange={handleChange}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth name="City" label="City"
              value={form.City} onChange={handleChange}
              sx={{ mt: 2 }}
            />

            <FormControl fullWidth sx={{ mt:2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                name="Category"
                value={form.Category}
                onChange={handleChange}
                label="Category"
              >
                <MenuItem value="Category1">Category1</MenuItem>
                <MenuItem value="Category2">Category2</MenuItem>
                <MenuItem value="Category3">Category3</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth name="Ranking" label="Ranking"
              type="number"
              value={form.Ranking} onChange={handleChange}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth name="Average Costs" label="Average Costs"
              type="number"
              value={form["Average Costs"]} onChange={handleChange}
              sx={{ mt: 2 }}
            />

            <MDBox mt={2} display="flex" gap={2}>
              <input
                type="file" accept="image/*"
                ref={mainImageInputRef}
                style={{ display: "none" }}
                onChange={e => setMainImageFile(e.target.files[0])}
              />
              <Button
                variant={mainImageFile ? "contained" : "outlined"}
                onClick={() => mainImageInputRef.current.click()}
              >
                {mainImageFile ? "Main Image Ready" : "Upload Main Image"}
              </Button>

              <input
                type="file" accept="image/*" multiple
                ref={multiImageInputRef}
                style={{ display: "none" }}
                onChange={e => setMultiImageFiles(Array.from(e.target.files))}
              />
              <Button
                variant={multiImageFiles.length ? "contained" : "outlined"}
                onClick={() => multiImageInputRef.current.click()}
              >
                {multiImageFiles.length
                  ? "Additional Images Ready"
                  : "Upload Additional Images"}
              </Button>
            </MDBox>

            <MDBox mt={4} display="flex" gap={2}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
              >
                Save Pin
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={onCancel}
              >
                Cancel
              </Button>
            </MDBox>
          </form>
        )}
      </MDBox>
    </Card>
  );
}

PinCardForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  initialData: PropTypes.object,
  countryName: PropTypes.string,
};

export default PinCardForm;
