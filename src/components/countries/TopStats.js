import React from "react";
import Grid from "@mui/material/Grid";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import MDBox from "components/MDBox";
import MarqueeText from "components/MarqueeText";
import CountUp from "react-countup";
import { motion } from "framer-motion";

export default function TopStats({
  pinCount,
  lastPinCreatedTimeAgo,
  cityCount,
  lastCity,
  marqueeCities,
  temperature,
  weatherCondition,
  countryCode,
  countryName,
  population,
  weatherEmoji,
  onSeeAllPins,
  isMobile,
}) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={6} sm={6} md={3}>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.04 }}
        >
          <MDBox mb={1.5} sx={{ cursor: "pointer" }} onClick={onSeeAllPins}>
            <ComplexStatisticsCard
              color="dark"
              icon="place"
              title="See all pins"
              count={<CountUp end={pinCount || 0} duration={4} separator="," />}
              percentage={{
                color: "success",
                amount: `Created ${lastPinCreatedTimeAgo}`,
              }}
            />
          </MDBox>
        </motion.div>
      </Grid>
      <Grid item xs={6} sm={6} md={3}>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.11 }}
        >
          <MDBox mb={1.5}>
            <ComplexStatisticsCard
              icon="house"
              title="Current cities"
              count={<CountUp end={cityCount || 0} duration={4} separator="," />}
              percentage={
                marqueeCities
                  ? {
                      color: "success",
                      amount: (
                        <MarqueeText duration={10}>
                          {marqueeCities}
                        </MarqueeText>
                      ),
                    }
                  : undefined
              }
            />
          </MDBox>
        </motion.div>
      </Grid>
      <Grid item xs={6} sm={6} md={3}>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18 }}
        >
          <MDBox mb={1.5}>
            <ComplexStatisticsCard
              color="info"
              icon="thermostat"
              title="Temperature"
              count={temperature != null ? <CountUp end={temperature} decimals={1} duration={4} /> : "…"}
              percentage={{
                color:
                  weatherCondition === "Clear"
                    ? "success"
                    : weatherCondition === "Rain"
                    ? "error"
                    : "warning",
                amount: `${weatherEmoji[weatherCondition] || ""} ${weatherCondition}`,
                label: "Weather",
              }}
            />
          </MDBox>
        </motion.div>
      </Grid>
      <Grid item xs={6} sm={6} md={3}>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.26 }}
        >
          <MDBox mb={1.5}>
            <ComplexStatisticsCard
              color="primary"
              icon={
                countryCode ? (
                  <img
                    src={`https://flagcdn.com/w320/${countryCode.toLowerCase()}.png`}
                    alt={`${countryName} flag`}
                    style={{
                      width: 26,
                      height: 26,
                      objectFit: "cover",
                      borderRadius: 4,
                    }}
                  />
                ) : null
              }
              title="Population"
              count={<CountUp end={population || 0} duration={4} separator="," />}
              formatCount
              percentage={{ color: "success", amount: "Updated" }}
            />
          </MDBox>
        </motion.div>
      </Grid>
    </Grid>
  );
}
