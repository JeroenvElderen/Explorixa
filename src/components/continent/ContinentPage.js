import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../SupabaseClient";
import { Button, FormControl, Select, MenuItem, Typography } from "@mui/material";
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

function formatCount(num) {
  if (num >= 1e9)   return (num / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
  if (num >= 1e6)   return (num / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1e3)   return (num / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
}

function PinCardWithTimeAgo({ pin, idx, truncateDescription, isExpanded, onClick, onMouseEnter, onMouseLeave }) {
    const [timeSincePost, setTimeSincePost] = useState(() => timeAgo(pin.created_at));

    useEffect(() => {
        const iv = setInterval(() => setTimeSincePost(timeAgo(pin.created_at)), 60000);
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
    const { continent } = useParams();
    const [continentData, setContinentData] = useState(null);
    const [continentCountries, setContinentCountries] = useState([]);

    // Stats & Pins
    const [pinCount, setPinCount] = useState(0);
    const [cityCount, setCityCount] = useState(0);
    const [recentPins, setRecentPins] = useState([]);
    const [lastPinCreatedTimeAgo, setLastPinCreatedTimeAgo] = useState("");
    const [lastCity, setLastCity] = useState(null);
    const [allPins, setAllPins] = useState([]);

    // Filters
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

    const displayName = useMemo(
        () =>
            continentData?.name ||
            decodeURIComponent(continent)
                .replace(/[_-]/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase()),
        [continentData, continent]
    );

    // 1) Load continent record
    useEffect(() => {
        if (!continent) return;

        const normalizedName = decodeURIComponent(continent).replace(/[_-]/g, " ");

        supabase
            .from("continents")
            .select("id,name,country_info,moving_info,animal_info")   // ← include your new columns
            .eq("name", normalizedName)
            .maybeSingle()                                            // won’t throw if 0 rows
            .then(({ data, error }) => {
                if (error) {
                    console.error("Error fetching continent:", error);
                } else if (!data) {
                    console.warn("No continent row found for", normalizedName);
                } else {
                    setContinentData(data);
                }
            });
    }, [continent]);


    // 2) Fetch countries in this continent
    useEffect(() => {
        if (!continentData) return;
        supabase
            .from("countries")
            .select("name")
            .eq("continent", continentData.name)
            .then(({ data, error }) => {
                if (error) console.error(error);
                else setContinentCountries(data.map((c) => c.name));
            });
    }, [continentData]);

    // 3) Stats: pin & city counts
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

    // 4) Last city
    useEffect(() => {
        if (!continentCountries.length) return;
        supabase
            .from("cities")
            .select("Name,id")
            .in("Country", continentCountries)
            .order("id", { ascending: false })
            .limit(1)
            .then(({ data }) => data?.[0] && setLastCity(data[0]));
    }, [continentCountries]);

    // 5) Filters: cities & categories
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

    // 6) Recent pins
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

    // 7) Fetch all pins (with filters)
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
    useEffect(fetchAllPins, [continentCountries, selectedCity, selectedCategory]);

    // 8) Weather & population
    useEffect(() => {
  if (!continentData?.name) return;

  const region = continentData.name; // e.g. "Africa"

  fetch(`https://restcountries.com/v3.1/region/${encodeURIComponent(region)}`)
    .then(r => r.json())
    .then((countries) => {
      // Sum up every country’s population
      const totalPop = countries.reduce(
        (sum, country) => sum + (country.population || 0),
        0
      );
      setPopulation(totalPop);

      // (optional) still pick one country for weather:
      const first = countries[0];
      setCountryCode(first.cca2.toLowerCase());
      const capital = first.capital?.[0] || first.name.common;
      return fetch(
        `https://api.openweathermap.org/data/2.5/weather`+
        `?q=${encodeURIComponent(capital)},${first.cca2.toLowerCase()}`+
        `&units=metric&appid=${apiKey}`
      );
    })
    .then(r => r.json())
    .then(w => {
      if (w.main) {
        setWeatherCondition(w.weather[0].main);
        setTemperature(w.main.temp);
      }
    })
    .catch(console.error);
}, [continentData]);


    const weatherEmoji = {
        Clear: "☀️", Clouds: "☁️", Rain: "🌧️", Snow: "❄️", Thunderstorm: "⛈️",
        Drizzle: "🌦️", Mist: "🌫️", Smoke: "💨", Haze: "🌁", Dust: "🌪️",
        Fog: "🌁", Sand: "🏜️", Ash: "🌋", Squall: "🌬️", Tornado: "🌪️",
    };

    // Handlers
    const openAllPins = () => { setShowAllPins(true); setExpandedPinId(null); };
    const backToRecent = () => { setShowAllPins(false); setExpandedPinId(null); };

    return (
        <DashboardLayout>
            <SimpleResponsiveNavbar />

            <MDBox py={3}>
                
                {!showAllPins ? (
                    <> {/* Stats & Recent Pins */}
                        <Grid container spacing={3}>
                            {/* Pins count */}
                            <Grid item xs={12} md={6} lg={3}>
                                <MDBox mb={1.5} sx={{ cursor: "pointer" }} onClick={openAllPins}>
                                    <ComplexStatisticsCard
                                        color="dark"
                                        icon="place"
                                        title={`Pins in ${displayName}`}
                                        count={pinCount}
                                        percentage={{ color: "success", amount: `Created ${lastPinCreatedTimeAgo}` }}
                                    />
                                </MDBox>
                            </Grid>
                            {/* Cities count */}
                            <Grid item xs={12} md={6} lg={3}>
                                <MDBox mb={1.5}>
                                    <ComplexStatisticsCard
                                        icon="house"
                                        title="Current cities"
                                        count={cityCount}
                                        {...(lastCity && { percentage: { color: "success", amount: `Last: ${lastCity.Name}` } })}
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
                                        percentage={{ color: weatherCondition === "Clear" ? "success" : weatherCondition === "Rain" ? "error" : "warning", amount: `${weatherEmoji[weatherCondition] || ""} ${weatherCondition}`, label: "Weather" }}
                                    />
                                </MDBox>
                            </Grid>
                            {/* Population */}
                            <Grid item xs={12} md={6} lg={3}>
                                <MDBox mb={1.5}>
                                    <ComplexStatisticsCard
                                        color="primary"
                                        icon={countryCode ? <img src={`https://flagcdn.com/w320/${countryCode}.png`} alt={`${displayName} flag`} style={{ width: 26, height: 26, objectFit: "cover", borderRadius: 4 }} /> : null}
                                        title="Population"
                                        count={population != null ? formatCount(population) : "…"}
                                        percentage={{ color: "success", amount: "Updated" }}
                                    />
                                </MDBox>
                            </Grid>
                        </Grid>

                        <MDBox mt={4.5} mb={4.5}>
                            <Grid container spacing={3}>
                                {recentPins.map((pin, idx) => (
                                    <Grid item xs={12} md={6} lg={4} key={pin.id}>
                                        <MDBox
                                            mb={3}
                                            sx={{ cursor: "pointer" }}
                                            onClick={() => setExpandedPinId(prev => prev === pin.id ? null : pin.id)}
                                            onMouseEnter={() => setHoveredRecentPinId(pin.id)}
                                            onMouseLeave={() => setHoveredRecentPinId(null)}
                                        >
                                            {expandedPinId === pin.id ? (
                                                <PinDetailCard pin={pin} />
                                            ) : (
                                                <PinCardWithTimeAgo pin={pin} idx={idx} truncateDescription={hoveredRecentPinId !== pin.id} isExpanded={false} />
                                            )}
                                        </MDBox>
                                    </Grid>
                                ))}
                            </Grid>
                        </MDBox>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={8}>
                                <Projects country={displayName} />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <OrdersOverview cities={countryCities} countryName={displayName} />
                            </Grid>
                        </Grid>
                    </>
                ) : (
                    <>
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
                            <FormControl variant="outlined" size="medium" sx={{ minWidth: 180 }}>
                                <Select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} displayEmpty sx={{ color: "white", height: "100%" }} MenuProps={{ PaperProps: { sx: { backgroundColor: "#F18F01 !important", "& .MuiMenuItem-root": { backgroundColor: "#F18F01", color: "white" }, "& .MuiMenuItem-root:hover": { backgroundColor: "#D17C00" }, "& .MuiMenuItem-root.Mui-selected": { backgroundColor: "#D17C00" } } } }}>
                                    {countryCities.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                </Select>
                            </FormControl>

                            <FormControl variant="outlined" size="medium" sx={{ minWidth: 180 }}>
                                <Select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} displayEmpty sx={{ color: "white", height: "100%" }} MenuProps={{ PaperProps: { sx: { backgroundColor: "#F18F01 !important", "& .MuiMenuItem-root": { backgroundColor: "#F18F01", color: "white" }, "& .MuiMenuItem-root:hover": { backgroundColor: "#D17C00" }, "& .MuiMenuItem-root.Mui-selected": { backgroundColor: "#D17C00" } } } }}>
                                    <MenuItem value="All">All Categories</MenuItem>
                                    {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                </Select>
                            </FormControl>

                            <Button variant="outlined" onClick={() => { setSelectedCity("All"); setSelectedCategory("All"); }} sx={{ borderColor: "rgba(243,143,1,0.6)", color: "white !important", backdropFilter: "blur(5px)", background: "transparent", "&:hover": { background: "rgba(243,143,1,0.1)", borderColor: "rgba(243,143,1,1)" } }}>
                                Reset
                            </Button>

                            <Button variant="outlined" onClick={backToRecent} sx={{ borderColor: "rgba(243,143,1,0.6)", color: "white !important", backdropFilter: "blur(5px)", background: "rgba(255,255,255,0.05)", "&:hover": { background: "rgba(243,143,1,0.1)", borderColor: "rgba(243,143,1,1)" } }}>
                                Back
                            </Button>
                        </MDBox>

                        <MDBox mt={4.5}>
                            <Grid container spacing={3}>
                                {expandedPinId && allPins.find(p => p.id === expandedPinId) ? (
                                    allPins.filter(p => p.id === expandedPinId).map(pin => (
                                        <Grid item xs={12} key={pin.id}>
                                            <MDBox sx={{ cursor: "pointer" }} onClick={() => setExpandedPinId(null)}>
                                                <PinDetailCard pin={pin} />
                                            </MDBox>
                                        </Grid>
                                    ))
                                ) : (
                                    allPins.map((pin, idx) => (
                                        <Grid item xs={12} md={6} lg={4} key={pin.id}>
                                            <MDBox sx={{ cursor: "pointer" }} onClick={() => setExpandedPinId(pin.id)}>
                                                <PinCardWithTimeAgo pin={pin} idx={idx} truncateDescription isExpanded={false} />
                                            </MDBox>
                                        </Grid>
                                    ))
                                )}
                            </Grid>
                        </MDBox>
                    </>
                )}
            </MDBox>

            <Footer />
        </DashboardLayout>
    );
}
