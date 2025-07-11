// What to do in this page //

// 1. at map background for the header //
// 2. Add a place of the day section //
// 3. Explore our pins //
// 4. Join the community //

import React, { useState, useEffect } from "react";

// Supabase client
import { supabase } from "../../SupabaseClient";

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import SimpleResponsiveNavbar from "examples/Navbars/ResponsiveNavbar/allpage";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import StarFieldOverall from "components/StarFieldOverall";

function Home() {
  const [cityCount, setCityCount] = useState(null);
  const [pinCount, setPinCount] = useState(null);
  const [profileCount, setProfileCount] = useState(null);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingPins, setLoadingPins] = useState(true);
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  useEffect(() => {
    const fetchCityCount = async () => {
      setLoadingCities(true);
      const { count, error } = await supabase
        .from("cities")
        .select("*", { count: "exact", head: true });

      if (error) {
        console.error("Error fetching city count:", error);
        setCityCount(0);
      } else {
        setCityCount(count);
      }
      setLoadingCities(false);
    };
    fetchCityCount();
  }, []);

  useEffect(() => {
    const fetchPinCount = async () => {
      setLoadingPins(true);
      const { count, error } = await supabase
        .from("pins")
        .select("*", { count: "exact", head: true });

      if (error) {
        console.error("Error fetching pin count:", error);
        setPinCount(0);
      } else {
        setPinCount(count);
      }
      setLoadingPins(false);
    };
    fetchPinCount();
  }, []);

  useEffect(() => {
    const fetchProfileCount = async () => {
      setLoadingProfiles(true);
      const { count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      if (error) {
        console.error("Error fetching profile count:", error);
        setProfileCount(0);
      } else {
        setProfileCount(count);
      }
      setLoadingProfiles(false);
    };
    fetchProfileCount();
  }, []);

  const displayCityCount = loadingCities
    ? "..."
    : cityCount >= 1000
    ? `${Math.floor(cityCount / 1000)}k+`
    : cityCount.toLocaleString();

  const displayPinCount = loadingPins ? "..." : pinCount.toLocaleString();
  const displayProfileCount = loadingProfiles ? "..." : profileCount.toLocaleString();

  return (
    <>
    {/* Background component */}
    <StarFieldOverall />

    {/* Dashboard */}
    <DashboardLayout>

      {/* Bottom navbar component */}
      <SimpleResponsiveNavbar />

      {/* container header */}
      <MDBox py={6} textAlign="center" bgColor="black" borderRadius="lg" mb={6}>
        <MDTypography variant="h2" fontWeight="bold" mb={2}>
          Welcome to Explorixa
        </MDTypography>
        <MDTypography variant="body1" color="text" mb={4}>
          Discover amazing destinations and plan your next adventure with ease.
        </MDTypography>
        <MDButton color="info" size="large" href="/map">
          Explore Map
        </MDButton>
      </MDBox>

    {/* Container with cards */}
      <MDBox mb={3}>
        <Grid container spacing={3}>

          {/* Card for Destionations */}
          <Grid item xs={12} md={4}>
            <ComplexStatisticsCard
              color="primary"
              icon="public"
              title="Destinations"
              count={displayCityCount}
              percentage={{ label: "around the world" }}
            />
          </Grid>

          {/* Card for pins shared */}
          <Grid item xs={12} md={4}>
            <ComplexStatisticsCard
              color="success"
              icon="place"
              title="Pins Shared"
              count={displayPinCount}
              percentage={{ label: "by our community" }}
            />
          </Grid>

          {/* Card for Travelers */}
          <Grid item xs={12} md={4}>
            <ComplexStatisticsCard
              color="warning"
              icon="group"
              title="Travelers"
              count={displayProfileCount}
              percentage={{ label: "joined us" }}
            />
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
    </>
  );
}

export default Home;
