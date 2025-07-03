import React from "react";

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

function Home() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
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
      <MDBox mb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <ComplexStatisticsCard
              color="primary"
              icon="public"
              title="Destinations"
              count={"100+"}
              percentage={{ label: "around the world" }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <ComplexStatisticsCard
              color="success"
              icon="place"
              title="Pins Shared"
              count={"10k"}
              percentage={{ label: "by our community" }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <ComplexStatisticsCard
              color="warning"
              icon="group"
              title="Travelers"
              count={"5k"}
              percentage={{ label: "joined us" }}
            />
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Home;