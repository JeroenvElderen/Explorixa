// src/utils/dbHelpers.js
import { supabase } from "SupabaseClient";

export async function fetchContinent(countryName) {
  try {
    const res = await fetch(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`
    );
    if (!res.ok) return null;
    const [record] = await res.json();
    return record?.region || null;
  } catch {
    return null;
  }
}

export async function upsertCityAndCountry(cityName, countryName) {
  try {
    const continent = await fetchContinent(countryName);

    // First, upsert country
    const { error: countryError } = await supabase.from("countries").upsert(
      [{ name: countryName, continent }],
      { onConflict: ["name"] }
    );
    if (countryError) {
      console.error("Country upsert error:", countryError);
      return; // stop here if country upsert fails, to avoid foreign key error
    }

    // Then, upsert city (country now exists)
    const { error: cityError } = await supabase.from("cities").upsert(
      [{ Name: cityName, Country: countryName }],
      { onConflict: ["Name", "Country"] }
    );
    if (cityError) {
      console.error("City upsert error:", cityError);
    }
  } catch (err) {
    console.error("Error in upsertCityAndCountry:", err);
  }
}
