// src/components/PinMapCard/MapView.jsx
import React, { useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

export default function MapView({ latitude, longitude }) {
  const ref = useRef(null);

  useEffect(() => {
    if (latitude == null || longitude == null) return;
    const map = new mapboxgl.Map({
      container: ref.current,
      style: "mapbox://styles/jeroenvanelderen/cmc958dgm006s01shdiu103uz",
      center: [longitude, latitude],
      zoom: 10,
      interactive: false,
      attributionControl: false,
    });
    map.on("load", () => {
      new mapboxgl.Marker({ color: "#F18F01" })
        .setLngLat([longitude, latitude])
        .addTo(map);
      map.resize();
    });
    return () => map.remove();
  }, [latitude, longitude]);

  return (
    <Box sx={{ width: "100%", height: 140 }}>
      <Box
        ref={ref}
        sx={{
          width: "100%",
          height: "100%",
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
        }}
      />
    </Box>
  );
}
