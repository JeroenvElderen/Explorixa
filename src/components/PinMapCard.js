import React, { useRef, useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ExploreIcon from "@mui/icons-material/Explore";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "../App.css";
import { supabase } from "../SupabaseClient";
import { useNavigate } from "react-router-dom";

mapboxgl.accessToken = "pk.eyJ1IjoiamVyb2VudmFuZWxkZXJlbiIsImEiOiJjbWMwa2M0cWswMm9jMnFzNjI3Z2I4YnV4In0.qUqeNUDYMBf3E54ouOd2Jg";

// simple slugifier for URLs
function sluggify(str) {
    return str
        ?.toString()
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_")
        .replace(/[^\w-]/g, "") || "";
}

export default function PinMapCard({ pin }) {
    const mapContainerRef = useRef(null);
    const navigate = useNavigate();

    const [address, setAddress] = useState("");
    const [copied, setCopied] = useState(false);
    const [hover, setHover] = useState(false);
    const [coordsCopied, setCoordsCopied] = useState(false);
    const [coordsHover, setCoordsHover] = useState(false);

    // cities & stories counts
    const [citiesCount, setCitiesCount] = useState(0);
    const [storiesCount, setStoriesCount] = useState(0);

    // compute slugs
    const continentSlug = sluggify(pin.continentName || pin.countryName);
    const countrySlug = sluggify(pin.countryName);

    // initialize map
    useEffect(() => {
        if (!pin?.latitude || !pin?.longitude) return;
        const lat = Number(pin.latitude);
        const lng = Number(pin.longitude);

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: "mapbox://styles/jeroenvanelderen/cmc958dgm006s01shdiu103uz",
            center: [lng, lat],
            zoom: 14,
            interactive: false,
            attributionControl: false,
        });

        map.on("load", () => {
            new mapboxgl.Marker({ color: "#F18F01" })
                .setLngLat([lng, lat])
                .addTo(map);
            map.resize();
            setTimeout(() => map.resize(), 0);
        });

        return () => map.remove();
    }, [pin]);

    // reverse-geocode address
    useEffect(() => {
        if (!pin?.latitude || !pin?.longitude) return;
        (async () => {
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${pin.longitude},${pin.latitude}.json?access_token=${mapboxgl.accessToken}`;
            try {
                const res = await fetch(url);
                const data = await res.json();
                let postcode = "", country = "";
                const best =
                    data.features.find((f) => f.place_type.includes("poi")) ||
                    data.features[0] ||
                    {};
                (best.context || []).forEach((ctx) => {
                    if (ctx.id.startsWith("postcode")) postcode = ctx.text;
                    if (ctx.id.startsWith("country")) country = ctx.text;
                });
                const isAddress = best.place_type?.some((pt) =>
                    ["address", "street"].includes(pt)
                );
                const poiLabel = best.text || pin.Name;
                const addr = isAddress && best.place_name
                    ? best.place_name
                    : [poiLabel, postcode, country].filter(Boolean).join(", ");
                setAddress(addr || "Unknown location");
            } catch {
                setAddress("Unknown location");
            }
        })();
    }, [pin]);

    // fetch cities & stories counts
    useEffect(() => {
        if (!pin?.countryName) return;
        (async () => {
            const { count: cityCount, error: cityErr } = await supabase
                .from("cities")
                .select("id", { count: "exact", head: true })
                .eq("Country", pin.countryName);
            if (!cityErr && typeof cityCount === "number") {
                setCitiesCount(cityCount);
            }
            const { count: pinCount, error: pinErr } = await supabase
                .from("pins")
                .select("id", { count: "exact", head: true })
                .eq("countryName", pin.countryName);
            if (!pinErr && typeof pinCount === "number") {
                setStoriesCount(pinCount);
            }
        })();
    }, [pin]);

    const handleCopy = () => {
        const toCopy = address.includes(pin.Name)
            ? address
            : address
                ? `${pin.Name}, ${address}`
                : pin.Name;
        navigator.clipboard.writeText(toCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 1000);
    };

    const handleCoordsCopy = () => {
        const coords = `${Number(pin.latitude).toFixed(6)}, ${Number(pin.longitude).toFixed(6)}`;
        navigator.clipboard.writeText(coords);
        setCoordsCopied(true);
        setTimeout(() => setCoordsCopied(false), 1000);
    };

    return (
        <Card sx={{
            backdropFilter: "blur(20px)", 
            WebkitBackdropFilter: "blur(20px)",
            background: "linear-gradient(145deg, rgba(241,143,1,0.3) 0%, rgba(241,143,1,0) 100%)",
            border: "1px solid rgba(255,255,255,0.6)", 
            boxShadow:
                "inset 4px 4px 10px rgba(241,143,1,0.4), inset -4px -4px 10px rgba(241,143,1,0.1), 0 6px 15px rgba(241,143,1,0.3)",
            borderRadius: "0px 0px 12px 12px", 
            maxWidth: "100%"
        }}>
            <Box sx={{ width: "100%", height: 140 }}>
                <Box ref={mapContainerRef} sx={{ width: "100%", height: "100%" }} />
            </Box>
            <CardContent sx={{ pb: 2 }}>
                {/* Name + address */}
                <Box
                    display="flex"
                    alignItems="center"
                    sx={{
                        cursor: "pointer", borderRadius: 1, py: 1, px: 1,
                        "&:hover": { background: "rgba(241,143,1,0.42)" }
                    }}
                    onClick={handleCopy}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                    title={copied ? "Copied!" : "Click to copy"}
                >
                    <LocationOnIcon sx={{ color: "#bc862b", mr: 0.75 }} />
                    <Box>
                        <Typography variant="h6" fontWeight={700}>{pin.Name}</Typography>
                        {address && (
                            <Typography variant="body2" sx={{ color: "white !important" }}>
                                {address}
                            </Typography>
                        )}
                    </Box>
                    {hover && !copied && (
                        <ContentCopyIcon sx={{ ml: 1, fontSize: 20, color: "#bc862b", opacity: 0.8 }} />
                    )}
                    {copied && (
                        <Typography variant="caption" sx={{ ml: 2, color: "#bc862b", fontWeight: 500 }}>
                            Copied!
                        </Typography>
                    )}
                </Box>

                {/* Coordinates */}
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mt={1}
                    sx={{
                        cursor: "pointer", borderRadius: 1, py: 1, px: 1,
                        "&:hover": { background: "rgba(241,143,1,0.42)" }
                    }}
                    onClick={handleCoordsCopy}
                    onMouseEnter={() => setCoordsHover(true)}
                    onMouseLeave={() => setCoordsHover(false)}
                    title={coordsCopied ? "Copied!" : "Click to copy coordinates"}
                >
                    <Box display="flex" alignItems="center">
                        <ExploreIcon sx={{ color: "#bc862b", mr: 0.75 }} />
                        <Typography variant="h6" sx={{ color: "white !important" }}>
                            {Number(pin.latitude).toFixed(6)}, {Number(pin.longitude).toFixed(6)}
                        </Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                        {coordsHover && !coordsCopied && (
                            <ContentCopyIcon sx={{ ml: 1, fontSize: 20, color: "#bc862b", opacity: 0.8 }} />
                        )}
                        {coordsCopied && (
                            <Typography variant="caption" sx={{ ml: 2, color: "#bc862b", fontWeight: 500 }}>
                                Copied!
                            </Typography>
                        )}
                    </Box>
                </Box>

                <Divider sx={{ my: 1 }} />

                {/* Destination Guide */}
                <Box display="flex" alignItems="center">
                    <Box
                        sx={{
                            width: 100,
                            height: 145,
                            borderRadius: 2,
                            background: "#ddd",
                            overflow: "hidden",
                            flexShrink: 0,
                            mr: 1,
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <img
                            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
                            alt="Destination"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                        <Typography variant="overline" sx={{ color: "#fff", letterSpacing: 1, fontWeight: 600, fontSize: "0.7rem" }}>
                            EUROPE
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 700,
                                color: "#fff",
                                fontSize: "1.2rem",
                                mt: -1,
                                cursor: "pointer",
                                textDecoration: "underline",
                            }}
                            onClick={() =>
                                navigate(
                                    `/Destinations/World_destinations/${continentSlug}/${countrySlug}`
                                )
                            }
                        >
                            {pin.countryName}
                        </Typography>
                        <Box display="flex" gap={1.25} alignItems="flex-end" mt={3.5}>
                            {/* Places */}
                            <Box
                                sx={{
                                    background: "#F18F01",
                                    borderRadius: 1.5,
                                    px: 1,
                                    py: 0.2,
                                    boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    minWidth: 65,
                                    minHeight: 55,
                                }}
                            >
                                <Typography variant="overline" sx={{ color: "#fff", fontWeight: 700, fontSize: "0.70rem", letterSpacing: 1 }}>
                                    PLACES
                                </Typography>
                                <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700, fontSize: "1.10rem", mt: "2px" }}>
                                    {citiesCount}
                                </Typography>
                            </Box>
                            {/* Stories */}
                            <Box
                                sx={{
                                    background: "#F18F01",
                                    borderRadius: 1.5,
                                    px: 1,
                                    py: 0.2,
                                    boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    minWidth: 65,
                                    minHeight: 55,
                                }}
                            >
                                <Typography variant="overline" sx={{ color: "#fff", fontWeight: 700, fontSize: "0.70rem", letterSpacing: 1 }}>
                                    STORIES
                                </Typography>
                                <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700, fontSize: "1.10rem", mt: "2px" }}>
                                    {storiesCount}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
