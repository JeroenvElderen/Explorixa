// import_countries.js
import fs       from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv   from 'dotenv';

// Load import-specific env vars (.env.import)
dotenv.config({ path: '.env.import' });

const SUPABASE_URL     = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.import');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  const file    = fs.readFileSync('countries.json', 'utf8');
  const geojson = JSON.parse(file);

  if (geojson.type !== 'FeatureCollection' || !Array.isArray(geojson.features)) {
    console.error('❌ Expected a FeatureCollection with .features[]');
    process.exit(1);
  }

  // Only countryname, continent, geojson
  const rows = geojson.features.map((feat) => ({
    countryname: feat.properties.name || feat.properties.sovereignt,
    continent:   feat.properties.continent,
    geojson:     feat                     // entire Feature
  }));

  // Make sure countryname is unique in the DB
  // (see SQL snippet below)

  // Upsert in batches
  const chunkSize = 500;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const batch = rows.slice(i, i + chunkSize);
    const { error } = await supabase
      .from('countries_poly')
      .upsert(batch, {
        onConflict: ['countryname'],  // must match a UNIQUE on countryname
        returning:  'minimal'
      });

    if (error) {
      console.error(`❌ Error upserting batch ${i}–${i + batch.length - 1}:`, error);
      process.exit(1);
    }
    console.log(`✅ Upserted rows ${i}–${i + batch.length - 1}`);
  }

  console.log(`🎉 Successfully upserted ${rows.length} countries`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
