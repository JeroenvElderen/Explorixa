// src/components/WorldMapComponent/marker/hexToRgbString.js

export function hexToRgbString(hex) {
  const m = hex.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if (!m) return "0,0,0";
  return [
    parseInt(m[1], 16),
    parseInt(m[2], 16),
    parseInt(m[3], 16),
  ].join(",");
}
