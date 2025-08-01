// components/continent/ContinentPage.js
import React, { useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import SimpleResponsiveNavbar from "examples/Navbars/ResponsiveNavbar/allpage";
import Footer from "examples/Footer";
import ProjectsContinent from "layouts/dashboard/components/ProjectsContinent";
import StarFieldOverall from "components/StarFieldOverall";
import useContinentData from "./useContinentData";
import ContinentStatsGrid from "./ContinentStatsGrid";
import RecentPinsGrid from "./RecentPinsGrid";

export default function ContinentPage() {
  const { continent } = useParams();
  const {
    continentData, pinCount, cityCount, recentPins, allCitiesString,
    population, temperature, weatherCondition, setRecentPins,
  } = useContinentData(continent);

  const displayName = useMemo(() => {
    if (continentData?.name) return continentData.name;
    return decodeURIComponent(continent)
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }, [continentData, continent]);

  const lookupKey = decodeURIComponent(continent).replace(/[_-]/g, " ").toLowerCase();

  const handleRecentPinUpdated = useCallback((updated) => {
    setRecentPins((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
  }, [setRecentPins]);

  return (
    <DashboardLayout>
      {/* Stylish blurred SVG background */}
      <div style={{
        position: "fixed",
        top: "-120px",
        left: "-80px",
        zIndex: -1,
        filter: "blur(70px)",
        opacity: 0.14,
        pointerEvents: "none",
      }}>
        <svg width="600" height="600" viewBox="0 0 600 600" fill="none">
          <circle cx="300" cy="300" r="250" fill="#f18f01" />
        </svg>
      </div>

      <StarFieldOverall />
      <SimpleResponsiveNavbar />
      <MDBox py={3}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, type: "spring" }}
        >
          <ContinentStatsGrid
            displayName={displayName}
            lookupKey={lookupKey}
            pinCount={pinCount}
            cityCount={cityCount}
            allCitiesString={allCitiesString}
            temperature={temperature}
            weatherCondition={weatherCondition}
            population={population}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.65, type: "spring" }}
        >
          <MDBox mt={4.5} mb={4.5}>
            <ProjectsContinent continent={displayName} />
          </MDBox>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.68, type: "spring" }}
        >
          <MDBox mt={4.5} mb={4.5}>
            <RecentPinsGrid recentPins={recentPins} onUpdated={handleRecentPinUpdated} />
          </MDBox>
        </motion.div>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
