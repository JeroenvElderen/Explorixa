import { createClusterCanvas } from "components/WorldMapComponent/marker/createClusterCanvas";
import { createMarkerCanvas } from "components/WorldMapComponent/marker/createMarkerCanvas";
import { countryColors } from "utils/countryColors";

// Normalize helper
const normalize = (s) =>
  String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");

let clusterImageData = null;
const markerImageCache = new Map();

/**
 * Returns pre-rendered cluster icon ImageData
 */
export function getClusterIcon() {
  if (!clusterImageData) {
    const canvas = createClusterCanvas("#f18f01");
    clusterImageData = canvas
      .getContext("2d")
      .getImageData(0, 0, canvas.width, canvas.height);
  }
  return clusterImageData;
}

/**
 * Returns pre-rendered marker icon ImageData for a given ISO or label
 * @param {string} iso
 */
export function getMarkerImage(iso) {
  const key = iso || "default";
  if (!markerImageCache.has(key)) {
    const hex = countryColors[key] || countryColors.default;
    const label = key === "PEAK" ? "🏔️" : key;
    const canvas = createMarkerCanvas(hex, label);
    const data = canvas
      .getContext("2d")
      .getImageData(0, 0, canvas.width, canvas.height);
    markerImageCache.set(key, data);
  }
  return markerImageCache.get(key);
}

/**
 * Fetches the GeoJSON Feature for a country name from your geo-service.
 * @param {string} name  — e.g. "France"
 * @returns {Promise<Object|null>}
 */
export async function getContinentOutline(name) {
  const q = normalize(name);
  const resp = await fetch(
    `http://localhost:4000/countries?name=${encodeURIComponent(q)}`,
    {
      headers: {
        "Accept": "application/json",
      },
    }
  );
  if (!resp.ok) {
    console.error("Failed to load country outline:", resp.statusText);
    return null;
  }
  return resp.json();
}
