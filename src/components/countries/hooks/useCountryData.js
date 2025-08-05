import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "SupabaseClient";
import { timeAgo } from "../helpers";

const API_KEY = "e1d18a84d3aa3e09beafffa4030f2b01";

export function useCountryData(countryName) {
  // —— State
  const [pinCount, setPinCount] = useState(0);
  const [cityCount, setCityCount] = useState(0);
  const [recentPins, setRecentPins] = useState([]);
  const [lastPinTimeAgo, setLastPinTimeAgo] = useState("");
  const [lastCity, setLastCity] = useState(null);
  const [allPins, setAllPins] = useState([]);
  const [countryCities, setCountryCities] = useState([]);
  const [countryCitiesData, setCountryCitiesData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [population, setPopulation] = useState(null);
  const [countryCode, setCountryCode] = useState("");
  const [temperature, setTemperature] = useState(null);
  const [weatherCondition, setWeatherCondition] = useState("");

  // —— Fetch total pin & city counts
  useEffect(() => {
    if (!countryName) return;
    supabase
      .from("pins")
      .select("*", { count: "exact", head: true })
      .eq("countryName", countryName)
      .then(({ count, error }) => !error && setPinCount(count || 0));

    supabase
      .from("cities")
      .select("*", { count: "exact", head: true })
      .eq("Country", countryName)
      .then(({ count, error }) => !error && setCityCount(count || 0));
  }, [countryName]);

  // —— Last created city
  useEffect(() => {
    if (!countryName) return;
    supabase
      .from("cities")
      .select("Name, id")
      .eq("Country", countryName)
      .order("id", { ascending: false })
      .limit(1)
      .then(({ data }) => data?.[0] && setLastCity(data[0]));
  }, [countryName]);

  // —— Recent pins & timestamp
  useEffect(() => {
    if (!countryName) return;
    supabase
      .from("pins")
      .select("*")
      .eq("countryName", countryName)
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data, error }) => {
        if (!error && data && data.length) {
          setRecentPins(data);
          setLastPinTimeAgo(timeAgo(data[0].created_at));
        } else {
          setRecentPins([]);
          setLastPinTimeAgo("");
        }
      });
  }, [countryName]);

  // —— City list & pin categories
  useEffect(() => {
    if (!countryName) return;
    supabase
      .from("cities")
      .select("Name")
      .eq("Country", countryName)
      .then(({ data }) =>
        setCountryCities([
          "All",
          ...(data ? Array.from(new Set(data.map((c) => c.Name))) : []),
        ])
      );

    supabase
      .from("pins")
      .select("Category")
      .eq("countryName", countryName)
      .then(({ data }) =>
        setCategories([
          "All",
          ...(data
            ? Array.from(
                new Set(data.map((c) => c.Category).filter(Boolean))
              )
            : []),
        ])
      );
  }, [countryName]);

  // —— All pins (filtered externally)
  useEffect(() => {
    if (!countryName) return;
    // Note: filtering by city/category should be passed into this hook,
    // or handled separately by the component.
    supabase
      .from("pins")
      .select("*")
      .eq("countryName", countryName)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setAllPins(data);
        else setAllPins([]);
      });
  }, [countryName]);

  // —— City creation history (for marquee, etc.)
  useEffect(() => {
    if (!countryName) return;
    supabase
      .from("cities")
      .select("Name, created_at")
      .eq("Country", countryName)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setCountryCitiesData(data ? data.filter((c) => !!c.Name) : []);
      });
  }, [countryName]);

  // —— Population & Weather
  useEffect(() => {
    if (!countryName) return;
    fetch(`https://restcountries.com/v3.1/name/${countryName}?fullText=true`)
      .then((r) => r.json())
      .then((data) => {
        const info = Array.isArray(data) && data[0];
        if (!info) throw new Error("No country data");
        setPopulation(info.population);
        setCountryCode(info.cca2?.toLowerCase() || "");
        const capital = info.capital?.[0] || countryName;
        return fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${capital},${info.cca2.toLowerCase()}&units=metric&appid=${API_KEY}`
        );
      })
      .then((r) => r.json())
      .then((w) => {
        if (w.main) {
          setWeatherCondition(w.weather?.[0]?.main || "");
          setTemperature(w.main.temp);
        }
      })
      .catch(() => {
        setPopulation(null);
        setCountryCode("");
        setWeatherCondition("");
        setTemperature(null);
      });
  }, [countryName]);

  // —— Return everything the page needs
  return {
    pinCount,
    cityCount,
    recentPins,
    lastPinTimeAgo,
    lastCity,
    allPins,
    countryCities,
    countryCitiesData,
    categories,
    population,
    countryCode,
    temperature,
    weatherCondition,
  };
}
