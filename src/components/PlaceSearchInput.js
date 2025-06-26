import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxClient from "@mapbox/mapbox-sdk";
import MapboxGeocode from "@mapbox/mapbox-sdk/services/geocoding";

import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";

mapboxgl.accessToken =
  "pk.eyJ1IjoiamVyb2VudmFuZWxkZXJlbiIsImEiOiJjbWMwa2M0cWswMm9jMnFzNjI3Z2I4YnV4In0.qUqeNUDYMBf3E54ouOd2Jg";

const mapboxClient = MapboxClient({ accessToken: mapboxgl.accessToken });
const geocodeService = MapboxGeocode({ accessToken: mapboxgl.accessToken });

// Mapping from country code to lat/lng centers
const countryCenters = {
  af: { lat: 34.5553, lng: 69.2075 },
  se: { lat: 59.334591, lng: 18.063240 },
  de: { lat: 51.1657, lng: 10.4515 },
  fr: { lat: 46.2276, lng: 2.2137 },
  us: { lat: 37.0902, lng: -95.7129 },
  // add more as needed
};

function PlaceSearchInput({ countryCode, onPlaceSelected }) {
  const inputRef = useRef(null);

  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLatLng, setSelectedLatLng] = useState(null);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);

  // Handle input change to query Mapbox autocomplete API
  const handleInputChange = async (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.length > 2) {
      try {
        const response = await geocodeService
          .forwardGeocode({
            query: value,
            types: ["poi", "place", "locality"],
            ...(countryCode ? { countries: [countryCode] } : {}),
            limit: 5,
            language: ["en"],
          })
          .send();

        setSuggestions(response.body.features || []);
      } catch (err) {
        console.error(err);
      }
    } else {
      setSuggestions([]);
    }
  };

  // When user selects a suggestion
  const handleSelectSuggestion = (feature) => {
    const [lng, lat] = feature.center;
    setSelectedLatLng({ lat, lng });
    setInputValue(feature.place_name);
    setSuggestions([]);

    onPlaceSelected({
      lat,
      lng,
      country:
        feature.context?.find((c) => c.id.startsWith("country"))?.text || "",
      city: feature.context?.find((c) => c.id.startsWith("place"))?.text || "",
      address: feature.place_name,
      landmark: feature.text,
    });
  };

  // MapPickerDialog for selecting location on map
  const MapPickerDialog = ({ open, initialLatLng, onClose, onSelect }) => {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    const [mapInitialized, setMapInitialized] = useState(false);

    const getNearestCity = (context = []) => {
      const cityTypes = ["place", "locality", "district", "region"];
      for (const type of cityTypes) {
        const match = context.find((c) => c.id.startsWith(type));
        if (match) return match.text;
      }
      return "";
    };

    // Initialize map once when dialog opens
    useEffect(() => {
      if (!mapInitialized) return;
      if (!mapContainerRef.current) return;
      if (mapRef.current) return; // Already initialized

      const center = initialLatLng || { lat: 34.5553, lng: 69.2075 };

      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/jeroenvanelderen/cmc958dgm006s01shdiu103uz",
        center: [center.lng, center.lat],
        zoom: 12,
      });

      markerRef.current = new mapboxgl.Marker({ draggable: true })
        .setLngLat([center.lng, center.lat])
        .addTo(mapRef.current);

      markerRef.current.on("dragend", async () => {
        const lngLat = markerRef.current.getLngLat();

        try {
          const response = await geocodeService
            .reverseGeocode({
              query: [lngLat.lng, lngLat.lat],
              limit: 1,
              language: ["en"],
            })
            .send();

          const feature = response.body.features[0];

          onSelect({
            lat: lngLat.lat,
            lng: lngLat.lng,
            country:
              feature.context?.find((c) => c.id.startsWith("country"))?.text ||
              "",
            city:
              feature.context?.find((c) => c.id.startsWith("place"))?.text || "",
            address: feature.place_name,
            landmark: feature.text,
          });
        } catch (err) {
          console.error(err);
        }
      });

      mapRef.current.on("click", async (e) => {
        const features = mapRef.current.queryRenderedFeatures(e.point);
        if (features.length === 0) return;

        const feature = features.find((f) => f.geometry.type === "Point");
        if (!feature) return;

        const [lng, lat] = feature.geometry.coordinates;

        const labelName =
          feature.properties.name_en ||
          feature.properties.name ||
          feature.properties.label ||
          "";

        markerRef.current.setLngLat([lng, lat]);

        try {
          const response = await geocodeService
            .reverseGeocode({
              query: [lng, lat],
              limit: 1,
            })
            .send();

          const place = response.body.features[0];

          onSelect({
            lat,
            lng,
            country: place?.context?.find((c) => c.id.startsWith("country"))
              ?.text || "",
            city: getNearestCity(place?.context),
            address: place?.place_name || "",
            landmark: labelName,
          });
        } catch (err) {
          console.error(err);
          onSelect({
            lat,
            lng,
            country: "",
            city: "",
            address: "",
            landmark: labelName,
          });
        }
      });

      return () => {
        mapRef.current?.remove();
        mapRef.current = null;
        markerRef.current = null;
      };
    }, [mapInitialized]);

    // Update center and marker when initialLatLng changes
    useEffect(() => {
      if (!mapRef.current || !markerRef.current || !initialLatLng) return;

      mapRef.current.setCenter([initialLatLng.lng, initialLatLng.lat]);
      markerRef.current.setLngLat([initialLatLng.lng, initialLatLng.lat]);
    }, [initialLatLng]);

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        TransitionProps={{
          onEntered: () => setMapInitialized(true),
          onExit: () => setMapInitialized(false),
        }}
      >
        <DialogTitle>Select Location on Map</DialogTitle>
        <DialogContent style={{ height: "400px", padding: 0 }}>
          <div
            ref={mapContainerRef}
            style={{ width: "100%", height: "400px" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => {
              if (!markerRef.current) return;
              const lngLat = markerRef.current.getLngLat();

              onSelect({
                lat: lngLat.lat,
                lng: lngLat.lng,
                country: "",
                city: "",
                address: "",
                landmark: "",
              });

              onClose();
            }}
            variant="contained"
            color="primary"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <>
      <TextField
        fullWidth
        label="Search for a place"
        margin="normal"
        placeholder="Type a location..."
        value={inputValue}
        onChange={handleInputChange}
        inputRef={inputRef}
        InputProps={{
          startAdornment: (
            <InputAdornment
              position="start"
              style={{ cursor: "pointer" }}
              onClick={() => setMapPickerOpen(true)}
            >
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <ul
          style={{
            listStyleType: "none",
            margin: 0,
            padding: 0,
            border: "1px solid #ccc",
            maxHeight: 150,
            overflowY: "auto",
            background: "#fff",
            position: "absolute",
            zIndex: 10,
            width: "calc(100% - 32px)",
          }}
        >
          {suggestions.map((feature) => (
            <li
              key={feature.id}
              style={{ padding: "8px", cursor: "pointer" }}
              onClick={() => handleSelectSuggestion(feature)}
            >
              {feature.place_name}
            </li>
          ))}
        </ul>
      )}

      <MapPickerDialog
        open={mapPickerOpen}
        initialLatLng={
          selectedLatLng || countryCenters[countryCode] || countryCenters["af"]
        }
        onClose={() => setMapPickerOpen(false)}
        onSelect={(data) => {
          setSelectedLatLng({ lat: data.lat, lng: data.lng });
          setInputValue(data.landmark || data.address || "");
          onPlaceSelected(data);
          setMapPickerOpen(false);
        }}
      />
    </>
  );
}

export default PlaceSearchInput;
