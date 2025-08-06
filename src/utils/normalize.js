// src/utils/normalize.js
export const normalizeKey = (s) =>
  String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
