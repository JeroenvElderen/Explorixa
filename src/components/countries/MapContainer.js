// src/components/WorldMapComponent/MapContainer.js
import React, { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import PropTypes from "prop-types";

export default function MapContainer({
  accessToken,
  onLoad,
  projection = "globe",
  styleUrl = "mapbox://styles/jeroenvanelderen/cmc958dgm006s01shdiu103uz",
  fullScreen = true,
  style = {},
}) {
  const mapNode = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapNode.current) {
      // In the very unlikely event the ref hasn't attached yet, bail.
      return;
    }

    // 1) Set token and create the map immediately with the style URL
    mapboxgl.accessToken = accessToken;
    const map = new mapboxgl.Map({
      container: mapNode.current,   // guaranteed HTMLElement
      style: styleUrl,              // string URL
      center: [0, 20],
      zoom: 1.5,
      projection,
      attributionControl: false,
    });
    mapInstanceRef.current = map;

    // 2) Once the map has loaded, optionally patch fog + call your onLoad
    map.on("load", () => {
      if (projection === "globe" && map.setFog) {
        map.setFog({
          color: "rgb(17,17,17)",
          "high-color": "rgb(17,17,17)",
          "horizon-blend": 0.2,
          "space-color": "rgb(0,0,0)",
          "star-intensity": 0.5,
        });
      } else if (map.setFog) {
        map.setFog(null);
      }

      onLoad(map);
    });

    // 3) Clean up on unmount
    return () => {
      map.remove();
    };
  }, [accessToken, onLoad, projection, styleUrl]);

  // CSS to make it full-screen vs. absolute-fill in its parent
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
        width: "100%",
        height: "100%",
      };

  return <div ref={mapNode} style={{ ...baseStyle, ...style }} />;
}

MapContainer.propTypes = {
  accessToken: PropTypes.string.isRequired,
  onLoad: PropTypes.func.isRequired,
  projection: PropTypes.string,
  styleUrl: PropTypes.string,
  fullScreen: PropTypes.bool,
  style: PropTypes.object,
};
