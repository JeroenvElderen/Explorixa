import React, { useMemo, useState, useEffect, Suspense, lazy } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import SimpleResponsiveNavbar from "examples/Navbars/ResponsiveNavbar/allpage";
import ContinentStatsGrid from "./ContinentStatsGrid";
import MDBox from "components/MDBox";
import Footer from "examples/Footer";
import useContinentData from "./useContinentData";
import CircularProgress from "@mui/material/CircularProgress";

// Lazy-loaded heavy components
const StarFieldOverall  = lazy(() => import("components/StarFieldOverall"));
const ProjectsContinent = lazy(() => import("layouts/dashboard/components/ProjectsContinent"));
const RecentPinsGrid    = lazy(() => import("./RecentPinsGrid"));

// Simple loader component
const Loader = () => (
  <MDBox
    position="fixed"
    top={0}
    left={0}
    width="100%"
    height="100%"
    display="flex"
    justifyContent="center"
    alignItems="center"
    bgcolor="rgba(255,255,255,0.8)"
    zIndex={1300}
  >
    <CircularProgress />
  </MDBox>
);

export default function ContinentPage() {
  const { continent } = useParams();
  const {
    continentData,
    recentPins,
    setRecentPins,
    temperature,
    weatherCondition,
    population,
  } = useContinentData(continent);

  const [modulesLoaded, setModulesLoaded] = useState(false);

  // Preload lazy modules
  useEffect(() => {
    Promise.all([
      import("components/StarFieldOverall"),
      import("layouts/dashboard/components/ProjectsContinent"),
      import("./RecentPinsGrid"),
    ]).then(() => setModulesLoaded(true));
  }, []);

  const displayName = useMemo(() => {
    if (continentData?.name) return continentData.name;
    return decodeURIComponent(continent)
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }, [continentData, continent]);

  return (
    <>
      {!modulesLoaded && <Loader />}
      <DashboardLayout style={{ visibility: modulesLoaded ? 'visible' : 'hidden' }}>
        <Suspense fallback={null}>
          <StarFieldOverall />
        </Suspense>
        <SimpleResponsiveNavbar />

        <MDBox py={3}>
          <ContinentStatsGrid
            displayName={displayName}
            lookupKey={displayName.toLowerCase()}
            recentPins={recentPins}
            temperature={temperature}
            weatherCondition={weatherCondition}
            population={population}
          />

          <Suspense fallback={null}>
            <MDBox mt={4.5} mb={4.5}>
              <ProjectsContinent continent={displayName} />
            </MDBox>
          </Suspense>

          <Suspense fallback={null}>
            <MDBox mt={4.5} mb={4.5}>
              <RecentPinsGrid
                recentPins={recentPins}
                onUpdated={setRecentPins}
              />
            </MDBox>
          </Suspense>
        </MDBox>

        <Footer />
      </DashboardLayout>
    </>
  );
}
