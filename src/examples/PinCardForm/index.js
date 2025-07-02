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
import PlaceSearchInput from "components/PlaceSearchInput";

import MDBox from "../../components/MDBox";
import MDTypography from "../../components/MDTypography";
import { supabase } from "../../SupabaseClient";

const BUCKET = "pins-images";

function PinCardForm({ onCancel, onSubmit, initialData = {}, countryName = "" }) {
  
  const [form, setForm] = useState({
    Name: initialData.Name || "",
    Latitude: initialData.Latitude || "",
    Longitude: initialData.Longitude || "",
    countryName: initialData.countryName || countryName,
    Category: initialData.Category || "",
    Information: initialData.Information || "",
    Ranking: initialData.Ranking || "",
    "Average Costs": initialData["Average Costs"] || "",
    City: initialData.City || "",
    "Post Summary": initialData["Post Summary"] || "",
    "Main Image": "",
    Images: "",
    authorName: initialData.authorName || "",
  });

  const [placeSelected, setPlaceSelected] = useState(false);
  const [mainImageFile, setMainImageFile] = useState(null);
  const [multiImageFiles, setMultiImageFiles] = useState([]);
  const [authorId, setAuthorId] = useState("");

  const mainImageInputRef = useRef(null);
  const multiImageInputRef = useRef(null);

  const countryNameToCode = {
    afghanistan: "af",
    sweden: "se",
    germany: "de",
    france: "fr",
    // add more as needed
  };

  const countryCode = useMemo(() => {
    return countryNameToCode[form.countryName?.toLowerCase()] || "";
  }, [form.countryName]);

  useEffect(() => {
    if (countryName) {
      setForm((prev) => ({ ...prev, countryName }));
    }
  }, [countryName]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          const user = session.user;
          const fullName = user.user_metadata?.full_name || "";
          setAuthorId(user.id);
          setForm((prev) => ({ ...prev, authorName: fullName }));
        } else {
          setAuthorId("");
          setForm((prev) => ({ ...prev, authorName: "" }));
        }
      }
    );
    return () => {
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const uploadImage = async (file) => {
    const fileExt = file.name.split(".").pop();
    const filePath = `${uuidv4()}.${fileExt}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
    if (error) throw error;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    return data.publicUrl;
  };

  const upsertCity = async (cityName, country) => {
    if (!cityName || !country) return;
    try {
      const { data: existingCity, error: selectError } = await supabase
        .from("cities")
        .select("id")
        .eq("Name", cityName)
        .eq("Country", country)
        .maybeSingle();

      if (selectError) {
        console.error("City lookup error:", selectError);
        return;
      }

      if (!existingCity) {
        const { error: insertError } = await supabase.from("cities").insert([
          { Name: cityName, Country: country },
        ]);
        if (insertError) {
          console.error("City insert error:", insertError);
        } else {
          console.log(`Inserted city: ${cityName}, ${country}`);
        }
      }
    } catch (err) {
      console.error("Upsert city failed:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.Name || !authorId) {
      alert("Please fill in required fields and ensure you're logged in.");
      return;
    }

    const lat = parseFloat(form.Latitude);
    const lng = parseFloat(form.Longitude);
    if (isNaN(lat) || isNaN(lng)) {
      alert("Invalid latitude or longitude.");
      return;
    }

    try {
      let mainImageUrl = "";
      let imageUrls = [];

      if (mainImageFile) {
        mainImageUrl = await uploadImage(mainImageFile);
      }

      if (multiImageFiles.length > 0) {
        imageUrls = await Promise.all(multiImageFiles.map(uploadImage));
      }

      const payload = {
        countryName: form.countryName,
        Information: form.Information,
        Ranking: form.Ranking ? parseInt(form.Ranking) : null,
        "Average Costs": form["Average Costs"]
          ? parseFloat(form["Average Costs"])
          : null,
        City: form.City,
        "Post Summary": form["Post Summary"],
        Category: form.Category,
        Name: form.Name,
        latitude: lat,
        longitude: lng,
        user_id: authorId || "920ae8e3-79d1-4303-905b-e35cbf68e3d5",
        Images: imageUrls.join(","),
        "Main Image": mainImageUrl,
      };

      await upsertCity(form.City?.trim(), form.countryName?.trim());

      const { error: insertError } = await supabase.from("pins").insert([payload]);

      if (insertError) {
        console.error("Failed to save pin:", insertError);
        alert("Failed to save pin. Please try again.");
      } else {
        alert("Pin saved successfully!");
        onSubmit && onSubmit(payload);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Image upload failed.");
    }
  };

  return (
    <Card sx={{ height: "100%" }}>
      <MDBox p={3}>
        <MDTypography variant="h5" mb={2}>
          Create a New Pin
        </MDTypography>

        <form onSubmit={handleSubmit}>
          {countryCode && (
            <PlaceSearchInput
              key={countryCode}
              countryCode={countryCode}
              onPlaceSelected={({ lat, lng, country, city, landmark }) => {
                setForm((prev) => ({
                  ...prev,
                  Name: landmark || prev.Name,
                  Latitude: lat.toFixed(6),
                  Longitude: lng.toFixed(6),
                  countryName: country,
                  City: city,
                }));
                setPlaceSelected(true);
              }}
            />
          )}

          {placeSelected && (
            <>
              <TextField
                fullWidth
                name="Name"
                label="Title"
                value={form.Name}
                onChange={handleChange}
                style={{ margin: "15px 0" }}
                required
              />
              <TextField
                fullWidth
                name="Post Summary"
                label="Post Summary"
                value={form["Post Summary"]}
                onChange={handleChange}
                margin="normal"
                rows={1}
              />
              <TextField
                fullWidth
                name="Latitude"
                label="Latitude"
                value={form.Latitude}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                name="Longitude"
                label="Longitude"
                value={form.Longitude}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                name="countryName"
                label="Country Name"
                value={form.countryName}
                onChange={handleChange}
                margin="normal"
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  name="Category"
                  value={form.Category}
                  onChange={handleChange}
                  label="Category"
                  style={{ height: "44px" }}
                >
                  <MenuItem value="Category1">Category1</MenuItem>
                  <MenuItem value="Category2">Category2</MenuItem>
                  <MenuItem value="Category3">Category3</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                name="Information"
                label="Information"
                value={form.Information}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={2}
              />
              <TextField
                fullWidth
                name="Ranking"
                label="Ranking"
                value={form.Ranking}
                onChange={handleChange}
                margin="normal"
                type="number"
              />
              <TextField
                fullWidth
                name="Average Costs"
                label="Average Costs"
                value={form["Average Costs"]}
                onChange={handleChange}
                margin="normal"
                type="number"
              />
              <TextField
                fullWidth
                name="City"
                label="City"
                value={form.City}
                onChange={handleChange}
                margin="normal"
              />
              <TextField
                fullWidth
                name="authorName"
                label="Author Name"
                value={form.authorName}
                onChange={handleChange}
                margin="normal"
                disabled
              />

              <MDBox mt={2}>
                <MDTypography>Main Image Upload:</MDTypography>
                <input
                  type="file"
                  accept="image/*"
                  ref={mainImageInputRef}
                  style={{ display: "none" }}
                  onChange={(e) => setMainImageFile(e.target.files[0])}
                />
                <Button
                  onClick={() => mainImageInputRef.current.click()}
                  variant="outlined"
                  sx={{ mt: 1 }}
                >
                  Upload Main Image
                </Button>
                {mainImageFile && (
                  <span style={{ marginLeft: 10 }}>{mainImageFile.name}</span>
                )}
              </MDBox>

              <MDBox mt={2}>
                <MDTypography>Additional Images:</MDTypography>
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
                <Button
                  onClick={() => multiImageInputRef.current.click()}
                  variant="outlined"
                  sx={{ mt: 1 }}
                >
                  Upload Additional Images
                </Button>
                {multiImageFiles.length > 0 && (
                  <span style={{ marginLeft: 10 }}>
                    {multiImageFiles.map((file) => file.name).join(", ")}
                  </span>
                )}
              </MDBox>
            </>
          )}

          <MDBox
            mt={3}
            display="flex"
            justifyContent="flex-start"
            alignItems="center"
            gap={2}
          >
            {placeSelected && (
              <Button variant="contained" color="primary" type="submit">
                Save Pin
              </Button>
            )}
            <Button
              type="button"
              onClick={onCancel}
              variant="outlined"
              color="secondary"
            >
              Cancel
            </Button>
          </MDBox>
        </form>
      </MDBox>
    </Card>
  );
}

PinCardForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  countryName: PropTypes.string,
};

export default PinCardForm;
