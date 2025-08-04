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

  // Precomputed SW/NE bounds for each continent
  const continentBounds = {
    africa:          [[-20.0, -35.0], [ 55.0,  38.0]],
    europe:          [[-10.0,  34.0], [ 30.0,  72.0]],
    asia:            [[ 26.0,   1.0], [180.0,  81.0]],
    "north america": [[-170.0,   5.0], [ -50.0,  83.0]],
    "south america": [[ -82.0, -58.0], [ -34.0,  13.0]],
    oceania:         [[ 110.0, -50.0], [ 180.0,  10.0]],
  };

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

  // Build map pins for this continent
  useEffect(() => {
    if (!displayName) return;
    setLoadingContinentPins(true);
    try {
      const filtered = (recentPins || [])
        .filter((p) => p.countryName && normalize(p.countryName))
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
  }, [displayName, recentPins]);

  // bounding box for fitBounds
  const initialBounds = continentBounds[lookupKey] || null;

  return (
    <DashboardLayout>
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
              initialBounds={initialBounds}
              highlightContinent={displayName}
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
