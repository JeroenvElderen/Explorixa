import { Grid } from "@mui/material";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import MarqueeText from "components/MarqueeText";
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
        <ComplexStatisticsCard
          color="dark"
          icon="place"
          title={displayName}
          count={pinCount}
          formatCount
          percentage={{ color: "success", amount: `Pins in ${displayName}` }}
        />
      </Grid>
      <Grid item xs={6} md={3}>
        <ComplexStatisticsCard
          icon="house"
          title="Cities"
          count={cityCount}
          formatCount
          percentage={
            allCitiesString
              ? { color: "success", amount: <MarqueeText duration={12}>{allCitiesString}</MarqueeText> }
              : undefined
          }
        />
      </Grid>
      <Grid item xs={6} md={3}>
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
      </Grid>
      <Grid item xs={6} md={3}>
        <ComplexStatisticsCard
          color="primary"
          icon={<IconComp size={26} />}
          title="Population"
          count={population}
          formatCount
          percentage={{ color: "success", amount: "Updated" }}
        />
      </Grid>
    </Grid>
  );
}
