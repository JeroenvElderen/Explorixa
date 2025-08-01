import React from "react";
import Grid from "@mui/material/Grid";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import MDBox from "components/MDBox";
import MarqueeText from "components/MarqueeText";

export default function TopStats({
  pinCount,
  lastPinCreatedTimeAgo,
  cityCount,
  lastCity,
  marqueeCities, // <-- ADDED
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
        <MDBox mb={1.5} sx={{ cursor: "pointer" }} onClick={onSeeAllPins}>
          <ComplexStatisticsCard
            color="dark"
            icon="place"
            title="See all pins"
            count={pinCount}
            percentage={{
              color: "success",
              amount: `Created ${lastPinCreatedTimeAgo}`,
            }}
          />
        </MDBox>
      </Grid>
      <Grid item xs={6} sm={6} md={3}>
        <MDBox mb={1.5}>
          <ComplexStatisticsCard
            icon="house"
            title="Current cities"
            count={cityCount}
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
      </Grid>
      <Grid item xs={6} sm={6} md={3}>
        <MDBox mb={1.5}>
          <ComplexStatisticsCard
            color="info"
            icon="thermostat"
            title="Temperature"
            count={temperature != null ? `${temperature.toFixed(1)}°C` : "…"}
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
      </Grid>
      <Grid item xs={6} sm={6} md={3}>
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
            count={population}
            formatCount
            percentage={{ color: "success", amount: "Updated" }}
          />
        </MDBox>
      </Grid>
    </Grid>
  );
}
