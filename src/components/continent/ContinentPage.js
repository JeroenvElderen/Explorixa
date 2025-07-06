import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../SupabaseClient";
import { Button, FormControl, Select, MenuItem } from "@mui/material";
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

function PinCardWithTimeAgo({
  pin,
  idx,
  truncateDescription,
  isExpanded,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) {
  const [timeSincePost, setTimeSincePost] = useState(() => timeAgo(pin.created_at));

  useEffect(() => {
    const iv = setInterval(() => setTimeSincePost(timeAgo(pin.created_at)), 60_000);
    return () => clearInterval(iv);
  }, [pin.created_at]);

  return (
    <PinCard
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      color={idx === 0 ? "info" : idx === 1 ? "success" : "dark"}
      title={pin.Name || "Untitled"}
      description={truncateDescription ? truncate(pin.Information, 100) : pin.Information}
      date={timeSincePost}
      imageurl={pin["Main Image"]}
      imagealt={pin.Name}
      height={isExpanded ? "800px" : "150px"}
      truncateDescription={truncateDescription}
    />
  );
}

export default function ContinentPage() {
  const { continentSlug } = useParams();
  const continentName = useMemo(
    () =>
      decodeURIComponent(continentSlug)
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
    [continentSlug]
  );

  // List of all country names in this continent
  const [continentCountries, setContinentCountries] = useState([]);

  // Stats
  const [pinCount, setPinCount] = useState(0);
  const [cityCount, setCityCount] = useState(0);
  const [recentPins, setRecentPins] = useState([]);
  const [lastPinCreatedTimeAgo, setLastPinCreatedTimeAgo] = useState("");
  const [lastCity, setLastCity] = useState(null);
  const [allPins, setAllPins] = useState([]);
  const [countryCities, setCountryCities] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Weather & population
  const [countryCode, setCountryCode] = useState("");
  const [temperature, setTemperature] = useState(null);
  const [weatherCondition, setWeatherCondition] = useState("");
  const [population, setPopulation] = useState(null);
  const apiKey = "e1d18a84d3aa3e09beafffa4030f2b01";

  // Controls
  const [showAllPins, setShowAllPins] = useState(false);
  const [expandedPinId, setExpandedPinId] = useState(null);
  const [hoveredRecentPinId, setHoveredRecentPinId] = useState(null);
  const [showPinForm, setShowPinForm] = useState(false);

  // Load countries for this continent
  useEffect(() => {
    if (!continentName) return;
    supabase
      .from("countries")
      .select("name")
      .eq("continent", continentName)
      .then(({ data, error }) => {
        if (error) return console.error(error);
        setContinentCountries(data.map((c) => c.name));
      });
  }, [continentName]);

  // Fetch counts
  useEffect(() => {
    if (!continentCountries.length) return;

    supabase
      .from("pins")
      .select("*", { count: "exact", head: true })
      .in("countryName", continentCountries)
      .then(({ count, error }) => !error && setPinCount(count));

    supabase
      .from("cities")
      .select("*", { count: "exact", head: true })
      .in("Country", continentCountries)
      .then(({ count, error }) => !error && setCityCount(count));
  }, [continentCountries]);

  // Last city
  useEffect(() => {
    if (!continentCountries.length) return;
    supabase
      .from("cities")
      .select("Name, id")
      .in("Country", continentCountries)
      .order("id", { ascending: false })
      .limit(1)
      .then(({ data }) => data?.[0] && setLastCity(data[0]));
  }, [continentCountries]);

  // Filters (cities & categories)
  useEffect(() => {
    if (!continentCountries.length) return;
    supabase
      .from("cities")
      .select("Name")
      .in("Country", continentCountries)
      .then(({ data }) =>
        setCountryCities(data ? ["All", ...new Set(data.map((c) => c.Name))] : [])
      );

    supabase
      .from("Category")
      .select("name")
      .then(({ data }) =>
        setCategories(data ? ["All", ...new Set(data.map((c) => c.name))] : [])
      );
  }, [continentCountries]);

  // Recent pins
  useEffect(() => {
    if (!continentCountries.length) return;
    supabase
      .from("pins")
      .select("*")
      .in("countryName", continentCountries)
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data, error }) => {
        if (!error && data.length) {
          setRecentPins(data);
          setLastPinCreatedTimeAgo(timeAgo(data[0].created_at));
        }
      });
  }, [continentCountries]);

  // All pins fetcher
  const fetchAllPins = () => {
    if (!continentCountries.length) return;
    let q = supabase
      .from("pins")
      .select("*")
      .in("countryName", continentCountries);

    if (selectedCity !== "All") q = q.eq("City", selectedCity);
    if (selectedCategory !== "All") q = q.eq("Category", selectedCategory);

    q.order("created_at", { ascending: false }).then(({ data, error }) => {
      if (!error) setAllPins(data);
    });
  };
  useEffect(fetchAllPins, [
    continentCountries,
    selectedCity,
    selectedCategory,
    showAllPins,
  ]);

  // Population + Weather
  useEffect(() => {
    if (!continentCountries.length) return;
    // We’ll fetch country data for the first country (just to get a flag/pop and do weather on its capital)
    const firstCountry = continentCountries[0];
    fetch(`https://restcountries.com/v3.1/name/${firstCountry}`)
      .then((r) => r.json())
      .then((data) => {
        const info = Array.isArray(data) && data[0];
        if (!info) throw new Error("No country data");
        setPopulation(info.population);
        setCountryCode(info.cca2.toLowerCase());
        const capital = info.capital?.[0] || firstCountry;

        return fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${capital},${info.cca2.toLowerCase()}&units=metric&appid=${apiKey}`
        );
      })
      .then((r) => r.json())
      .then((w) => {
        if (w.main) {
          setWeatherCondition(w.weather[0].main);
          setTemperature(w.main.temp);
        }
      })
      .catch(console.error);
  }, [continentCountries]);

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
  const openAllPins = () => {
    setShowAllPins(true);
    setExpandedPinId(null);
  };
  const backToRecent = () => {
    setShowAllPins(false);
    setExpandedPinId(null);
  };

  return (
    <DashboardLayout>
      <SimpleResponsiveNavbar />
      <MDBox py={3}>
        {!showPinForm && (
          <Grid container spacing={3}>
            {/* See All Pins */}
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5} sx={{ cursor: "pointer" }} onClick={openAllPins}>
                <ComplexStatisticsCard
                  color="dark"
                  icon="place"
                  title={`Pins in ${continentName}`}
                  count={pinCount}
                  percentage={{
                    color: "success",
                    amount: `Created ${lastPinCreatedTimeAgo}`,
                  }}
                />
              </MDBox>
            </Grid>
            {/* Cities */}
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  icon="house"
                  title="Current cities"
                  count={cityCount}
                  {...(lastCity && {
                    percentage: {
                      color: "success",
                      amount: `Last: ${lastCity.Name}`,
                    },
                  })}
                />
              </MDBox>
            </Grid>
            {/* Temperature */}
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="info"
                  icon="thermostat"
                  title="Temperature"
                  count={temperature != null ? `${temperature.toFixed(1)}°C` : "…"}
                  percentage={{
                    color:
                      weatherCondition === "Clear"
                        ? "success"
                        : weatherCondition === "Rain"
                        ? "error"
                        : "warning",
                    amount: `${weatherEmoji[weatherCondition] || ""} ${weatherCondition}`,
                    label: "Weather",
                  }}
                />
              </MDBox>
            </Grid>
            {/* Population */}
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="primary"
                  icon={
                    countryCode ? (
                      <img
                        src={`https://flagcdn.com/w320/${countryCode}.png`}
                        alt={`${continentName} flag`}
                        style={{
                          width: 26,
                          height: 26,
                          objectFit: "cover",
                          borderRadius: 4,
                        }}
                      />
                    ) : null
                  }
                  title="Population"
                  count={population?.toLocaleString() || "…"}
                  percentage={{ color: "success", amount: "Updated" }}
                />
              </MDBox>
            </Grid>
          </Grid>
        )}

        {showAllPins ? (
          <>
            {/* Filters */}
            <MDBox
              mb={3}
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                p: 2,
                borderRadius: 2,
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "1px solid rgba(243,143,1,0.6)",
              }}
            >
              <FormControl variant="outlined" size="medium" sx={{ minWidth: 180, /* …styles… */ }}>
                <Select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  displayEmpty
                  sx={{ color: "white", height: "100%" }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: "#F18F01 !important",
                        "& .MuiMenuItem-root": {
                          backgroundColor: "#F18F01",
                          color: "white",
                        },
                        "& .MuiMenuItem-root:hover": {
                          backgroundColor: "#D17C00",
                        },
                        "& .MuiMenuItem-root.Mui-selected": {
                          backgroundColor: "#D17C00",
                        },
                      },
                    },
                  }}
                >
                  {countryCities.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl variant="outlined" size="medium" sx={{ minWidth: 180, /* …styles… */ }}>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  displayEmpty
                  sx={{ color: "white", height: "100%" }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: "#F18F01 !important",
                        "& .MuiMenuItem-root": {
                          backgroundColor: "#F18F01",
                          color: "white",
                        },
                        "& .MuiMenuItem-root:hover": {
                          backgroundColor: "#D17C00",
                        },
                        "& .MuiMenuItem-root.Mui-selected": {
                          backgroundColor: "#D17C00",
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="All">All Categories</MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                onClick={() => {
                  setSelectedCity("All");
                  setSelectedCategory("All");
                }}
                sx={{
                  borderColor: "rgba(243,143,1,0.6)",
                  color: "white !important",
                  backdropFilter: "blur(5px)",
                  background: "transparent",
                  "&:hover": {
                    background: "rgba(243,143,1,0.1)",
                    borderColor: "rgba(243,143,1,1)",
                  },
                }}
              >
                Reset
              </Button>

              <Button
                variant="outlined"
                onClick={backToRecent}
                sx={{
                  borderColor: "rgba(243,143,1,0.6)",
                  color: "white !important",
                  backdropFilter: "blur(5px)",
                  background: "rgba(255,255,255,0.05)",
                  "&:hover": {
                    background: "rgba(243,143,1,0.1)",
                    borderColor: "rgba(243,143,1,1)",
                  },
                }}
              >
                Back
              </Button>
            </MDBox>

            {/* Expanded or grid of all pins */}
            <MDBox mt={4.5}>
              <Grid container spacing={3}>
                {expandedPinId && allPins.find((p) => p.id === expandedPinId) ? (
                  allPins
                    .filter((p) => p.id === expandedPinId)
                    .map((pin) => (
                      <Grid item xs={12} key={pin.id}>
                        <MDBox
                          sx={{ cursor: "pointer" }}
                          onClick={() => setExpandedPinId(null)}
                        >
                          <PinDetailCard pin={pin} />
                        </MDBox>
                      </Grid>
                    ))
                ) : (
                  allPins.map((pin, idx) => (
                    <Grid item xs={12} md={6} lg={4} key={pin.id}>
                      <MDBox
                        sx={{ cursor: "pointer" }}
                        onClick={() => setExpandedPinId(pin.id)}
                      >
                        <PinCardWithTimeAgo
                          pin={pin}
                          idx={idx}
                          truncateDescription
                          isExpanded={false}
                        />
                      </MDBox>
                    </Grid>
                  ))
                )}
              </Grid>
            </MDBox>
          </>
        ) : (
          <>
            {/* Recent pins */}
            <MDBox mt={4.5} mb={4.5}>
              <Grid container spacing={3}>
                {recentPins.map((pin, idx) => (
                  <Grid item xs={12} md={6} lg={4} key={pin.id}>
                    <MDBox
                      mb={3}
                      sx={{ cursor: "pointer" }}
                      onClick={() =>
                        setExpandedPinId((prev) =>
                          prev === pin.id ? null : pin.id
                        )
                      }
                      onMouseEnter={() => setHoveredRecentPinId(pin.id)}
                      onMouseLeave={() => setHoveredRecentPinId(null)}
                    >
                      {expandedPinId === pin.id ? (
                        <PinDetailCard pin={pin} />
                      ) : (
                        <PinCardWithTimeAgo
                          pin={pin}
                          idx={idx}
                          truncateDescription={
                            hoveredRecentPinId !== pin.id
                          }
                          isExpanded={false}
                        />
                      )}
                    </MDBox>
                  </Grid>
                ))}
              </Grid>
            </MDBox>

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Projects country={continentName} />
              </Grid>
              <Grid item xs={12} md={4}>
                <OrdersOverview
                  cities={countryCities}
                  countryName={continentName}
                />
              </Grid>
            </Grid>
          </>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
