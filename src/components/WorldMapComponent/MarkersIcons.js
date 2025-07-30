// MarkerIcons.js
import { hexToRgbString } from "./CanvasUtils";

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

export function createMarkerCanvas(baseHex, iso) {
  const rgb = hexToRgbString(baseHex);
  const size = 40;
  const tail = 5;
  const r = 15;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size + tail;
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

  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const isEmoji = /[\u{1F300}-\u{1F6FF}]/u.test(iso);
  ctx.font = isEmoji ? "20px serif" : "bold 12px sans-serif";
  ctx.fillText(iso, size / 2, size / 2);

  ctx.fillStyle = `rgba(${rgb},0.85)`;
  ctx.beginPath();
  ctx.moveTo(size / 2 - 7, size / 2 + r - 2);
  ctx.lineTo(size / 2, size + tail - 2);
  ctx.lineTo(size / 2 + 7, size / 2 + r - 2);
  ctx.closePath();
  ctx.fill();

  return canvas;
}
