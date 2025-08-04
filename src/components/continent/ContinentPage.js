// components/continent/ContinentPage.js
import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
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
import MapCard from "./MapCard";
import { getCountriesByContinent } from "utils/continentHelpers";
import { countryNameToIso } from "utils/countryColors";

/** normalize helper */
const normalize = (s) =>
  String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

export default function ContinentPage() {
  const { continent } = useParams();
  const {
    continentData,
    pinCount,
    cityCount,
    recentPins,
    allCitiesString,
    population,
    temperature,
    weatherCondition,
    setRecentPins,
  } = useContinentData(continent);

  const mapCardRef = useRef(null);
  const [continentPins, setContinentPins] = useState([]);
  const [loadingContinentPins, setLoadingContinentPins] = useState(true);

  const displayName = useMemo(() => {
    if (continentData?.name) return continentData.name;
    return decodeURIComponent(continent)
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }, [continentData, continent]);

  const continentCenters = {
    africa: { lat: 0, lng: 20, zoom: 2.5 },
    europe: { lat: 52, lng: 10, zoom: 3 },
    asia: { lat: 34, lng: 100, zoom: 2.5 },
    "north america": { lat: 45, lng: -100, zoom: 2.5 },
    "south america": { lat: -15, lng: -60, zoom: 2.5 },
    oceania: { lat: -22, lng: 140, zoom: 3 },
  }


  const lookupKey = decodeURIComponent(continent)
    .replace(/[_-]/g, " ")
    .toLowerCase();

  const handleRecentPinUpdated = useCallback(
    (updated) => {
      setRecentPins((prev) =>
        prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
      );
    },
    [setRecentPins]
  );

  // country list for this continent
  const countriesForContinent = useMemo(
    () => getCountriesByContinent(displayName || ""),
    [displayName]
  );
  const countrySet = useMemo(
    () => new Set(countriesForContinent.map((c) => normalize(c))),
    [countriesForContinent]
  );

  // filter and build GeoJSON features with ISO resolution
  useEffect(() => {
    if (!displayName) return;
    setLoadingContinentPins(true);
    try {
      const filtered = (recentPins || [])
        .filter((p) => {
          if (!p.countryName) return false;
          return countrySet.has(normalize(p.countryName));
        })
        .filter((p) => p.latitude != null && p.longitude != null)
        .map((p) => {
          const isoFromName =
            countryNameToIso[p.countryName] ||
            countryNameToIso[
              Object.keys(countryNameToIso).find(
                (k) => normalize(k) === normalize(p.countryName)
              ) || ""
            ] ||
            "default";

          return {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [parseFloat(p.longitude), parseFloat(p.latitude)],
            },
            properties: {
              pinId: p.id,
              title: p.Name,
              description: p["Post Summary"],
              imageurl: p["Main Image"],
              date: p.created_at,
              countryName: p.countryName,
              Information: p.Information,
              been_there: p.been_there,
              want_to_go: p.want_to_go,
              saved_count: p.saved_count,
              iso: isoFromName,
            },
          };
        });

      setContinentPins(filtered);
    } catch (e) {
      console.error("Error filtering continent pins", e);
      setContinentPins([]);
    } finally {
      setLoadingContinentPins(false);
    }
  }, [displayName, recentPins, countrySet]);

  // pick our centre from the table
  const initialTarget = continentCenters[lookupKey] || null;

  return (
    <DashboardLayout>
      {/* Stylish blurred SVG background */}
      <div
        style={{
          position: "fixed",
          top: "-120px",
          left: "-80px",
          zIndex: -1,
          filter: "blur(70px)",
          opacity: 0.14,
          pointerEvents: "none",
        }}
      >
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
          transition={{ delay: 0.5, duration: 0.7, type: "spring" }}
        >
          <MDBox
            mt={2}
            mb={2}
            sx={{
              height: 320,
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
            }}
          >
            <MapCard
              ref={mapCardRef}
              accessToken={process.env.REACT_APP_MAPBOX_TOKEN}
              pins={continentPins.length ? continentPins : recentPins}
              onPoiClick={() => {}}
              selectingPoint={false}
              flyOnTarget={!!initialTarget}
              initialTarget={initialTarget}
            />
          </MDBox>
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
            <RecentPinsGrid
              recentPins={recentPins}
              onUpdated={handleRecentPinUpdated}
            />
          </MDBox>
        </motion.div>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
