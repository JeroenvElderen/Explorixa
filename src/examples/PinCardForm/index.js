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
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

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
    Name: initialData.Name || "",
    "Post Summary": initialData["Post Summary"] || "",
    Information: initialData.Information || "",
    Category: initialData.Category || "",
    Ranking: initialData.Ranking || "",
    "Average Costs": initialData["Average Costs"] || "",
    Latitude: initialData.Latitude || "",
    Longitude: initialData.Longitude || "",
    countryName: initialData.countryName || propCountry || "",
    City: initialData.City || "",
    Images: [],
    "Main Image": "",
  });

  // derive default countryCode for search
  const countryCode = useMemo(() => {
    const codeMap = COUNTRY_OPTIONS.reduce((m, o) => ({ ...m, [o.name.toLowerCase()]: o.code }), {});
    return codeMap[form.countryName.toLowerCase()] || "";
  }, [form.countryName]);

  const [searchCountry, setSearchCountry] = useState(countryCode);
  useEffect(() => { setSearchCountry(countryCode); }, [countryCode]);

  const [placeSelected, setPlaceSelected] = useState(!!initialData.Latitude);
  const [mainImageFile, setMainImageFile] = useState(null);
  const [multiImageFiles, setMultiImageFiles] = useState([]);
  const [authorId, setAuthorId] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const mainImageInputRef = useRef(null);
  const multiImageInputRef = useRef(null);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setAuthorId(session?.user?.id || "");
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const uploadImage = async (file) => {
    const compressed = await imageCompression(file, { maxWidthOrHeight: 1000, initialQuality: 0.8 });
    const ext = compressed.name.split(".").pop();
    const path = `${uuidv4()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, compressed, { cacheControl: "3600", upsert: false, contentType: compressed.type });
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  };

  const upsertCity = async (city, country) => {
    if (!city || !country) return;
    const { data: existing } = await supabase.from("cities").select("id").eq("Name", city).eq("Country", country).maybeSingle();
    if (!existing) await supabase.from("cities").insert([{ Name: city, Country: country }]);
  };

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.Name) return alert("Title is required.");
    if (!placeSelected) return alert("Please choose a place first.");
    try {
      const mainUrl = mainImageFile ? await uploadImage(mainImageFile) : "";
      const extraUrls = multiImageFiles.length ? await Promise.all(multiImageFiles.map(uploadImage)) : [];
      const payload = {
        user_id: authorId,
        Name: form.Name,
        "Post Summary": form["Post Summary"],
        Information: form.Information,
        Category: form.Category,
        Ranking: form.Ranking ? parseInt(form.Ranking, 10) : null,
        "Average Costs": form["Average Costs"] ? parseFloat(form["Average Costs"]) : null,
        latitude: parseFloat(form.Latitude),
        longitude: parseFloat(form.Longitude),
        countryName: form.countryName,
        City: form.City,
        "Main Image": mainUrl,
        Images: extraUrls.join(","),
      };
      await upsertCity(form.City.trim(), form.countryName.trim());
      const { error } = await supabase.from("pins").insert([payload]);
      if (error) throw error;
      onSubmit && onSubmit(payload);
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }
  };

  return (
    <Card sx={{ height: "100%" }}>
      <MDBox p={3}>
        <MDTypography variant="h5" mb={2}>Create a New Pin</MDTypography>


        {/* Place search input */}
        <PlaceSearchInput
          countryCode={searchCountry || undefined}
          onPlaceSelected={({ lat, lng, country, city, landmark, text }) => {
            setForm(prev => ({
              ...prev,
              Name: landmark || text || prev.Name,
              Latitude: lat.toFixed(6),
              Longitude: lng.toFixed(6),
              countryName: country,
              City: city,
            }));
            setPlaceSelected(true);
          }}
        />

        {placeSelected && (
          <form onSubmit={handleSubmit}>
            <TextField fullWidth name="Name" label="Title" value={form.Name} onChange={handleChange} sx={{ mt: 2 }} required />
            <TextField fullWidth name="Post Summary" label="Post Summary" value={form["Post Summary"]} onChange={handleChange} sx={{ mt: 2 }} />

            <MDBox mt={2}>
              <Button variant="outlined" onClick={() => setIsEditorOpen(true)}>Open Information Editor</Button>
            </MDBox>
            <Dialog open={isEditorOpen} onClose={() => setIsEditorOpen(false)} fullWidth maxWidth="md">
              <DialogTitle>Edit Information</DialogTitle>
              <DialogContent>
                <ReactQuill theme="snow" value={form.Information} onChange={val => setForm(p => ({ ...p, Information: val }))} modules={{ toolbar: [[{ header: [1,2,false] }], ["bold","italic"], [{ list: "bullet" }]] }} style={{ minHeight: 200 }} />
                <Button sx={{ mt: 2 }} variant="outlined" onClick={() => setIsEditorOpen(false)}>Done</Button>
              </DialogContent>
            </Dialog>

            <TextField fullWidth name="Latitude" label="Latitude" value={form.Latitude} onChange={handleChange} sx={{ mt: 2 }} required />
            <TextField fullWidth name="Longitude" label="Longitude" value={form.Longitude} onChange={handleChange} sx={{ mt: 2 }} required />
            <TextField fullWidth name="countryName" label="Country" value={form.countryName} onChange={handleChange} sx={{ mt: 2 }} />
            <TextField fullWidth name="City" label="City" value={form.City} onChange={handleChange} sx={{ mt: 2 }} />

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select name="Category" value={form.Category} onChange={handleChange} label="Category">
                <MenuItem value="Category1">Category1</MenuItem>
                <MenuItem value="Category2">Category2</MenuItem>
                <MenuItem value="Category3">Category3</MenuItem>
              </Select>
            </FormControl>

            <TextField fullWidth name="Ranking" label="Ranking" type="number" value={form.Ranking} onChange={handleChange} sx={{ mt: 2 }} />
            <TextField fullWidth name="Average Costs" label="Average Costs" type="number" value={form["Average Costs"]} onChange={handleChange} sx={{ mt: 2 }} />

            <MDBox mt={2} display="flex" gap={2}>
              <div>
                <input type="file" accept="image/*" ref={mainImageInputRef} style={{ display: "none" }} onChange={e => setMainImageFile(e.target.files[0])} />
                <Button variant={mainImageFile ? "contained" : "outlined"} onClick={() => mainImageInputRef.current.click()}>
                  {mainImageFile ? "Main Image Ready" : "Upload Main Image"}
                </Button>
              </div>
              <div>
                <input type="file" accept="image/*" multiple ref={multiImageInputRef} style={{ display: "none" }} onChange={e => setMultiImageFiles(Array.from(e.target.files))} />
                <Button variant={multiImageFiles.length ? "contained" : "outlined"} onClick={() => multiImageInputRef.current.click()}>
                  {multiImageFiles.length ? "Additional Images Ready" : "Upload Additional Images"}
                </Button>
              </div>
            </MDBox>

            <MDBox mt={4} display="flex" gap={2}>
              <Button variant="contained" color="primary" type="submit">Save Pin</Button>
              <Button variant="outlined" color="secondary" onClick={onCancel}>Cancel</Button>
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
