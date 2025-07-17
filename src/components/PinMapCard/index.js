// src/components/PinMapCard/PinMapCard.jsx
import React, { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import mapboxgl from "mapbox-gl";
import MapView from "./MapView";
import { AddressField } from "./AddressField";
import { CoordsField } from "./CoordsField";
import DestinationGuide from "./DestinationGuide";
import { getContinentByCountry } from "utils/continentHelpers";

import { supabase } from "../../SupabaseClient"; // adjust if your client is elsewhere
import { useTheme, useMediaQuery } from "@mui/material";

export default function PinMapCard({ pin }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { latitude, longitude, Name: pinName, countryName } = pin;

  const continentName = getContinentByCountry(countryName);
  // 1) Reverse‑geocoded address
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (latitude == null || longitude == null) return;
    const fetchAddress = async () => {
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxgl.accessToken}`;
        const res = await fetch(url);
        const data = await res.json();
        // pick the best label
        const best = data.features.find((f) => f.place_type.includes("poi")) || data.features[0] || {};
        const placeName = best.place_name || "";
        setAddress(placeName);
      } catch {
        setAddress("");
      }
    };
    fetchAddress();
  }, [latitude, longitude]);

  // 2) Counts of cities & stories
  const [citiesCount, setCitiesCount] = useState(0);
  const [storiesCount, setStoriesCount] = useState(0);

  useEffect(() => {
    if (!countryName) return;
    (async () => {
      // exact count on cities table
      const { count: cityCount, error: cityErr } = await supabase
        .from("cities")
        .select("id", { count: "exact", head: true })
        .eq("Country", countryName);
      if (!cityErr && typeof cityCount === "number") setCitiesCount(cityCount);

      // exact count on pins table
      const { count: pinCount, error: pinErr } = await supabase
        .from("pins")
        .select("id", { count: "exact", head: true })
        .eq("countryName", countryName);
      if (!pinErr && typeof pinCount === "number") setStoriesCount(pinCount);
    })();
  }, [countryName]);

  return (
    <Card
      sx={{
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        background: "linear-gradient(145deg, rgba(241,143,1,0.3) 0%, rgba(241,143,1,0) 100%)",
        border: "1px solid rgba(255,255,255,0.6)",
        boxShadow:
          "inset 4px 4px 10px rgba(241,143,1,0.4), inset -4px -4px 10px rgba(241,143,1,0.1), 0 6px 15px rgba(241,143,1,0.3)",
        borderRadius: "12px",
        
      }}
    >
      {/* 1) Map */}
      <MapView latitude={latitude} longitude={longitude} />

      <CardContent sx={{ pb: 2 }}>
        {/* 2) Copyable address field */}
        <AddressField pinName={pinName} address={address} />

        {/* 3) Copyable coords */}
        <CoordsField latitude={latitude} longitude={longitude} />

        <Divider sx={{ my: 1 }} />

        {/* 4) Destination guide with badges */}
        <DestinationGuide
          continentName={continentName}
          countryName={countryName}
          citiesCount={citiesCount}
          storiesCount={storiesCount}
        />
      </CardContent>
    </Card>
  );
}
