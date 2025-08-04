// hooks/useContinentPins.js
import { useEffect, useMemo, useState } from "react";

/**
 * @param {string} continentName - e.g. "Europe"
 * @param {Function} fetchPins - () => Promise<array of pin objects from your API]
 * @param {Function} fetchCountries - () => Promise<array of country objects with { name, continent }]
 */
export default function useContinentPins(
  continentName,
  fetchPins,
  fetchCountries
) {
  const [pins, setPins] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // load pins + countries in parallel
  useEffect(() => {
    if (!continentName) return;
    setLoading(true);
    setError(null);
    Promise.all([fetchPins(), fetchCountries()])
      .then(([pinsData, countriesData]) => {
        setPins(pinsData || []);
        setCountries(countriesData || []);
      })
      .catch((e) => {
        console.error("Failed to load pins/countries", e);
        setError(e);
      })
      .finally(() => setLoading(false));
  }, [continentName, fetchPins, fetchCountries]);

  // build normalization key for matching
  const normalize = (s) =>
    String(s || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

  // map country name → continent
  const countryToContinent = useMemo(() => {
    const map = new Map();
    countries.forEach((c) => {
      map.set(normalize(c.name), c.continent);
    });
    return map;
  }, [countries]);

  // filtered pins for that continent
  const continentPins = useMemo(() => {
    if (!continentName) return [];
    return pins
      .filter((p) => {
        const cn = normalize(p.countryName);
        const cont = countryToContinent.get(cn);
        return cont && cont.toLowerCase() === continentName.toLowerCase();
      })
      .filter((p) => p.latitude != null && p.longitude != null)
      .map((p) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [parseFloat(p.longitude), parseFloat(p.latitude)],
        },
        properties: {
          pinId: p.id,
          title: p.Name,
          description: p["Post Summary"],
          imageurl: p["Main Image"],
          date: p.created_at,
          countryName: p.countryName,
          Information: p.Information,
          been_there: p.been_there,
          want_to_go: p.want_to_go,
          saved_count: p.saved_count,
          iso: p.iso || "default",
          // any additional fields needed by popup
        },
      }));
  }, [pins, countryToContinent, continentName]);

  return {
    continentPins,
    loading,
    error,
  };
}
