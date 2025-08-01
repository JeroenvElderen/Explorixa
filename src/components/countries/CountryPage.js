import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../SupabaseClient";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import SimpleResponsiveNavbar from "examples/Navbars/ResponsiveNavbar/allpage";
import Footer from "examples/Footer";
import StarFieldOverall from "components/StarFieldOverall";
import { motion } from "framer-motion";

// Subcomponents
import TopStats from "./TopStats";
import PinsView from "./PinsView";
import RecentPins from "./RecentPins";
import CountryMap from "./CountryMap";
import NavigationButtons from "./NavigationButtons";
import { truncate, timeAgo, weatherEmoji } from "./helpers";

export default function CountryPage() {
  const { countrySlug, continent } = useParams();
  const navigate = useNavigate();
  const apiKey = "e1d18a84d3aa3e09beafffa4030f2b01";

  // Derived country name
  const countryName = useMemo(
    () =>
      decodeURIComponent(countrySlug || "")
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
    [countrySlug]
  );

  // --- States ---
  const [pinCount, setPinCount] = useState(0);
  const [cityCount, setCityCount] = useState(0);
  const [recentPins, setRecentPins] = useState([]);
  const [lastPinCreatedTimeAgo, setLastPinCreatedTimeAgo] = useState("");
  const [lastCity, setLastCity] = useState(null);
  const [allPins, setAllPins] = useState([]);
  const [countryCities, setCountryCities] = useState([]);
  const [countryCitiesData, setCountryCitiesData] = useState([]); // For marquee
  const [categories, setCategories] = useState([]);
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [countryCode, setCountryCode] = useState("");
  const [population, setPopulation] = useState(null);
  const [temperature, setTemperature] = useState(null);
  const [weatherCondition, setWeatherCondition] = useState("");
  const [showAllPins, setShowAllPins] = useState(false);
  const [expandedPinId, setExpandedPinId] = useState(null);

  // --- Data Fetching ---

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

  useEffect(() => {
    if (!countryName) return;
    supabase
      .from("cities")
      .select("Name")
      .eq("Country", countryName)
      .then(({ data }) =>
        setCountryCities(["All", ...(data ? Array.from(new Set(data.map((c) => c.Name))) : [])])
      );

    supabase
      .from("pins")
      .select("Category")
      .eq("countryName", countryName)
      .then(({ data }) =>
        setCategories([
          "All",
          ...(data ? Array.from(new Set(data.map((c) => c.Category).filter(Boolean))) : []),
        ])
      );
  }, [countryName]);

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
          setLastPinCreatedTimeAgo(timeAgo(data[0].created_at));
        } else {
          setRecentPins([]);
          setLastPinCreatedTimeAgo("");
        }
      });
  }, [countryName]);

  useEffect(() => {
    if (!countryName) return;
    let q = supabase.from("pins").select("*").eq("countryName", countryName);
    if (selectedCity !== "All") q = q.eq("City", selectedCity);
    if (selectedCategory !== "All") q = q.eq("Category", selectedCategory);
    q.order("created_at", { ascending: false }).then(({ data, error }) => {
      if (!error && data) setAllPins(data);
      else setAllPins([]);
    });
  }, [countryName, selectedCity, selectedCategory, showAllPins]);

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
          `https://api.openweathermap.org/data/2.5/weather?q=${capital},${info.cca2.toLowerCase()}&units=metric&appid=${apiKey}`
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

  useEffect(() => {
    if (!countryName) return;
    supabase
      .from("cities")
      .select("Name, created_at")
      .eq("Country", countryName)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setCountryCitiesData(data ? data.filter(c => !!c.Name) : []);
      });
  }, [countryName]);

  const handlePinClick = (pin) => {
    const pinSlug = encodeURIComponent(pin.Name?.replace(/\s/g, "_") || pin.id);
    navigate(
      `/Destinations/${encodeURIComponent(continent)}/${encodeURIComponent(
        countrySlug
      )}/${pinSlug}`,
      { state: { pin } }
    );
  };

  const handleBack = () =>
    navigate(`/Destinations/${encodeURIComponent(continent)}`);

  const handleNextCountry = () => {};
  const handlePrevCountry = () => {};

  function formatDate(isoString) {
    if (!isoString) return "";
    const d = new Date(isoString);
    return d.toISOString().slice(0, 10);
  }

  const marqueeCities = countryCitiesData
    .map(city => `${city.Name} added: ${formatDate(city.created_at)}`)
    .join(" · ") + " ·";

  return (
    <DashboardLayout>
      {/* Stylish blurred SVG background */}
      <div
        style={{
          position: "fixed",
          top: "-120px",
          left: "-80px",
          zIndex: -1,
          filter: "blur(70px)",
          opacity: 0.14,
          pointerEvents: "none",
        }}
      >
        <svg width="600" height="600" viewBox="0 0 600 600" fill="none">
          <circle cx="300" cy="300" r="250" fill="#f18f01" />
        </svg>
      </div>
      <StarFieldOverall />
      <SimpleResponsiveNavbar />

      <MDBox px={3} py={1}>
        <NavigationButtons
          continent={continent}
          onBack={handleBack}
          onNextCountry={handleNextCountry}
          onPrevCountry={handlePrevCountry}
        />
      </MDBox>

      <MDBox py={3}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
        >
          <TopStats
            pinCount={pinCount}
            lastPinCreatedTimeAgo={lastPinCreatedTimeAgo}
            cityCount={cityCount}
            lastCity={lastCity}
            marqueeCities={marqueeCities}
            temperature={temperature}
            weatherCondition={weatherCondition}
            countryCode={countryCode}
            countryName={countryName}
            population={population}
            weatherEmoji={weatherEmoji}
            onSeeAllPins={() => setShowAllPins(true)}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.18 }}
        >
          <CountryMap
            pins={allPins.filter((pin) => pin.lat && pin.lng)}
            onPinClick={handlePinClick}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.31 }}
        >
          {showAllPins ? (
            <PinsView
              allPins={allPins}
              countryCities={countryCities}
              categories={categories}
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onReset={() => {
                setSelectedCity("All");
                setSelectedCategory("All");
              }}
              onBack={() => setShowAllPins(false)}
              handlePinClick={handlePinClick}
            />
          ) : (
            <RecentPins
              recentPins={recentPins}
              expandedPinId={expandedPinId}
              handlePinClick={handlePinClick}
              countryName={countryName}
              countryCities={countryCities}
              setExpandedPinId={setExpandedPinId}
            />
          )}
        </motion.div>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
