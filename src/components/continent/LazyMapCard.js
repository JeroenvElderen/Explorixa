import React, { useState, useCallback } from "react";
import MDBox from "components/MDBox";
import MapCard from "./MapCard";

export default function LazyMapCard(props) {
  const [loaded, setLoaded] = useState(false);
  const handleMapLoad = useCallback(() => setLoaded(true), []);

  return (
    <MDBox sx={{ height: "100%", position: "relative" }}>
      {!loaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#f0f0f0",
          }}
        />
      )}
      <MapCard {...props} onLoad={handleMapLoad} />
    </MDBox>
  );
}
