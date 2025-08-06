// geo-service/server.js
import express from "express";
import cors from "cors";
import { Pool } from "pg";

const app = express();
const port = process.env.PORT || 4000;

// Adjust the origin to match your React dev server (or "*" in prod)
app.use(cors({ origin: "http://localhost:3000" }));

// Configure Postgres pool via env vars
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DB_SSL === "true"
      ? { rejectUnauthorized: false }
      : false,
});

// in-memory cache: Map<normalizedName, GeoJSON.Feature>
let lookupCache = null;

const normalize = (s) =>
  String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");

async function loadLookup() {
  if (lookupCache) return lookupCache;

  const { rows } = await pool.query(`
    SELECT
      countryname,
      coordinates->'properties' AS props,
      coordinates->'geometry'   AS geometry
    FROM public.countries_poly
  `);

  const map = new Map();
  rows.forEach(({ countryname, props = {}, geometry }) => {
    const names = [
      props.NAME,
      props.ADMIN,
      props.SOVEREIGNT,
      props.NAME_LONG,
      countryname,
    ].filter(Boolean);

    names.forEach((n) => {
      map.set(normalize(n), {
        type: "Feature",
        properties: { ...props, countryname },
        geometry,
      });
    });
  });

  lookupCache = map;
  return map;
}

app.get("/countries", async (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res
      .status(400)
      .json({ error: "Missing required `name` query parameter" });
  }

  try {
    const map = await loadLookup();
    const feature = map.get(normalize(name)) || null;
    // cache for 1 hour
    res.set("Cache-Control", "public, max-age=3600");
    res.json(feature);
  } catch (err) {
    console.error("Geo-service error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () =>
  console.log(`🗺️  Geo-service listening on http://localhost:${port}`)
);
