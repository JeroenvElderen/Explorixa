import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../SupabaseClient";

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Layout & other Dashboard bits
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import SimpleResponsiveNavbar from "examples/Navbars/ResponsiveNavbar/allpage";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import PinCard from "examples/Charts/PinCard";
import PinDetailCard from "components/PinDetailCard";
import PinCardForm from "examples/PinCardForm";
import Projects from "layouts/dashboard/components/Projects";
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";

// ——— Helpers ———
function truncate(text, maxLength) {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "…" : text;
}

function timeAgo(date) {
  if (!date) return "";
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  if (diffMs < 0) return "Just now";
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

function PinCardWithTimeAgo({ pin, idx, truncateDescription, isExpanded }) {
  const [timeSincePost, setTimeSincePost] = useState(() => timeAgo(pin.created_at));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSincePost(timeAgo(pin.created_at));
    }, 60000);
    return () => clearInterval(interval);
  }, [pin.created_at]);

  const description = truncateDescription ? truncate(pin.Information, 100) : pin.Information;

  return (
    <PinCard
      color={idx === 0 ? "info" : idx === 1 ? "success" : "dark"}
      title={pin?.Name || "Untitled"}
      description={description}
      date={timeSincePost}
      imageurl={pin["Main Image"]}
      imagealt={pin.Name}
      height={isExpanded ? "800px" : "150px"}
      truncateDescription={truncateDescription}
    />
  );
}

