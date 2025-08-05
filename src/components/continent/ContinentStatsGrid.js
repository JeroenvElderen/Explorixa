// src/components/continent/ContinentStatsGrid.js
import React, { useMemo } from "react";
import { Grid } from "@mui/material";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import MarqueeText from "components/MarqueeText";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import {
  FaGlobeAfrica,
  FaGlobeAmericas,
  FaGlobeAsia,
  FaGlobeEurope,
  FaGlobe,
} from "react-icons/fa";
import { getContinentByCountry } from "utils/continentHelpers";

const normalize = (s) => String(s || "").trim().toLowerCase();

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
};

const continentIcons = {
  africa: FaGlobeAfrica,
  europe: FaGlobeEurope,
  asia: FaGlobeAsia,
  "north america": FaGlobeAmericas,
  "south america": FaGlobeAmericas,
  antarctica: FaGlobe,
  "central america": FaGlobeAmericas,
  caribbean: FaGlobeAmericas,
  "middle east": FaGlobeAsia,
};

export default function ContinentStatsGrid({
  displayName,
  lookupKey,
  recentPins,
  temperature,
  weatherCondition,
  population,
}) {
  // 1️⃣ Filter pins exactly like ContinentPage & MapCard do:
  const continentPins = useMemo(() => {
    return (recentPins || [])
      .filter((p) => p.countryName && p.latitude != null && p.longitude != null)
      .filter((p) => {
        const cNorm = normalize(p.countryName);
        let pinCont;
        if (cNorm === "russia") {
          // first, if your pin row carried a continent, honor it:
          if (p.continent) {
            pinCont = p.continent.toLowerCase();
          } else {
            // otherwise fall back to the longitude split
            pinCont = parseFloat(p.longitude) < 60 ? "europe" : "asia";
          }
        } else {
          pinCont = getContinentByCountry(p.countryName).toLowerCase();
        }
        return pinCont === lookupKey;
      });
  }, [recentPins, lookupKey]);

  // 2️⃣ Count pins
  const pinCount = continentPins.length;

  // 3️⃣ Build a list of unique cities with their latest created_at
  const cityEntries = useMemo(() => {
    const latestByCity = {};
    continentPins.forEach((p) => {
      const city = p.City ?? p.city;
      const date = p.created_at;
      if (!city) return;
      if (!latestByCity[city] || new Date(date) > new Date(latestByCity[city])) {
        latestByCity[city] = date;
      }
    });
    return Object.entries(latestByCity).map(
      ([city, date]) =>
        `${city} (${new Date(date).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })})`
    );
  }, [continentPins]);

  const cityCount = cityEntries.length;
  const allCitiesString = cityEntries.join(", ");

  // 4️⃣ Pick continent icon
  const IconComp = continentIcons[lookupKey] || FaGlobe;

  return (
    <Grid container spacing={2}>
      {/* PINS */}
      <Grid item xs={6} md={3}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.04 }}
        >
          <ComplexStatisticsCard
            color="dark"
            icon="place"
            title={displayName}
            count={<CountUp end={pinCount} duration={2.5} separator="," />}
            formatCount
            percentage={{
              color: "success",
              amount: `Pins in ${displayName}`,
            }}
          />
        </motion.div>
      </Grid>

      {/* CITIES */}
      <Grid item xs={6} md={3}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.10 }}
        >
          <ComplexStatisticsCard
            icon="house"
            title="Cities"
            count={<CountUp end={cityCount} duration={2.5} separator="," />}
            formatCount
            percentage={
              allCitiesString
                ? {
                    color: "success",
                    amount: (
                      <MarqueeText duration={20}>{allCitiesString}</MarqueeText>
                    ),
                  }
                : undefined
            }
          />
        </motion.div>
      </Grid>

      {/* CLIMATE */}
      <Grid item xs={6} md={3}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18 }}
        >
          <ComplexStatisticsCard
            color="info"
            icon="thermostat"
            title="Climate"
            count={
              temperature != null ? `${temperature.toFixed(1)}°C` : "…"
            }
            percentage={{
              amount: `${weatherEmoji[weatherCondition] || ""} ${
                weatherCondition || ""
              }`,
              label: "Weather",
            }}
          />
        </motion.div>
      </Grid>

      {/* POPULATION */}
      <Grid item xs={6} md={3}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.23 }}
        >
          <ComplexStatisticsCard
            color="primary"
            icon={<IconComp size={26} />}
            title="Population"
            count={<CountUp end={population || 0} duration={2.5} separator="," />}
            formatCount
            percentage={{ color: "success", amount: "Updated" }}
          />
        </motion.div>
      </Grid>
    </Grid>
  );
}
