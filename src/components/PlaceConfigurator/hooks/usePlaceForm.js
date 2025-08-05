// src/hooks/usePlaceForm.js
import { useState, useEffect, useRef } from "react";
import imageCompression from "browser-image-compression";
import { supabase } from "SupabaseClient";       // ← adjust path as needed
import { v4 as uuidv4 } from "uuid";
import { COUNTRY_TO_CURRENCY } from "../constants";     // ← adjust path as needed

const BUCKET = "pins-images";

async function fetchContinent(countryName) {
  const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(
    countryName
  )}?fullText=true`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const [record] = await res.json();
  return record?.region || null;
}

export default function usePlaceForm({
  initialCountryCode,
  initialData,
  userId,
  accessToken,
  onPlacePick,
  onActivateMapClick,
  onPlaceSelected,
  onCancel,
  setOpenConfigurator,
  controllerDispatch,
}) {
  // ─── STATE & REFS ───────────────────
  const [searchCountry, setSearchCountry] = useState(initialCountryCode || "");
  const [selectedPlace, setSelectedPlace] = useState(initialData || null);
  const [form, setForm] = useState({
    Name: "",
    "Post Summary": "",
    Information: "",
    Category: "",
    Ranking: "",
    "Average Costs": "",
    Currency: "",
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

  const [currencyAnchor, setCurrencyAnchor] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // ─── HANDLERS ───────────────────────
  const handleCurrencyClick = (el) => {
    setCurrencyAnchor(el);
  };
  const handleCurrencyClose = () => setCurrencyAnchor(null);

  const handleCancelForm = () => {
    setSelectedPlace(null);
    setForm({
      Name: "",
      "Post Summary": "",
      Information: "",
      Category: "",
      Ranking: "",
      "Average Costs": "",
      Currency: "",
      MainImage: "",
      Images: [],
      Latitude: "",
      Longitude: "",
      countryName: "",
      City: "",
    });
    setMainImageFile(null);
    setMultiImageFiles([]);
    setOpenConfigurator(controllerDispatch, false);
    onCancel?.();
  };

  async function uploadImage(file) {
    const compressed = await imageCompression(file, {
      maxWidthOrHeight: 1000,
      useWebWorker: true,
      initialQuality: 0.8,
    });
    const ext = compressed.name.split(".").pop();
    const path = `${uuidv4()}.${ext}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, compressed, {
        cacheControl: "3600",
        upsert: false,
        contentType: compressed.type,
      });
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }

  // ─── SUBMIT ─────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlace?.lat || !selectedPlace?.lng) {
      alert("Please choose a place on the map first.");
      return;
    }
    try {
      // ─── 1) compute continent ─────────────────
      let continent = null;
      // Russia split at 60°E
      if (selectedPlace.country === "Russia") {
        continent =
          parseFloat(selectedPlace.lng) < 60 ? "Europe" : "Asia";
      } else {
        try {
          continent = await fetchContinent(selectedPlace.country);
        } catch {
          continent = null;
        }
      }

      // ─── 2) build pin payload (including continent) ─────────
      const payload = {
        user_id: userId,
        Name: form.Name,
        "Post Summary": form["Post Summary"],
        Information: form.Information,
        Category: form.Category,
        Ranking: form.Ranking || null,
        "Average Costs": form["Average Costs"] || null,
        Currency: form.Currency || null,
        latitude: parseFloat(selectedPlace.lat),
        longitude: parseFloat(selectedPlace.lng),
        countryName: selectedPlace.country,
        City: selectedPlace.city,
        iso: selectedPlace.iso || null,
        continent,                       // ← NEW
      };

      if (mainImageFile) {
        payload["Main Image"] = await uploadImage(mainImageFile);
      }
      if (multiImageFiles.length) {
        const urls = await Promise.all(multiImageFiles.map(uploadImage));
        payload.Images = urls.join(",");
      }

      // ─── 3) upsert country with continent ─────────────
      await supabase
        .from("countries")
        .upsert(
          [{ name: selectedPlace.country, continent }],
          { onConflict: ["name"] }
        );

      // ─── 4) upsert city with same continent ─────────────
      const { error: cityError } = await supabase
        .from("cities")
        .upsert(
          [
            {
              Name: selectedPlace.city,
              Country: selectedPlace.country,
              continent,               // ← NEW
            },
          ],
          { onConflict: ["Name", "Country"] }
        );
      if (cityError) {
        console.error("City upsert error:", cityError);
        alert("City upsert failed: " + cityError.message);
      }

      // ─── 5) insert pin row ─────────────────────────────
      const { error } = await supabase.from("pins").insert([payload]);
      if (error) throw error;

      onPlaceSelected?.(payload);
      handleCancelForm();
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }
  };

  // ─── EFFECTS ────────────────────────
  useEffect(() => {
    if (selectedPlace) {
      const autoCurr = COUNTRY_TO_CURRENCY[selectedPlace.country] || "";
      setForm((f) => ({
        ...f,
        Name: (selectedPlace.name || selectedPlace.text || "").trim(),
        Latitude: selectedPlace.lat,
        Longitude: selectedPlace.lng,
        countryName: selectedPlace.country,
        City: selectedPlace.city || "",
        Currency: autoCurr,
      }));
    }
  }, [selectedPlace]);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length) {
      setSelectedPlace(initialData);
    }
  }, [initialData]);

  // ─── PLACE PICKER INTEGRATION ──────
  const handlePlaceSelected = (p) => {
    const [lng, lat] = Array.isArray(p.center) ? p.center : [p.lng, p.lat];
    fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${accessToken}`
    )
      .then((res) => res.json())
      .then(({ features = [] }) => {
        const city =
          features.find((f) => f.place_type.includes("place"))?.text || "";
        const country =
          features.find((f) => f.place_type.includes("country"))?.text || "";
        const enriched = {
          ...p,
          name: p.text || p.landmark,
          address: p.place_name,
          lat,
          lng,
          city,
          country,
          iso: p.properties?.short_code,
        };
        setSelectedPlace(enriched);
        onPlacePick?.(enriched);
      })
      .catch(() => {
        const enriched = {
          ...p,
          name: p.text,
          address: p.place_name,
          lat,
          lng,
          city: "",
          country: "",
          iso: p.properties?.short_code,
        };
        setSelectedPlace(enriched);
        onPlacePick?.(enriched);
      });
  };

  // ─── RETURN HOOK VALUES ─────────────
  return {
    searchCountry,
    setSearchCountry,
    selectedPlace,
    setSelectedPlace,
    form,
    setForm,
    mainImageInputRef,
    multiImageInputRef,
    mainImageFile,
    multiImageFiles,
    setMainImageFile,
    setMultiImageFiles,
    currencyAnchor,
    handleCurrencyClick,
    handleCurrencyClose,
    isEditorOpen,
    setIsEditorOpen,
    handleSubmit,
    handleCancelForm,
    uploadImage,
    handlePlaceSelected,
  };
}
