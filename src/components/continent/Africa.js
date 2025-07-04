import React, { useEffect, useState } from "react";
import { supabase } from "../../SupabaseClient";
import { Outlet } from "react-router-dom";

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import PinCard from "examples/Charts/PinCard";
import PinDetailCard from "components/PinDetailCard";

// Dashboard components
import Projects from "layouts/dashboard/components/Projects";
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";

// Helper functions
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

function PinCardWithTimeAgo({ pin, idx, truncateDescription }) {
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
      title={pin.title}
      description={description}
      date={timeSincePost}
      imageUrl={pin["Main Image"]}
      imageAlt={pin.title}
      height="150px"
      truncateDescription={truncateDescription} // pass this to PinCard component for CSS clamp
    />
  );
}

function AfricaPage() {
  const [pinCount, setPinCount] = useState(0);
  const [cityCount, setCitieCount] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [population, setPopulation] = useState(null);
  const [weatherCondition, setWeatherCondition] = useState("");
  const [recentPins, setRecentPins] = useState([]);
  const [lastPinCreatedTimeAgo, setLastPinCreatedTimeAgo] = useState("");
  const [lastCity, setLastCity] = useState(null);
  const [countryCities, setCountryCities] = useState([]);
  const [showAllPins, setShowAllPins] = useState(false);
  const [allPins, setAllPins] = useState([]);
  const [hoveredRecentPinId, setHoveredRecentPinId] = useState(null);
  const [expandedPinId, setExpandedPinId] = useState(null);
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([]);


  const apiKey = "e1d18a84d3aa3e09beafffa4030f2b01";

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

  useEffect(() => {
    const fetchPinCount = async () => {
      const { count, error } = await supabase
        .from("pins")
        .select("*", { count: "exact", head: true })
        .eq("countryName", "Africa");
      if (!error) setPinCount(count);
    };
    fetchPinCount();
  }, []);

  useEffect(() => {
    const fetchCitieCount = async () => {
      const { count, error } = await supabase
        .from("cities")
        .select("*", { count: "exact", head: true })
        .eq("Country", "Africa");
      if (!error) setCitieCount(count);
    };
    fetchCitieCount();
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=Kabul,AF&units=metric&appid=${apiKey}`
        );
        const data = await response.json();
        setTemperature(data.main.temp);
        setWeatherCondition(data.weather[0].main);
      } catch (error) {
        console.error("Weather fetch error:", error);
      }
    };
    fetchWeather();
  }, []);

  useEffect(() => {
    const fetchPopulation = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/name/Africa");
        const data = await response.json();
        if (data[0]?.population) setPopulation(data[0].population);
      } catch (error) {
        console.error("Population fetch error:", error);
      }
    };
    fetchPopulation();
    const interval = setInterval(fetchPopulation, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchRecentPins = async () => {
      const { data, error } = await supabase
        .from("pins")
        .select("*")
        .eq("countryName", "Africa")
        .order("created_at", { ascending: false })
        .limit(3);
      if (!error && data) {
        setRecentPins(data);
        setLastPinCreatedTimeAgo(data.length ? timeAgo(data[0].created_at) : "No pins");
      }
    };
    fetchRecentPins();
    const interval = setInterval(fetchRecentPins, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchLastCity = async () => {
      const { data, error } = await supabase
        .from("cities")
        .select("Name, id")
        .eq("Country", "Africa")
        .order("id", { ascending: false })
        .limit(1);
      if (!error && data?.length > 0) setLastCity(data[0]);
    };
    fetchLastCity();
  }, []);

  useEffect(() => {
    const fetchCountryCities = async () => {
      const { data, error } = await supabase
        .from("cities")
        .select("Name")
        .eq("Country", "Africa");
      if (!error) setCountryCities(data.map((city) => city.Name));
    };
    fetchCountryCities();
  }, []);

  const fetchAllPins = async () => {
    let query = supabase.from("pins").select("*").eq("countryName", "Africa");

    if (selectedCity !== "All") {
      query = query.eq("City", selectedCity);
    }

    if (selectedCategory !== "All") {
      query = query.eq("Category", selectedCategory);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (!error) setAllPins(data);
  };

  useEffect(() => {
    const fetchFilters = async () => {
      const { data: citiesData } = await supabase
        .from("cities")
        .select("Name")
        .eq("Country", "Africa");

      const { data: categoryData } = await supabase.from("Category").select("name");

      if (citiesData) {
        const cityNames = citiesData.map((c) => c.Name);
        setCountryCities(["All", ...new Set(cityNames)]);
      }

      if (categoryData) {
        const categoryNames = categoryData.map((c) => c.name);
        setCategories(["All", ...new Set(categoryNames)]);
      }
    };

    fetchFilters();
  }, []);

  // Added: Refetch pins whenever filters change and showAllPins is true
  useEffect(() => {
    if (showAllPins) {
      fetchAllPins();
    }
  }, [selectedCity, selectedCategory, showAllPins]);


  useEffect(() => {
  if (!showAllPins) {
    setExpandedPinId(null);
  }
}, [showAllPins]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <MDBox
                onClick={() => {
                  setShowAllPins(true);
                  fetchAllPins();
                }}
                sx={{ cursor: "pointer" }}
              >
                <ComplexStatisticsCard
                  color="dark"
                  icon="place"
                  title="See all pins"
                  count={pinCount}
                  percentage={{
                    color: "success",
                    amount: `Created ${lastPinCreatedTimeAgo}`,
                  }}
                />
              </MDBox>
            </MDBox>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                icon="house"
                title="Current cities"
                count={cityCount}
                percentage={{
                  color: "success",
                  amount: lastCity ? `Last city: ${lastCity.Name}` : "Loading...",
                }}
              />
            </MDBox>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="info"
                icon="thermostat"
                title="Temperature"
                count={temperature !== null ? `${temperature.toFixed(1)} °C` : "Loading..."}
                percentage={{
                  color:
                    weatherCondition === "Clear"
                      ? "success"
                      : weatherCondition === "Rain"
                      ? "error"
                      : "warning",
                  amount: `${weatherEmoji[weatherCondition] || ""} ${weatherCondition}`,
                  label: "Current weather",
                }}
              />
            </MDBox>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon={
                  <img
                    src={"https://flagcdn.com/w320/af.png"}
                    alt="Africa flag"
                    style={{
                      width: "26px",
                      height: "26px",
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                  />
                }
                title="Population"
                count={population?.toLocaleString("en-US")}
                percentage={{
                  color: "success",
                  amount: "",
                  label: "Just updated",
                }}
              />
            </MDBox>
          </Grid>
        </Grid>

        {showAllPins ? (
          <MDBox mt={4.5}>
            {/* === INSERT FILTERS HERE === */}
            <MDBox mb={3} sx={{ display: "flex", gap: 2, flexWrap: "wrap", margin: "0px 0px 40px 0px"}}>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  minWidth: "150px",
                }}
              >
                {countryCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  minWidth: "150px",
                }}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <button
  onClick={() => {
    setSelectedCity("All");
    setSelectedCategory("All");
  }}
  style={{
    padding: "8px 12px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#1976d2",
    color: "white",
    cursor: "pointer",
  }}
>
  Reset Filters
</button>
<button
  onClick={() => {
    setShowAllPins(false);
    setExpandedPinId(null);
  }}
  style={{
    padding: "8px 12px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#1976d2",
    color: "white",
    cursor: "pointer",
  }}
>
  Back to Dashboard
</button>


              
            </MDBox>

            <Grid container spacing={3}>
              {allPins.length === 0 ? (
                <MDBox>Loading all pins...</MDBox>
              ) : expandedPinId ? (
                // Show only the expanded pin full width
                allPins
                  .filter((pin) => pin.id === expandedPinId)
                  .map((pin) => (
                    <Grid item xs={12} md={12} lg={12} key={pin.id}>
                      <MDBox
                        mb={3}
                        sx={{ cursor: "pointer" }}
                        onClick={() =>
                          setExpandedPinId((prev) => (prev === pin.id ? null : pin.id))
                        }
                      >
                        <PinDetailCard pin={pin} />
                      </MDBox>
                    </Grid>
                  ))
              ) : (
                // Show all pins grid normally
                allPins.map((pin, idx) => (
                  <Grid item xs={12} md={6} lg={4} key={pin.id || idx}>
                    <MDBox
                      mb={3}
                      sx={{ cursor: "pointer" }}
                      onClick={() =>
                        setExpandedPinId((prev) => (prev === pin.id ? null : pin.id))
                      }
                    >
                      <PinCardWithTimeAgo pin={pin} idx={idx} truncateDescription={true} />
                    </MDBox>
                  </Grid>
                ))
              )}
            </Grid>
          </MDBox>
        ) : (
          <MDBox mt={4.5}>
    <Grid container spacing={3}>
      {expandedPinId ? (
        // Show only the expanded recent pin detail full width
        recentPins
          .filter((pin) => pin.id === expandedPinId)
          .map((pin) => (
            <Grid item xs={12} md={12} lg={12} key={pin.id}>
              <MDBox
                mb={3}
                sx={{ cursor: "pointer" }}
                onClick={() =>
                  setExpandedPinId((prev) => (prev === pin.id ? null : pin.id))
                }
              >
                <PinDetailCard pin={pin} />
              </MDBox>
            </Grid>
          ))
      ) : (
        // Show recent pins normally
        recentPins.map((pin, idx) => (
          <Grid item xs={12} md={6} lg={4} key={pin.id}>
            <MDBox
              mb={3}
              onMouseEnter={() => setHoveredRecentPinId(pin.id)}
              onMouseLeave={() => setHoveredRecentPinId(null)}
              sx={{ cursor: "pointer" }}
              onClick={() =>
                setExpandedPinId((prev) => (prev === pin.id ? null : pin.id))
              }
            >
              <PinCardWithTimeAgo
                pin={pin}
                idx={idx}
                truncateDescription={hoveredRecentPinId !== pin.id}
              />
            </MDBox>
          </Grid>
        ))
      )}
    </Grid>
  </MDBox>
        )}
        {!showAllPins && ( 
      <MDBox>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={8}>
              <Projects country="Africa" />
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <OrdersOverview cities={countryCities} />
            </Grid>
          </Grid>
        </MDBox> 
        )}
      </MDBox>
      <Outlet />
      <Footer />
    </DashboardLayout>
  );
}

export default AfricaPage;

