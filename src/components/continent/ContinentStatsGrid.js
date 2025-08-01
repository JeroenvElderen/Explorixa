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

const weatherEmoji = {
  Clear: "☀️", Clouds: "☁️", Rain: "🌧️", Snow: "❄️", Thunderstorm: "⛈️", Drizzle: "🌦️",
  Mist: "🌫️", Smoke: "💨", Haze: "🌁", Dust: "🌪️",
};

const continentIcons = {
  africa: FaGlobeAfrica, europe: FaGlobeEurope, asia: FaGlobeAsia,
  "north america": FaGlobeAmericas, "south america": FaGlobeAmericas,
  antarctica: FaGlobe, "central america": FaGlobeAmericas,
  caribbean: FaGlobeAmericas, "middle east": FaGlobeAsia,
};

export default function ContinentStatsGrid({
  displayName,
  lookupKey,
  pinCount,
  cityCount,
  allCitiesString,
  temperature,
  weatherCondition,
  population,
}) {
  const IconComp = continentIcons[lookupKey] || FaGlobe;

  return (
    <Grid container spacing={2}>
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
            count={<CountUp end={pinCount || 0} duration={4} separator="," />}
            formatCount
            percentage={{ color: "success", amount: `Pins in ${displayName}` }}
          />
        </motion.div>
      </Grid>
      <Grid item xs={6} md={3}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.10 }}
        >
          <ComplexStatisticsCard
            icon="house"
            title="Cities"
            count={<CountUp end={cityCount || 0} duration={4} separator="," />}
            formatCount
            percentage={
              allCitiesString
                ? { color: "success", amount: <MarqueeText duration={20}>{allCitiesString}</MarqueeText> }
                : undefined
            }
          />
        </motion.div>
      </Grid>
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
            count={temperature != null ? `${temperature.toFixed(1)}°C` : "…"}
            percentage={{
              amount: `${weatherEmoji[weatherCondition] || ""} ${weatherCondition}`,
              label: "Weather",
            }}
          />
        </motion.div>
      </Grid>
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
            count={<CountUp end={population || 0} duration={4} separator="," />}
            formatCount
            percentage={{ color: "success", amount: "Updated" }}
          />
        </motion.div>
      </Grid>
    </Grid>
  );
}
