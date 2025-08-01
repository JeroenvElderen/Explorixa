import { useEffect, useState } from "react";
import { supabase } from "SupabaseClient";

const apiKey = "e1d18a84d3aa3e09beafffa4030f2b01";

export default function useContinentData(continent) {
  const [continentData, setContinentData] = useState(null);
  const [continentCountries, setContinentCountries] = useState([]);
  const [pinCount, setPinCount] = useState(0);
  const [cityCount, setCityCount] = useState(0);
  const [recentPins, setRecentPins] = useState([]);
  const [allCitiesString, setAllCitiesString] = useState("");
  const [population, setPopulation] = useState(null);
  const [temperature, setTemperature] = useState(null);
  const [weatherCondition, setWeatherCondition] = useState("");

  // Fetch continent data
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

  // Fetch countries in continent
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

  // Count pins and cities (all continent countries)
  useEffect(() => {
    if (!continentCountries.length) return;

    supabase
      .from("pins")
      .select("id")
      .in("countryName", continentCountries)
      .then(({ data, error }) => {
        if (error) console.error("pins query error", error);
        else setPinCount(data.length);
      });

    supabase
      .from("cities")
      .select("id")
      .in("Country", continentCountries)
      .then(({ data, error }) => {
        if (error) {
          console.error("cities query error", error);
          setCityCount(0);
        } else {
          setCityCount(data.length);
        }
      });
  }, [continentCountries]);

  // Fetch ALL city names with creation dates for scrolling marquee
  useEffect(() => {
    if (!continentCountries.length) return;
    supabase
      .from("cities")
      .select("Name, created_at")
      .in("Country", continentCountries)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data && data.length) {
          const namesWithDate = data
            .filter(c => c.Name)
            .map(city => `${city.Name} added: ${new Date(city.created_at).toISOString().slice(0, 10)}`);
          setAllCitiesString(namesWithDate.join(" · ") + " ·");
        } else {
          setAllCitiesString("");
        }
      });
  }, [continentCountries]);

  // Fetch recent pins
  useEffect(() => {
    if (!continentCountries.length) return;
    supabase
      .from("pins")
      .select("*")
      .in("countryName", continentCountries)
      .order("created_at", { ascending: false })
      .limit(12)
      .then(({ data, error }) => {
        if (error) {
          console.error("recentPins fetch error", error);
        } else if (data) {
          setRecentPins(data);
        }
      });
  }, [continentCountries]);

  // Population & weather
  useEffect(() => {
    if (!continentData?.name) return;
    fetch(
      `https://restcountries.com/v3.1/region/${encodeURIComponent(continentData.name)}`
    )
      .then((r) => r.json())
      .then((countries) => {
        const totalPop = countries.reduce((sum, c) => sum + (c.population || 0), 0);
        setPopulation(totalPop);
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
      .then((r) => r && r.json())
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
