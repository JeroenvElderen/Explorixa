// src/components/WorldMapComponent/marker/markerManager.js
import { createClusterCanvas } from "components/WorldMapComponent/marker/createClusterCanvas";
import { createMarkerCanvas } from "components/WorldMapComponent/marker/createMarkerCanvas";
import { countryColors } from "utils/countryColors";
import countriesGeoJSON from "utils/countries.json";

// Normalize helper
const normalize = s => String(s || "").trim().toLowerCase().replace(/[^a-z]/g, "");

// Precompute lookup map for country outlines
const countryLookup = countriesGeoJSON.features.reduce((map, feat) => {
  const names = [
    feat.properties.NAME,
    feat.properties.ADMIN,
    feat.properties.SOVEREIGNT,
    feat.properties.NAME_LONG,
    feat.properties.name,
    feat.properties.admin,
    feat.properties.sovereignt,
    feat.properties.name_long,
  ];
  names.forEach(n => {
    if (n) map.set(normalize(n), feat);
  });
  return map;
}, new Map());

let clusterImageData = null;
const markerImageCache = new Map();

export function getClusterIcon() {
  if (!clusterImageData) {
    const canvas = createClusterCanvas("#f18f01");
    clusterImageData = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
  }
  return clusterImageData;
}

export function getMarkerImage(iso) {
  const key = iso || "default";
  if (!markerImageCache.has(key)) {
    const hex = countryColors[key] || countryColors.default;
    const label = key === "PEAK" ? "🏔️" : key;
    const canvas = createMarkerCanvas(hex, label);
    const data = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
    markerImageCache.set(key, data);
  }
  return markerImageCache.get(key);
}

export function getContinentOutline(name) {
  return countryLookup.get(normalize(name)) || null;
}