export default function CountryPage() {
  const { countrySlug } = useParams();
  const countryName = useMemo(
    () =>
      decodeURIComponent(countrySlug)
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
    [countrySlug]
  );

  // Insert country fallback
  useEffect(() => {
    if (!countryName || countryName === "Overview") return;
    supabase
      .from("countries")
      .insert(
        { name: countryName, country_info: null, moving_info: null, animal_info: null },
        { onConflict: "name", ignoreDuplicates: true }
      )
      .then(({ error }) => error && console.error(error));
  }, [countryName]);

  // State
  const [pinCount, setPinCount] = useState(0);
  const [cityCount, setCityCount] = useState(0);
  const [recentPins, setRecentPins] = useState([]);
  const [lastPinCreatedTimeAgo, setLastPinCreatedTimeAgo] = useState("");
  const [lastCity, setLastCity] = useState(null);
  const [allPins, setAllPins] = useState([]);
  const [showAllPins, setShowAllPins] = useState(false);
  const [showPinForm, setShowPinForm] = useState(false);
  const [expandedPinId, setExpandedPinId] = useState(null);
  const [hoveredRecentPinId, setHoveredRecentPinId] = useState(null);
  const [countryCities, setCountryCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("All");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [temperature, setTemperature] = useState(null);
  const [weatherCondition, setWeatherCondition] = useState("");
  const [population, setPopulation] = useState(null);

  const apiKey = "e1d18a84d3aa3e09beafffa4030f2b01";

  // Fetch stats
  useEffect(() => {
    supabase
      .from("pins")
      .select("*", { count: "exact", head: true })
      .eq("countryName", countryName)
      .then(({ count, error }) => !error && setPinCount(count));
    supabase
      .from("cities")
      .select("*", { count: "exact", head: true })
      .eq("Country", countryName)
      .then(({ count, error }) => !error && setCityCount(count));
  }, [countryName]);

  // Last city
  useEffect(() => {
    supabase
      .from("cities")
      .select("Name, id")
      .eq("Country", countryName)
      .order("id", { ascending: false })
      .limit(1)
      .then(({ data }) => data?.[0] && setLastCity(data[0]));
  }, [countryName]);

  // Filters data
  useEffect(() => {
    supabase
      .from("cities")
      .select("Name")
      .eq("Country", countryName)
      .then(({ data }) => data && setCountryCities(["All", ...new Set(data.map((c) => c.Name))]));
    supabase
      .from("Category")
      .select("name")
      .then(({ data }) => data && setCategories(["All", ...new Set(data.map((c) => c.name))]));
  }, [countryName]);

  // Recent pins
  useEffect(() => {
    supabase
      .from("pins")
      .select("*")
      .eq("countryName", countryName)
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data, error }) => {
        if (!error && data.length) {
          setRecentPins(data);
          setLastPinCreatedTimeAgo(timeAgo(data[0].created_at));
        }
      });
  }, [countryName]);

  // All pins
  const fetchAllPins = () => {
    let q = supabase.from("pins").select("*").eq("countryName", countryName);
    if (selectedCity !== "All") q = q.eq("City", selectedCity);
    if (selectedCategory !== "All") q = q.eq("Category", selectedCategory);
    q.order("created_at", { ascending: false }).then(({ data, error }) => !error && setAllPins(data));
  };
  useEffect(fetchAllPins, [countryName, selectedCity, selectedCategory, showAllPins]);

  // Population + Weather
  useEffect(() => {
    fetch(`https://restcountries.com/v3.1/name/${countryName}`)
      .then((r) => r.json())
      .then((data) => {
        const info = Array.isArray(data) && data[0];
        if (!info) throw new Error("No country data");
        setPopulation(info.population);
        const capital = info.capital?.[0] || countryName;
        return fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${capital.charAt(0).toUpperCase() + capital.slice(1)},${info.cca2.toLowerCase()}&units=metric&appid=${apiKey}`
        );
      })
      .then((r) => r.json())
      .then((w) => w.main && setWeatherCondition(w.weather[0].main) && setTemperature(w.main.temp))
      .catch(console.error);
  }, [countryName]);

  const weatherEmoji = {
    Clear: "☀️",
    Clouds: "☁️",
    Rain: "🌧️",
    Snow: "❄️",
    Thunderstorm: "⛈️",
    Drizzle: "🌦️",
    Mist: "🌫️",
    Smoke: "💨",
    Haze: "🌁",
    Dust: "🌪️",
    Fog: "🌁",
    Sand: "🏜️",
    Ash: "🌋",
    Squall: "🌬️",
    Tornado: "🌪️",
  };

  // Handlers
  const handlePinSaved = (newPin) => {
    setShowPinForm(false);
    setShowAllPins(false);
    fetchAllPins();
  };
  const handleCancel = () => setShowPinForm(false);

  return (
    <DashboardLayout>
      <SimpleResponsiveNavbar />
      <MDBox py={3}>
        {!showPinForm && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5} sx={{ cursor: "pointer" }} onClick={() => { setShowAllPins(true); fetchAllPins(); }}>
                <ComplexStatisticsCard color="dark" icon="place" title="See all pins" count={pinCount} percentage={{ color: "success", amount: `Created ${lastPinCreatedTimeAgo}` }} />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard icon="house" title="Current cities" count={cityCount} {...(lastCity ? { percentage: { color: "success", amount: `Last: ${lastCity.Name}` } } : {})} />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard color="info" icon="thermostat" title="Temperature" count={temperature != null ? `${temperature.toFixed(1)}°C` : "…"} percentage={{ color: weatherCondition === "Clear" ? "success" : weatherCondition === "Rain" ? "error" : "warning", amount: `${weatherEmoji[weatherCondition] || ''} ${weatherCondition}`, label: "Weather" }} />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard color="primary" icon={<img src={`https://flagcdn.com/w320/${countryName.toLowerCase().replace(/ /g, '-')}.png`} alt={`${countryName} flag`} style={{ width: 26, height: 26, objectFit: "cover", borderRadius: 4 }} />} title="Population" count={population?.toLocaleString() || "…"} percentage={{ color: "success", amount: "Updated" }} />
              </MDBox>
            </Grid>
          </Grid>
        )}

        {showAllPins ? (
          <MDBox mt={4.5}>
            {/* Filters & List omitted for brevity */}
          </MDBox>
        ) : showPinForm ? (
          <MDBox mt={4}> <PinCardForm countryName={countryName} onSubmit={handlePinSaved} onCancel={handleCancel} /></MDBox>
        ) : (
          <>
            <MDBox mt={4.5} mb={4.5} >
              <Grid container spacing={3}>
                {recentPins.map((pin, idx) => (
                  <Grid item xs={12} md={6} lg={4} key={pin.id} >
                    <MDBox mb={3} sx={{
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        background:
          "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
        border: "1px solid rgba(243, 143, 1, 0.6)",
        boxShadow:
          "inset 4px 4px 10px rgba(0,0,0,0.4), inset -4px -4px 10px rgba(255,255,255,0.1), 0 6px 15px rgba(0,0,0,0.3)",
        borderRadius: "12px",

        "&::-webkit-scrollbar": { width: 0, height: 0 },
        "&::-webkit-scrollbar-track": { background: "transparent" },
        "&::-webkit-scrollbar-thumb": { background: "transparent" },

        scrollbarWidth: "none",
        scrollbarColor: "transparent transparent",
        "-ms-overflow-style": "none",
      }} onClick={() => setExpandedPinId(pin.id)} onMouseEnter={() => setHoveredRecentPinId(pin.id)} onMouseLeave={() => setHoveredRecentPinId(null)}>
                      <PinCardWithTimeAgo pin={pin} idx={idx} truncateDescription={hoveredRecentPinId !== pin.id} isExpanded={expandedPinId === pin.id}  />
                    </MDBox>
                  </Grid>
                ))}
              </Grid>
            </MDBox>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}> <Projects country={countryName} /> </Grid>
              <Grid item xs={12} md={4}> <OrdersOverview cities={countryCities} countryName={countryName} /> </Grid>
            </Grid>
          </>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
