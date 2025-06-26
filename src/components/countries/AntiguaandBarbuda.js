/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import React, { useEffect, useState } from "react";
import { supabase } from "../../SupabaseClient";

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import PinCard from "examples/Charts/PinCard";

// Data
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";

// Dashboard components
import Projects from "layouts/dashboard/components/Projects";
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";


function truncate(text, maxLength) {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "…" : text;
}

// Helper function to convert date to "time ago" string
function timeAgo(date) {
  if (!date) return "N/A";
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;

  if (diffMs < 0) return "Just now"; // future dates fallback

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds} seconds ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;

  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

// Wrapper component for PinCard to update time-ago every minute
function PinCardWithTimeAgo({ pin, idx }) {
  const [timeSincePost, setTimeSincePost] = useState(() => timeAgo(pin.created_at));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSincePost(timeAgo(pin.created_at));
    }, 60000); // update every 1 minute

    return () => clearInterval(interval);
  }, [pin.created_at]);

  return (
    <PinCard
      color={idx === 0 ? "info" : idx === 1 ? "success" : "dark"}
      title={pin.title}
      description={truncate(pin.Information, 100)}
      date={timeSincePost}
      imageUrl={pin["Main Image"]}
      imageAlt={pin.title}
      height="150px"
    />
  );
}

function AntiguaandBarbuda() {
  const { sales, tasks } = reportsLineChartData;

  const [pinCount, setPinCount] = useState(0);
  const [cityCount, setCitieCount] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [population, setPopulation] = useState(null);
  const [flagUrl, setFlagUrl] = useState(null);
  const [tempLoading, setTempLoading] = useState(true);
  const [weatherCondition, setWeatherCondition] = useState("");
  const [recentPins, setRecentPins] = useState([]);

  const apiKey = "e1d18a84d3aa3e09beafffa4030f2b01";

  const weatherEmoji = {
    Clear: "☀️",
    Clouds: "☁️",
    Rain: "🌧️",
    Snow: "❄️",
    Thunderstorm: "⛈️",
    Drizzle: "🌦️",
    Mist: "🌫️",
    Smoke: "💨",
    Haze: "🌁",
    Dust: "🌪️",
    Fog: "🌁",
    Sand: "🏜️",
    Ash: "🌋",
    Squall: "🌬️",
    Tornado: "🌪️",
  };

  useEffect(() => {
    const fetchPinCount = async () => {
      const { count, error } = await supabase
        .from("pins")
        .select("*", { count: "exact", head: true })
        .eq("countryName", "AntiguaandBarbuda");

      if (error) {
        console.error("Error fetching pins:", error.message);
        return;
      }
      setPinCount(count);
    };

    fetchPinCount();
  }, []);

  useEffect(() => {
    const fetchCitieCount = async () => {
      const { count, error } = await supabase
        .from("cities")
        .select("*", { count: "exact", head: true })
        .eq("Country", "AntiguaandBarbuda");

      if (error) {
        console.error("Error fetching cities:", error.message);
        return;
      }
      setCitieCount(count);
    };

    fetchCitieCount();
  }, []);

  useEffect(() => {
    async function fetchTemperature() {
      try {
        const cityName = "Kabul";
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${apiKey}`
        );
        const data = await response.json();

        if (data.main && data.main.temp !== undefined) {
          setTemperature(data.main.temp);
        } else {
          console.error("Temperature data not found");
        }
      } catch (error) {
        console.error("Error fetching temperature:", error);
      } finally {
        setTempLoading(false);
      }
    }

    fetchTemperature();
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=Kabul,AF&units=metric&appid=${apiKey}`
        );
        const data = await response.json();

        setTemperature(data.main.temp);
        setWeatherCondition(data.weather[0].main);
      } catch (error) {
        console.error("Failed to fetch weather:", error);
      }
    };

    fetchWeather();
  }, []);

  useEffect(() => {
    const fetchPopulation = async () => {
      try {
        const response = await fetch(
          "https://restcountries.com/v3.1/name/AntiguaandBarbuda"
        );
        const data = await response.json();

        if (data && data[0] && data[0].population) {
          setPopulation(data[0].population);
        }
      } catch (error) {
        console.error("Error fetching population data:", error);
      }
    };

    fetchPopulation();
  }, []);

  useEffect(() => {
    const fetchFlag = async () => {
      try {
        const response = await fetch(
          "https://restcountries.com/v3.1/name/AntiguaandBarbuda"
        );
        const data = await response.json();

        if (data && data[0]?.flags?.png) {
          setFlagUrl(data[0].flags.png);
        }
      } catch (error) {
        console.error("Error fetching flag:", error);
      }
    };

    fetchFlag();
  }, []);

  useEffect(() => {
    const fetchRecentPins = async () => {
      try {
        const { data, error } = await supabase
          .from("pins")
          .select("*")
          .eq("countryName", "AntiguaandBarbuda") // or your filter column
          .order("created_at", { ascending: false }) // order by date descending
          .limit(3); // only 3 latest pins

        if (error) {
          console.error("Error fetching recent pins:", error);
          return;
        }

        setRecentPins(data);
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    };

    fetchRecentPins();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon="place"
                title="Pins"
                count={pinCount}
                percentage={{
                  color: "success",
                  amount: `${pinCount} pins found`,
                }}
              />
            </MDBox>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                icon="house"
                title="Current cities"
                count={cityCount}
                percentage={{
                  color: "success",
                  amount: `${cityCount} current cities`,
                }}
              />
            </MDBox>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="info"
                icon="thermostat"
                title="Temperature"
                count={
                  temperature !== null
                    ? `${temperature.toFixed(1)} °C`
                    : "Loading..."
                }
                percentage={{
                  color:
                    weatherCondition === "Clear"
                      ? "success"
                      : weatherCondition === "Rain"
                      ? "error"
                      : "warning",
                  amount: `${weatherEmoji[weatherCondition] || ""} ${weatherCondition}`,
                  label: "Current weather",
                }}
              />
            </MDBox>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon={
                  <img
                    src={"https://flagcdn.com/w320/af.png"}
                    alt="AntiguaandBarbuda flag"
                    style={{
                      width: "26px",
                      height: "26px",
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                  />
                }
                title="Population"
                count={population?.toLocaleString("en-US")}
                percentage={{
                  color: "success",
                  amount: "",
                  label: "Just updated",
                }}
              />
            </MDBox>
          </Grid>
        </Grid>

        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            {recentPins.length === 0 ? (
              <MDBox>Loading recent pins...</MDBox>
            ) : (
              recentPins.map((pin, idx) => (
                <Grid item xs={12} md={6} lg={4} key={pin.id || idx}>
                  <MDBox mb={3}>
                    <PinCardWithTimeAgo pin={pin} idx={idx} />
                  </MDBox>
                </Grid>
              ))
            )}
          </Grid>
        </MDBox>

        {/* <MDBox>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={8}>
              <Projects />
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <OrdersOverview />
            </Grid>
          </Grid>
        </MDBox> */}

      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default AntiguaandBarbuda;
