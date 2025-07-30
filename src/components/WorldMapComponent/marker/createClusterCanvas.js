// src/components/WorldMapComponent/marker/createClusterCanvas.js

import { hexToRgbString } from "./hexToRgbString";

export function createClusterCanvas(baseHex) {
  const rgb = hexToRgbString(baseHex);
  const size = 40;
  const r = 15;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, `rgba(${rgb},0.85)`);
  grad.addColorStop(1, `rgba(${rgb},0.7)`);

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, r, 0, 2 * Math.PI);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 1;
  ctx.stroke();

  return canvas;
}
