import React, { useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
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
      <StarFieldOverall />
      <SimpleResponsiveNavbar />
      <MDBox py={3}>
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

        <MDBox mt={4.5} mb={4.5}>
          <ProjectsContinent continent={displayName} />
        </MDBox>

        <MDBox mt={4.5} mb={4.5}>
          <RecentPinsGrid recentPins={recentPins} onUpdated={handleRecentPinUpdated} />
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
