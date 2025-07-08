import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../SupabaseClient";
import { Button, FormControl, Select, MenuItem } from "@mui/material";

// @mui material components
import Grid from "@mui/material/Grid";
import StarFieldOverall from "components/StarFieldOverall";
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import AllPinCard from "examples/Charts/PinCard/allpins";
import Box from "@mui/material/Box";

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
    const plainText = text.replace(/<[^>]+>/g, ""); // strip HTML tags
    return plainText.length > maxLength ? plainText.substring(0, maxLength) + "…" : plainText;
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

export default function CountryPage() {
    const { countrySlug } = useParams();
    const countryName = useMemo(
        () =>
            decodeURIComponent(countrySlug)
                .replace(/[_-]/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase()),
        [countrySlug]
    );

    // Ensure country exists in DB
    useEffect(() => {
        if (!countryName || countryName === "Overview") return;

        fetch(`https://restcountries.com/v3.1/name/${countryName}`)
            .then((r) => r.json())
            .then((data) => {
                const info = Array.isArray(data) && data[0];
                if (!info) throw new Error("No country data");

                const continent = info.region;
                const pop = info.population;
                const cca2 = info.cca2.toLowerCase();

                // Upsert country with continent
                return supabase
                    .from("countries")
                    .insert(
                        {
                            name: countryName,
                            continent,
                            country_info: null,
                            moving_info: null,
                            animal_info: null,
                        },
                        { onConflict: "name", ignoreDuplicates: true }
                    )
                    .then(({ error }) => error && console.error("Error inserting country:", error))
                    .then(() => ({ pop, cca2 }));
            })
            .then(({ pop, cca2 }) => {
                setPopulation(pop);
                setCountryCode(cca2);
            })
            .catch(console.error);
    }, [countryName]);

    // ——— State ———
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
    const [countryCode, setCountryCode] = useState("");

    const [temperature, setTemperature] = useState(null);
    const [weatherCondition, setWeatherCondition] = useState("");
    const [population, setPopulation] = useState(null);

    // Controls
    const [showAllPins, setShowAllPins] = useState(false);
    const [expandedPinId, setExpandedPinId] = useState(null);
    const [hoveredRecentPinId, setHoveredRecentPinId] = useState(null);
    const [showPinForm, setShowPinForm] = useState(false);

    const apiKey = "e1d18a84d3aa3e09beafffa4030f2b01";

    // ——— Fetch stats ———
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

    // ——— Last city ———
    useEffect(() => {
        supabase
            .from("cities")
            .select("Name, id")
            .eq("Country", countryName)
            .order("id", { ascending: false })
            .limit(1)
            .then(({ data }) => data?.[0] && setLastCity(data[0]));
    }, [countryName]);


    useEffect(() => {
        fetch(`https://restcountries.com/v3.1/name/${countryName}`)
            .then((r) => r.json())
            .then((data) => {
                const info = Array.isArray(data) && data[0];
                if (!info) throw new Error("No country data");
                setPopulation(info.population);
                setCountryCode(info.cca2.toLowerCase());
                // …
            })
            .catch(console.error);
    }, [countryName]);

    // ——— Filters data ———
    useEffect(() => {
        supabase
            .from("cities")
            .select("Name")
            .eq("Country", countryName)
            .then(({ data }) =>
                data &&
                setCountryCities(["All", ...new Set(data.map((c) => c.Name))])
            );

        supabase
            .from("Category")
            .select("name")
            .then(({ data }) =>
                data &&
                setCategories(["All", ...new Set(data.map((c) => c.name))])
            );
    }, [countryName]);

    // ——— Recent pins ———
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

    // ——— All pins ———
    const fetchAllPins = () => {
        let q = supabase
            .from("pins")
            .select("*")
            .eq("countryName", countryName);
        if (selectedCity !== "All") q = q.eq("City", selectedCity);
        if (selectedCategory !== "All") q = q.eq("Category", selectedCategory);

        q.order("created_at", { ascending: false }).then(({ data, error }) => {
            if (!error) setAllPins(data);
        });
    };
    useEffect(fetchAllPins, [
        countryName,
        selectedCity,
        selectedCategory,
        showAllPins,
    ]);

    // ——— Population + Weather ———
    useEffect(() => {
        fetch(`https://restcountries.com/v3.1/name/${countryName}`)
            .then((r) => r.json())
            .then((data) => {
                const info = Array.isArray(data) && data[0];
                if (!info) throw new Error("No country data");
                setPopulation(info.population);
                const capital = info.capital?.[0] || countryName;
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

    // ——— Handlers ———
    const openAllPins = () => {
        setShowAllPins(true);
        setExpandedPinId(null);
    };
    const backToRecent = () => {
        setShowAllPins(false);
        setExpandedPinId(null);
    };
    const onPinClick = (id) => {
        setExpandedPinId((prev) => (prev === id ? null : id));
    };
    const handlePinSaved = () => {
        setShowPinForm(false);
        fetchAllPins();
    };
    const handleCancel = () => setShowPinForm(false);

    return (
        <DashboardLayout>
            <StarFieldOverall />
            <SimpleResponsiveNavbar />
            <MDBox py={3}>
                {/* Top Stats */}
                {!showPinForm && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6} lg={3}>
                            <MDBox mb={1.5} sx={{ cursor: "pointer" }} onClick={openAllPins}>
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
                        </Grid>
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
                        <Grid item xs={12} md={6} lg={3}>
                            <MDBox mb={1.5}>
                                <ComplexStatisticsCard
                                    color="info"
                                    icon="thermostat"
                                    title="Temperature"
                                    count={
                                        temperature != null ? `${temperature.toFixed(1)}°C` : "…"
                                    }
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
                        <Grid item xs={12} md={6} lg={3}>
                            <MDBox mb={1.5}>
                                <ComplexStatisticsCard
                                    color="primary"
                                    icon={
                                        countryCode ? (
                                            <img
                                                src={`https://flagcdn.com/w320/${countryCode.toLowerCase()}.png`}
                                                alt={`${countryName} flag`}
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

                {/* FULL PINS VIEW */}
                {showAllPins ? (
                    <>
                        {/* … inside your showAllPins branch … */}

                        <MDBox
                            mb={3}
                            sx={{
                                display: "flex",
                                gap: 2,
                                flexWrap: "wrap",
                                p: 2,
                                borderRadius: 2,
                                background: "transparent",
                                backdropFilter: "blur(10px)",
                                WebkitBackdropFilter: "blur(10px)",
                                border: "1px solid rgba(243,143,1,0.6)",
                            }}
                        >
                            <FormControl
                                variant="outlined"
                                size="medium"
                                sx={{
                                    minWidth: 180,
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "rgba(243,143,1,0.6)",
                                    },
                                    "&:hover .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "rgba(243,143,1,0.8)",
                                    },
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "rgba(243,143,1,1)",
                                    },
                                    background: "rgba(255,255,255,0.05)",
                                    color: "white",
                                }}
                            >
                                <Select
                                    value={selectedCity}
                                    onChange={e => setSelectedCity(e.target.value)}
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
                                                }
                                            }
                                        }
                                    }}
                                >

                                    {countryCities.map(c => (
                                        <MenuItem key={c} value={c}>{c}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl
                                variant="outlined"
                                size="medium"
                                sx={{
                                    minWidth: 180,
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "rgba(243,143,1,0.6)",
                                    },
                                    "&:hover .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "rgba(243,143,1,0.8)",
                                    },
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "rgba(243,143,1,1)",
                                    },
                                    background: "rgba(255,255,255,0.05)",
                                    color: "white",
                                }}
                            >
                                <Select
                                    value={selectedCategory}
                                    onChange={e => setSelectedCategory(e.target.value)}
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
                                                }
                                            }
                                        }
                                    }}
                                >
                                    <MenuItem value="All">All Categories</MenuItem>
                                    {categories.map(c => (
                                        <MenuItem key={c} value={c}>{c}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Button
                                variant="outlined"
                                onClick={() => { setSelectedCity("All"); setSelectedCategory("All"); }}
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


                        {/* 2. Expanded / Collapsible Grid */}
                        <MDBox
  mt={4.5}
  sx={{
    display: "flex",
    overflowX: "auto",
    scrollSnapType: "x mandatory",
    gap: 2,
    px: 2,
    py: 2,
    cursor: "grab",
    WebkitOverflowScrolling: "touch",
    "&::-webkit-scrollbar": { display: "none" },
  }}
  onMouseDown={(e) => {
    const container = e.currentTarget;
    let startX = e.pageX - container.offsetLeft;
    let scrollLeft = container.scrollLeft;

    const onMouseMove = (e) => {
      const x = e.pageX - container.offsetLeft;
      const walk = x - startX;
      container.scrollLeft = scrollLeft - walk;
    };

    const onMouseUp = () => {
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("mouseleave", onMouseUp);
    };

    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseup", onMouseUp);
    container.addEventListener("mouseleave", onMouseUp);
  }}
>
  {allPins.map((pin) => (
    <Box
      key={pin.id}
      sx={{
        flex: "0 0 100%",
        scrollSnapAlign: "start",
        minWidth: "100%",
        maxWidth: "100%",
      }}
      onClick={() => setExpandedPinId(pin.id)}
    >
      <AllPinCard
        title={pin.Name}
        description={pin.Information}
        category={pin.Category}
        imageurl={pin["Main Image"]}
        imagealt={pin.Name}
        date={timeAgo(pin.created_at)}
        // Customize or connect logic as needed
        isSaved={false}
        savedCount={pin.savedCount}
        onSave={() => {}}
        isBeenThere={false}
        beenThereCount={pin.beenThereCount}
        onBeenThere={() => {}}
        isWantToGo={false}
        wantToGoCount={pin.wantToGoCount}
        onWantToGo={() => {}}
      />
    </Box>
  ))}
</MDBox>
                    </>


                ) : (
                    <>
                        <MDBox mt={4.5} mb={4.5}>
                            <Grid container spacing={3}>
                                {recentPins.map((pin, idx) => (
                                    <Grid item xs={12} md={6} lg={4} key={pin.id}>
                                        <MDBox
                                            mb={3}
                                            sx={{ cursor: "pointer" }}
                                            onClick={() =>
                                                setExpandedPinId(prev => (prev === pin.id ? null : pin.id))
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
                                                    truncateDescription={hoveredRecentPinId !== pin.id}
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
                                <Projects country={countryName} />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <OrdersOverview
                                    cities={countryCities}
                                    countryName={countryName}
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
