import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../SupabaseClient";
import { Grid } from "@mui/material";

// continent icons
import {
  FaGlobeAfrica,
  FaGlobeAmericas,
  FaGlobeAsia,
  FaGlobeEurope,
  FaGlobe,
} from "react-icons/fa";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Layout & other Dashboard bits
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import SimpleResponsiveNavbar from "examples/Navbars/ResponsiveNavbar/allpage";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import PinCard from "examples/Charts/PinCard";
import ProjectsContinent from "layouts/dashboard/components/ProjectsContinent";
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";

// ——— Helpers ———
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

function formatCount(num) {
  if (num >= 1e9)   return (num / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
  if (num >= 1e6)   return (num / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1e3)   return (num / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
}

function PinCardWithTimeAgo({ pin, idx }) {
  const [timeSincePost, setTimeSincePost] = useState(() => timeAgo(pin.created_at));
  useEffect(() => {
    const iv = setInterval(() => setTimeSincePost(timeAgo(pin.created_at)), 60000);
    return () => clearInterval(iv);
  }, [pin.created_at]);
  return (
    <PinCard
      color={idx === 0 ? "info" : idx === 1 ? "success" : "dark"}
      title={pin.Name || "Untitled"}
      imageurl={pin["Main Image"]}
      imagealt={pin.Name}
      height="150px"
      truncateDescription={false}
    />
  );
}

export default function ContinentPage() {
  const { continent } = useParams();
  const [continentData, setContinentData] = useState(null);
  const [continentCountries, setContinentCountries] = useState([]);
  const [pinCount, setPinCount] = useState(0);
  const [cityCount, setCityCount] = useState(0);
  const [recentPins, setRecentPins] = useState([]);
  const [lastCity, setLastCity] = useState(null);
  const [population, setPopulation] = useState(null);
  const [temperature, setTemperature] = useState(null);
  const [weatherCondition, setWeatherCondition] = useState("");
  const apiKey = "e1d18a84d3aa3e09beafffa4030f2b01";

  // continent→icon lookup
  const continentIcons = {
    africa:          FaGlobeAfrica,
    europe:          FaGlobeEurope,
    asia:            FaGlobeAsia,
    "north america": FaGlobeAmericas,
    "south america": FaGlobeAmericas,
    antarctica:      FaGlobe,
    "central america": FaGlobeAmericas,
    caribbean:       FaGlobeAmericas,
    "middle east":   FaGlobeAsia,
  };

  const displayName = useMemo(() => {
    if (continentData?.name) return continentData.name;
    return decodeURIComponent(continent).replace(/[_-]/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  }, [continentData, continent]);

  const lookupKey = decodeURIComponent(continent).replace(/[_-]/g, " ").toLowerCase();

  // 1) Load continent record
  useEffect(() => {
    if (!continent) return;
    const name = decodeURIComponent(continent).replace(/[_-]/g, " ");
    supabase
      .from("continents")
      .select("name")
      .eq("name", name)
      .maybeSingle()
      .then(({ data }) => data && setContinentData(data));
  }, [continent]);

  // 2) Get list of countries
  useEffect(() => {
    if (!continentData) return;
    supabase
      .from("countries")
      .select("name")
      .eq("continent", continentData.name)
      .then(({ data }) => data && setContinentCountries(data.map(c => c.name)));
  }, [continentData]);

  // 3) Counts
  useEffect(() => {
    if (!continentCountries.length) return;
    supabase.from("pins").select("*", { count: "exact", head: true }).in("countryName", continentCountries).then(({ count }) => setPinCount(count));
    supabase.from("cities").select("*", { count: "exact", head: true }).in("Country", continentCountries).then(({ count }) => setCityCount(count));
  }, [continentCountries]);

  // 4) Last city
  useEffect(() => {
    if (!continentCountries.length) return;
    supabase.from("cities").select("Name").in("Country", continentCountries).order("id", { ascending: false }).limit(1).then(({ data }) => data && setLastCity(data[0]));
  }, [continentCountries]);

  // 5) Recent pins
  useEffect(() => {
    if (!continentCountries.length) return;
    supabase
      .from("pins")
      .select("*")
      .in("countryName", continentCountries)
      .order("created_at", { ascending: false })
      .limit(12)
      .then(({ data }) => data && setRecentPins(data));
  }, [continentCountries]);

  // 6) Weather & population
  useEffect(() => {
    if (!continentData?.name) return;
    fetch(`https://restcountries.com/v3.1/region/${encodeURIComponent(continentData.name)}`)
      .then(r => r.json())
      .then(countries => {
        const totalPop = countries.reduce((sum, c) => sum + (c.population || 0), 0);
        setPopulation(totalPop);
        const first = countries[0];
        const code = first.cca2.toLowerCase();
        const capital = first.capital?.[0] || first.name.common;
        return fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(capital)},${code}&units=metric&appid=${apiKey}`);
      })
      .then(r => r.json())
      .then(w => {
        if (w.main) {
          setTemperature(w.main.temp);
          setWeatherCondition(w.weather[0].main);
        }
      })
      .catch(console.error);
  }, [continentData]);

  const weatherEmoji = {
    Clear: "☀️", Clouds: "☁️", Rain: "🌧️", Snow: "❄️", Thunderstorm: "⛈️",
    Drizzle: "🌦️", Mist: "🌫️", Smoke: "💨", Haze: "🌁", Dust: "🌪️",
  };

  return (
    <DashboardLayout>
      <SimpleResponsiveNavbar/>
      <MDBox py={3}>
        {/* ─── Stats Row ───────────────────── */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <ComplexStatisticsCard
              color="dark"
              icon="place"
              title={`Pins in ${displayName}`}
              count={pinCount}
              percentage={{ color: "success", amount: `Recent` }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <ComplexStatisticsCard
              icon="house"
              title="Cities"
              count={cityCount}
              percentage={lastCity ? { color: "success", amount: `Last: ${lastCity.Name}` } : undefined}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <ComplexStatisticsCard
              color="info"
              icon="thermostat"
              title="Temperature"
              count={temperature != null ? `${temperature.toFixed(1)}°C` : "…"}
              percentage={{ amount: `${weatherEmoji[weatherCondition] || ""} ${weatherCondition}`, label: "Weather" }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {(() => {
              const IconComp = continentIcons[lookupKey] || FaGlobe;
              return (
                <ComplexStatisticsCard
                  color="primary"
                  icon={<IconComp size={26}/>}
                  title="Population"
                  count={population != null ? formatCount(population) : "…"}
                  percentage={{ color: "success", amount: "Updated" }}
                />
              );
            })()}
          </Grid>
        </Grid>

        {/* ─── Recent Pins ─────────────────── */}
        <MDBox mt={4.5} mb={4.5}>
          <Grid container spacing={3}>
            {recentPins.map((pin, idx) => (
              <Grid item xs={12} sm={6} md={3} key={pin.id}>
                <PinCardWithTimeAgo pin={pin} idx={idx}/>
              </Grid>
            ))}
          </Grid>
        </MDBox>

        {/* ─── Projects & Orders ──────────── */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <ProjectsContinent continent={displayName}/>
          </Grid>
          <Grid item xs={12} md={4}>
            <OrdersOverview cities={continentCountries} countryName={displayName}/>
          </Grid>
        </Grid>
      </MDBox>
      <Footer/>
    </DashboardLayout>
  );
}
