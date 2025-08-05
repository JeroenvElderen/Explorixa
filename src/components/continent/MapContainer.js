import React, { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import PropTypes from "prop-types";

export default function MapContainer({
  accessToken,
  onLoad,
  projection = "mercator",
  styleUrl = "mapbox://styles/mapbox/dark-v10",
  fullScreen = false,
  style = {},
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    mapboxgl.accessToken = accessToken;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: styleUrl,
      center: [0, 20],
      zoom: 1.5,
      projection,
      attributionControl: false,
    });

    map.on("load", () => {
      onLoad(map);
    });

    return () => map.remove();
  }, [accessToken, onLoad, projection, styleUrl]);

  const baseStyle = fullScreen
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
      }
    : {
        position: "absolute",
        inset: 0,
      };

  return <div ref={containerRef} style={{ ...baseStyle, ...style }} />;
}

MapContainer.propTypes = {
  accessToken: PropTypes.string.isRequired,
  onLoad: PropTypes.func.isRequired,
  projection: PropTypes.string,
  styleUrl: PropTypes.string,
  fullScreen: PropTypes.bool,
  style: PropTypes.object,
};
