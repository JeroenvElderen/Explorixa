// src/pages/CountryPage.jsx
import React, { Suspense, useMemo, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import SimpleResponsiveNavbar from "examples/Navbars/ResponsiveNavbar/allpage";
import Footer from "examples/Footer";
import StarFieldOverall from "components/StarFieldOverall";
import MDBox from "components/MDBox";
import { motion } from "framer-motion";
import NavigationButtons from "./NavigationButtons";
import TopStats from "./TopStats";
import PinsView from "./PinsView";
import RecentPins from "./RecentPins";
import { useCountryData } from "./hooks/useCountryData";
import { useCountryMap } from "./hooks/useCountryMap";
import weatherEmoji from "./hooks/weatherEmoji";
const MapCard = React.lazy(() => import("./MapCard"));

export default function CountryPage() {
  const { countrySlug, continent } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef();

  // Decode slug to display name
  const countryName = useMemo(
    () =>
      decodeURIComponent(countrySlug || "")
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, l => l.toUpperCase()),
    [countrySlug]
  );

  // Fetch data
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

  // Build map pins & bounds
  const { pins, bounds, onPoiClick, resetPinsFilter } = useCountryMap(allPins);

  // UI state
  const [showAllPins, setShowAllPins] = useState(false);
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedPinId, setExpandedPinId] = useState(null);

  // Navigation handlers
  const goBack = useCallback(
    () => navigate(`/Destinations/${encodeURIComponent(continent)}`),
    [navigate, continent]
  );
  const navigatePin = useCallback(
    pin => {
      const slug = encodeURIComponent((pin.Name || pin.id).replace(/\s/g, "_"));
      navigate(
        `/Destinations/${encodeURIComponent(continent)}/${encodeURIComponent(countrySlug)}/${slug}`,
        { state: { pin } }
      );
    },
    [navigate, continent, countrySlug]
  );
  const onSeeAllPins = useCallback(() => setShowAllPins(true), []);

  // Marquee string
  const marquee = useMemo(
    () =>
      countryCitiesData
        .map(
          c => `${c.Name} added: ${new Date(c.created_at).toISOString().slice(0, 10)}`
        )
        .join(" · ") + " ·",
    [countryCitiesData]
  );

  return (
    <DashboardLayout>
      {/* Background blur */}
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

      <MDBox px={3} py={1}>
        <NavigationButtons
          continent={continent}
          onBack={goBack}
          onNextCountry={() => {}}
          onPrevCountry={() => {}}
        />
      </MDBox>

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
            onSeeAllPins={onSeeAllPins}
          />
        </motion.div>
        
        {/* Recent vs All Pins */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
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
              handlePinClick={navigatePin}
            />
          ) : (
            <RecentPins
              recentPins={recentPins}
              expandedPinId={expandedPinId}
              handlePinClick={navigatePin}
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
