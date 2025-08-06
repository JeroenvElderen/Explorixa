import React, {
  Suspense,
  useMemo,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import SimpleResponsiveNavbar from "examples/Navbars/ResponsiveNavbar/allpage";
import Footer from "examples/Footer";
import StarFieldOverall from "components/StarFieldOverall";
import MDBox from "components/MDBox";
import { motion } from "framer-motion";
import TopStats from "./TopStats";
import PinsView from "./PinsView";
import RecentPins from "./RecentPins";
import { useCountryData } from "./hooks/useCountryData";
import { useCountryMap } from "./hooks/useCountryMap";
import weatherEmoji from "./hooks/weatherEmoji";
import NavMenu from "./NavMenu";

const MapCard = React.lazy(() => import("./MapCard"));

export default function CountryPage() {
  const { countrySlug, continent } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef();

  // Human-friendly country name
  const countryName = useMemo(
    () =>
      decodeURIComponent(countrySlug || "")
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
    [countrySlug]
  );

  // Load all data
  const {
    pinCount,
    cityCount,
    recentPins,
    lastPinTimeAgo,
    lastCity,
    allPins,
    countryCities,
    categories,
    population,
    countryCode,
    temperature,
    weatherCondition,
    countryCitiesData,
  } = useCountryData(countryName);

  // Build flat list of normalized category‐keys:
  const normalize = (s) =>
    String(s || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  const viewKeys = useMemo(() => ["all", ...categories.map(normalize), "map"], [
    categories,
  ]);

  // UI state
  const [view, setView] = useState("all");
  const [selectedCity, setSelectedCity] = useState("All");
  const [expandedPinId, setExpandedPinId] = useState(null);

  // Filter pins for both map AND list based on view
  const filteredPins = useMemo(() => {
    if (view === "all" || view === "map") return allPins;
    return allPins.filter((pin) => {
      const cat = pin.properties?.category || pin.Category || "";
      return normalize(cat) === view;
    });
  }, [allPins, view]);

  // Create our map data hooks
  const { pins, bounds, onPoiClick, resetPinsFilter } = useCountryMap(
    filteredPins
  );

  // Navigation
  const goBack = useCallback(
    () => navigate(`/Destinations/${encodeURIComponent(continent)}`),
    [navigate, continent]
  );
  const navigatePin = useCallback(
    (pin) => {
      const slug = encodeURIComponent((pin.Name || pin.id).replace(/\s/g, "_"));
      navigate(
        `/Destinations/${encodeURIComponent(
          continent
        )}/${encodeURIComponent(countrySlug)}/${slug}`,
        { state: { pin } }
      );
    },
    [navigate, continent, countrySlug]
  );

  // Marquee for TopStats
  const marquee = useMemo(
    () =>
      countryCitiesData
        .map(
          (c) =>
            `${c.Name} added: ${new Date(c.created_at)
              .toISOString()
              .slice(0, 10)}`
        )
        .join(" · ") + " ·",
    [countryCitiesData]
  );

  // When we flip into “map” view, force a resize
  useEffect(() => {
    if (view !== "map") return;
    const mapInstance = mapRef.current?.getMap?.();
    if (mapInstance?.resize) {
      try {
        mapInstance.resize();
      } catch (err) {
        console.warn("resize failed:", err);
      }
    }
  }, [view]);

  return (
    <DashboardLayout>
      {/* Decorative blur circle */}
      <div
        style={{
          position: "fixed",
          top: -120,
          left: -80,
          zIndex: -1,
          filter: "blur(70px)",
          opacity: 0.14,
          pointerEvents: "none",
        }}
      >
        <svg width="600" height="600" viewBox="0 0 600 600">
          <circle cx="300" cy="300" r="250" fill="#f18f01" />
        </svg>
      </div>

      <StarFieldOverall />
      <SimpleResponsiveNavbar />

      <MDBox py={3}>
        {/* Top stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
        >
          <TopStats
            pinCount={pinCount}
            lastPinCreatedTimeAgo={lastPinTimeAgo}
            cityCount={cityCount}
            lastCity={lastCity}
            marqueeCities={marquee}
            temperature={temperature}
            weatherCondition={weatherCondition}
            countryCode={countryCode}
            countryName={countryName}
            population={population}
            weatherEmoji={weatherEmoji}
            onSeeAllPins={() => setView("all")}
          />
        </motion.div>

        {/* Category / Map selector */}
        <NavMenu
          continent={continent}
          onBack={goBack}
          selectedView={view}
          onViewChange={(v) => {
            if (!viewKeys.includes(v)) return;
            setView(v);
            setExpandedPinId(null);
          }}
        />

        {/* Main content */}
        <Box position="relative" minHeight={400} px={3} mb={3}>
          {/* Map Panel */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            sx={{ display: view === "map" ? "block" : "none" }}
          >
            <Suspense fallback={<div>Loading map…</div>}>
              <MapCard
                ref={mapRef}
                countryName={countryName}
                accessToken={process.env.REACT_APP_MAPBOX_TOKEN}
                initialBounds={bounds}
                pins={pins}
                onPoiClick={onPoiClick}
                resetPinsFilter={resetPinsFilter}
                height={400}
              />
            </Suspense>
          </Box>

          {/* Pins Panel */}
          {view !== "map" && (
            view === "all" && expandedPinId == null ? (
              <RecentPins
                recentPins={recentPins}
                expandedPinId={expandedPinId}
                handlePinClick={navigatePin}
                countryName={countryName}
                countryCities={countryCities}
                setExpandedPinId={setExpandedPinId}
              />
            ) : (
              <PinsView
                allPins={filteredPins}
                countryCities={countryCities}
                categories={categories}
                selectedCity={selectedCity}
                setSelectedCity={setSelectedCity}
                selectedCategory={view === "all" ? "All" : view}
                setSelectedCategory={() => {}}
                onReset={() => {
                  setSelectedCity("All");
                  setView("all");
                  setExpandedPinId(null);
                }}
                handlePinClick={navigatePin}
              />
            )
          )}
        </Box>

        <Footer />
      </MDBox>
    </DashboardLayout>
  );
}
