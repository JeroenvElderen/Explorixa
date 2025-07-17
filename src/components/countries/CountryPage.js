// What to do in this component //
// 1. Make a popup so that people now you can click the see all pins card //
// 2. Move the back to europe button to the top //
// 3. Add a second button to go to next country //
// 4. Add a third button to go back to previous country //
// 5. Add a map of the country with pins //
// 6. Make it when clicking pin go to PinPage //
// 7. Clean up code //

import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "../../SupabaseClient";
import { Button, FormControl, Select, MenuItem } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import Hidden from "@mui/material/Hidden";

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
import { useSavedPins } from "components/SavedPinsContext";
import ListDialog from "components/AddToList/AddToListDialog";
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
    isSaved,
    onSave,
    isBeenThere,
    onBeenThere,
    isWantToGo,
    onWantToGo,
    beenThereCount,
    wantToGoCount,
    savedCount,
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
            isSaved={isSaved}
            onSave={onSave}
            isBeenThere={isBeenThere}
            onBeenThere={onBeenThere}
            isWantToGo={isWantToGo}
            onWantToGo={onWantToGo}
            beenThereCount={beenThereCount}
            wantToGoCount={wantToGoCount}
            savedCount={savedCount}
        />
    );
}

export default function CountryPage() {
    const { countrySlug, continent } = useParams();
    const navigate = useNavigate();
    const countryName = useMemo(
        () =>
            decodeURIComponent(countrySlug)
                .replace(/[_-]/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase()),
        [countrySlug]
    );

    const handlePinClick = (pin) => {
        const pinSlug = encodeURIComponent(pin.Name?.replace(/\s/g, "_") || pin.id);
        const continentParam = continent; // <-- Only this is needed
        navigate(`/Destinations/${encodeURIComponent(continentParam)}/${encodeURIComponent(countrySlug)}/${pinSlug}`, {
            state: { pin },
        });
    };


    const {
        pins, save, remove,
        beenTherePins, saveBeenThere, removeBeenThere,
        wantToGoPins, saveWantToGo, removeWantToGo
    } = useSavedPins();

    // Ensure country exists in DB
    useEffect(() => {
        if (!countryName || countryName === "Overview") return;

        fetch(`https://restcountries.com/v3.1/name/${countryName}?fullText=true`)
            .then(r => r.json())
            .then(data => {
                const info = Array.isArray(data) && data[0];
                if (!info) throw new Error("No country data");
                const region = info.region;

                return supabase
                    .from("countries")
                    .upsert(
                        {
                            name: countryName,
                            continent: region,
                            country_info: null,
                            moving_info: null,
                            animal_info: null,
                        },
                        { onConflict: "name" }
                    )
                    .then(({ error }) => {
                        if (error) console.error("Error upserting country:", error);
                    });
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
    const [continentName, setContinentName] = useState("");

    const [temperature, setTemperature] = useState(null);
    const [weatherCondition, setWeatherCondition] = useState("");
    const [population, setPopulation] = useState(null);

    // Controls
    const [showAllPins, setShowAllPins] = useState(false);
    const [expandedPinId, setExpandedPinId] = useState(null);
    const [hoveredRecentPinId, setHoveredRecentPinId] = useState(null);
    const [showPinForm, setShowPinForm] = useState(false);

    const [listDialogOpen, setListDialogOpen] = useState(false);
    const [activePin, setActivePin] = useState(null);

    const apiKey = "e1d18a84d3aa3e09beafffa4030f2b01";

    const [user, setUser] = useState(null);
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });
        const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
            setUser(session?.user ?? null);
        });
        return () => listener.subscription.unsubscribe();
    }, []);

    const handleHeartClick = (pin) => {
        setActivePin(pin);
        setListDialogOpen(true);
    };

    const handleBeenThere = async (pin) => {
        if (!user) return;
        const isNow = !beenTherePins.find(p => p.id === pin.id);
        let count = pin.been_there || 0;
        let newCount = count;

        if (isNow) {
            saveBeenThere(pin);
            newCount = count + 1;
        } else {
            removeBeenThere(pin);
            newCount = Math.max(count - 1, 0);
        }

        // Only update pins table
        await supabase.from('pins').update({ been_there: newCount }).eq('id', pin.id);

        setAllPins(pins => pins.map(p =>
            p.id === pin.id ? { ...p, want_to_go: newCount } : p
        ));
        setRecentPins(pins => pins.map(p =>
            p.id === pin.id ? { ...p, want_to_go: newCount } : p
        ));
    };

    const handleWantToGo = async (pin) => {
        if (!user) return;
        const isNow = !wantToGoPins.find(p => p.id === pin.id);
        let count = pin.want_to_go || 0;
        let newCount = count;

        if (isNow) {
            saveWantToGo(pin);
            newCount = count + 1;
        } else {
            removeWantToGo(pin);
            newCount = Math.max(count - 1, 0);
        }

        // Only update pins table
        await supabase.from('pins').update({ want_to_go: newCount }).eq('id', pin.id);

        setAllPins(pins => pins.map(p =>
            p.id === pin.id ? { ...p, want_to_go: newCount } : p
        ));
        setRecentPins(pins => pins.map(p =>
            p.id === pin.id ? { ...p, want_to_go: newCount } : p
        ));
    };

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
        fetch(`https://restcountries.com/v3.1/name/${countryName}?fullText=true`)
            .then((r) => r.json())
            .then((data) => {
                const info = Array.isArray(data) && data[0];
                if (!info) throw new Error("No country data");
                setPopulation(info.population);
                setContinentName(info.region);
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
            .from("pins")
            .select("Category")
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
        fetch(`https://restcountries.com/v3.1/name/${countryName}?fullText=true`)
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
                {/* Top Stats (desktop/tablet: always visible) */}
                <Hidden smDown>
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
                </Hidden>

                {/* Top Stats (mobile: hide if showAllPins) */}
                <Hidden smUp>
                    {!showPinForm && !showAllPins && (
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
                </Hidden>

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
                                flexDirection: "column",       // stack vertically
                                maxHeight: 600,                // adjust as needed
                                overflowY: "auto",             // vertical scroll
                                scrollSnapType: "y mandatory", // snap on y–axis
                                gap: 2,
                                px: 2,
                                py: 2,
                                WebkitOverflowScrolling: "touch",
                                "&::-webkit-scrollbar": { width: 6 },
                                "&::-webkit-scrollbar-thumb": { backgroundColor: "rgba(255,255,255,0.3)" },
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
                                    onClick={() => handlePinClick(pin)}
                                >
                                    <AllPinCard
                                        title={pin.Name}
                                        description={pin.Information}
                                        category={pin.Category}
                                        imageurl={pin["Main Image"]}
                                        imagealt={pin.Name}
                                        date={timeAgo(pin.created_at)}
                                        isSaved={!!pins.find(p => p.id === pin.id)}
                                        savedCount={pin.saved_count}
                                        onSave={() => handleHeartClick(pin)}
                                        isBeenThere={!!beenTherePins.find(p => p.id === pin.id)}
                                        beenThereCount={pin.been_there}
                                        onBeenThere={() => handleBeenThere(pin)}
                                        isWantToGo={!!wantToGoPins.find(p => p.id === pin.id)}
                                        wantToGoCount={pin.want_to_go}
                                        onWantToGo={() => handleWantToGo(pin)}
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
                                            onClick={() => handlePinClick(pin)}
                                        >
                                            {expandedPinId === pin.id ? (
                                                <PinDetailCard pin={pin} />
                                            ) : (
                                                <PinCardWithTimeAgo
                                                    pin={pin}
                                                    idx={idx}
                                                    truncateDescription={hoveredRecentPinId !== pin.id}
                                                    isExpanded={false}
                                                    isSaved={!!pins.find(p => p.id === pin.id)}
                                                    onSave={() => handleHeartClick(pin)}
                                                    isBeenThere={!!beenTherePins.find(p => p.id === pin.id)}
                                                    onBeenThere={() => handleBeenThere(pin)}
                                                    isWantToGo={!!wantToGoPins.find(p => p.id === pin.id)}
                                                    onWantToGo={() => handleWantToGo(pin)}
                                                    beenThereCount={pin.been_there}
                                                    wantToGoCount={pin.want_to_go}
                                                    savedCount={pin.saved_count}
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
            <MDBox px={3} py={1}>
                <Button
                    variant="outlined"
                    sx={{
                        borderColor: "rgba(243,143,1,0.6)",
                        color: "white",
                        "&:hover": { background: "rgba(243,143,1,0.1)" }
                    }}
                    onClick={() =>
                        // match your continent-list route:
                        navigate(`/Destinations/${encodeURIComponent(continent)}`)
                    }
                    disabled={!continent}
                >
                    ← Back to {continent || "continent"}
                </Button>
            </MDBox>
            <ListDialog
                open={listDialogOpen}
                onClose={() => setListDialogOpen(false)}
                pin={activePin}
                onSaved={() => {
                    save(activePin);
                    setAllPins(pins =>
                        pins.map(p =>
                            p.id === activePin.id
                                ? { ...p, saved_count: (p.saved_count || 0) + 1 }
                                : p
                        )
                    );
                    setListDialogOpen(false);
                }}
            />

            <Footer />
        </DashboardLayout>
    );
}
