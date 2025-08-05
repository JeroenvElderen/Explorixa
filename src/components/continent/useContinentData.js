// src/components/continent/useContinentData.js

import { useEffect, useState } from "react";
import { supabase } from "SupabaseClient";

const apiKey = "e1d18a84d3aa3e09beafffa4030f2b01";

export default function useContinentData(continent) {
  const [continentData, setContinentData]           = useState(null);
  const [continentCountries, setContinentCountries] = useState([]);
  const [pinCount, setPinCount]                     = useState(0);
  const [cityCount, setCityCount]                   = useState(0);
  const [allCitiesString, setAllCitiesString]       = useState("");
  const [rawPins, setRawPins]                       = useState([]);
  const [citiesTable, setCitiesTable]               = useState([]);
  const [recentPins, setRecentPins]                 = useState([]);
  const [population, setPopulation]                 = useState(null);
  const [temperature, setTemperature]               = useState(null);
  const [weatherCondition, setWeatherCondition]     = useState("");

  // 1️⃣ Fetch continent metadata
  useEffect(() => {
    if (!continent) return;
    const name = decodeURIComponent(continent).replace(/[_-]/g, " ");
    supabase
      .from("continents")
      .select("name")
      .eq("name", name)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.error("fetch continent error", error);
        else if (data) setContinentData(data);
      });
  }, [continent]);

  // 2️⃣ Fetch list of country names for this continent
  useEffect(() => {
    if (!continentData) return;
    supabase
      .from("countries")
      .select("name")
      .eq("continent", continentData.name)
      .then(({ data, error }) => {
        if (error) console.error("fetch countries error", error);
        else setContinentCountries(data.map((c) => c.name));
      });
  }, [continentData]);

  // 3️⃣ Count pins & cities for stats
  useEffect(() => {
    if (!continentCountries.length) return;

    supabase
      .from("pins")
      .select("id", { count: "exact" })
      .in("countryName", continentCountries)
      .then(({ count, error }) => {
        if (error) console.error("pins count error", error);
        else setPinCount(count);
      });

    supabase
      .from("cities")
      .select("id", { count: "exact" })
      .in("Country", continentCountries)
      .then(({ count, error }) => {
        if (error) console.error("cities count error", error);
        else setCityCount(count);
      });
  }, [continentCountries]);

  // 4️⃣ Build marquee string of all cities
  useEffect(() => {
    if (!continentCountries.length) return;
    supabase
      .from("cities")
      .select("Name, created_at")
      .in("Country", continentCountries)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("cities marquee fetch error", error);
          setAllCitiesString("");
        } else {
          const namesWithDate = (data || [])
            .filter((c) => c.Name)
            .map(
              (c) =>
                `${c.Name} added: ${new Date(c.created_at)
                  .toISOString()
                  .slice(0, 10)}`
            );
          setAllCitiesString(namesWithDate.join(" · ") + " ·");
        }
      });
  }, [continentCountries]);

  // 5️⃣ Fetch raw pins for this continent
  useEffect(() => {
    if (!continentCountries.length) {
      setRawPins([]);
      return;
    }

    const countriesToFetch = continentCountries.includes("Russia")
    ? continentCountries
    : [...continentCountries, "Russia"];

    supabase
      .from("pins")
      .select("*")
      .in("countryName", countriesToFetch)
      .order("created_at", { ascending: false })
      .limit(12)
      .then(({ data, error }) => {
        if (error) console.error("rawPins fetch error", error);
        else setRawPins(data || []);
      });
  }, [continentCountries]);

  // 6️⃣ Fetch cities table (with their own continent field)
  useEffect(() => {
    if (!continentCountries.length) {
      setCitiesTable([]);
      return;
    }
    supabase
      .from("cities")
      .select("Name, Country, continent")
      .in("Country", continentCountries)
      .then(({ data, error }) => {
        if (error) console.error("citiesTable fetch error", error);
        else setCitiesTable(data || []);
      });
  }, [continentCountries]);

  // 7️⃣ Enrich rawPins → recentPins by injecting city.continent for Russia
  useEffect(() => {
    if (!rawPins.length) {
      setRecentPins([]);
      return;
    }
    // build lookup: "City___Country" → continent
    const cityMap = citiesTable.reduce((m, c) => {
      if (c.Name && c.Country && c.continent) {
        m[`${c.Name}___${c.Country}`] = c.continent;
      }
      return m;
    }, {});
    // inject on each Russian pin
    const enriched = rawPins.map((p) => {
      if (p.countryName?.toLowerCase() === "russia") {
        const key = `${p.City}___${p.countryName}`;
        const cityCont = cityMap[key];
        if (cityCont) return { ...p, continent: cityCont };
      }
      return p;
    });
    setRecentPins(enriched);
  }, [rawPins, citiesTable]);

  // 8️⃣ Fetch population & weather
  useEffect(() => {
    if (!continentData?.name) return;
    // population
    fetch(
      `https://restcountries.com/v3.1/region/${encodeURIComponent(
        continentData.name
      )}`
    )
      .then((r) => r.json())
      .then((countries) => {
        const totalPop = countries.reduce(
          (sum, c) => sum + (c.population || 0),
          0
        );
        setPopulation(totalPop);

        // weather on first country’s capital
        const first = countries[0];
        const code = first.cca2?.toLowerCase();
        const capital = first.capital?.[0] || first.name?.common;
        if (!capital || !code) return;
        return fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
            capital
          )},${code}&units=metric&appid=${apiKey}`
        );
      })
      .then((r) => (r ? r.json() : null))
      .then((w) => {
        if (w?.main) {
          setTemperature(w.main.temp);
          setWeatherCondition(w.weather?.[0]?.main || "");
        }
      })
      .catch(console.error);
  }, [continentData]);

  return {
    continentData,
    continentCountries,
    pinCount,
    cityCount,
    recentPins,
    allCitiesString,
    population,
    temperature,
    weatherCondition,
    setRecentPins,
  };
}
