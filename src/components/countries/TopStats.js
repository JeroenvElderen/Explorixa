import React from "react";
import Grid from "@mui/material/Grid";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import MDBox from "components/MDBox";
import CountUp from "react-countup";
import { motion } from "framer-motion";
import Marquee from "react-fast-marquee";           // ← NEW

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
      {/* ——— See all pins ——— */}
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
              count={
                <CountUp
                  end={pinCount || 0}
                  duration={4}
                  separator=","
                />
              }
              percentage={{
                color: "success",
                amount: `Created ${lastPinCreatedTimeAgo}`,
              }}
            />
          </MDBox>
        </motion.div>
      </Grid>

      {/* ——— Current cities ——— */}
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
              count={
                <CountUp
                  end={cityCount || 0}
                  duration={4}
                  separator=","
                />
              }
              percentage={
                marqueeCities
                  ? {
                      color: "success",
                      amount: (
                        <Marquee
                          gradient={false}
                          speed={40}
                          pauseOnHover={true}
                        >
                          {marqueeCities}
                        </Marquee>
                      ),
                    }
                  : undefined
              }
            />
          </MDBox>
        </motion.div>
      </Grid>

      {/* ——— Temperature ——— */}
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
              count={
                temperature != null ? (
                  <CountUp
                    end={temperature}
                    decimals={1}
                    duration={4}
                  />
                ) : (
                  "…"
                )
              }
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

      {/* ——— Population ——— */}
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
                    src={`https://flagcdn.com/w320/${countryCode}.png`}
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
              count={
                <CountUp
                  end={population || 0}
                  duration={4}
                  separator=","
                />
              }
              formatCount
              percentage={{ color: "success", amount: "Updated" }}
            />
          </MDBox>
        </motion.div>
      </Grid>
    </Grid>
  );
}
