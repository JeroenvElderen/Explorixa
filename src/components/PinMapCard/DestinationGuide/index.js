// src/components/PinMapCard/DestinationGuide.jsx
import React from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CountBadge from "../CountBadge";

// same slug helper
function sluggify(str) {
  return (
    str
      ?.toString()
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_")
      .replace(/[^\w-]/g, "") || ""
  );
}

export default function DestinationGuide({
  continentName,
  countryName,
  citiesCount,
  storiesCount,
}) {
  // 1) hook at top
  const navigate = useNavigate();

  // 2) guard: we need a real countryName string
  if (typeof countryName !== "string" || !countryName.trim()) {
    return null;
  }

  // 3) pick heading source, force to string, then uppercase
  const rawHeading =
    typeof continentName === "string" && continentName.trim()
      ? continentName
      : countryName;
  const heading = rawHeading.toUpperCase();

  const continentSlug = sluggify(continentName || countryName);
  const countrySlug = sluggify(countryName);

  return (
    <Box display="flex" alignItems="center">
      {/* Thumbnail */}
      <Box
        sx={{
          width: 100,
          height: 145,
          borderRadius: 2,
          background: "#ddd",
          overflow: "hidden",
          flexShrink: 0,
          mr: 1,
          display: "flex",
          alignItems: "center",
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
          alt={countryName}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Box>

      {/* Text & badges */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography
          variant="overline"
          sx={{
            color: "#fff",
            letterSpacing: 1,
            fontWeight: 600,
            fontSize: "0.7rem",
          }}
        >
          {heading}
        </Typography>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#fff",
            fontSize: "1.2rem",
            mt: -1,
            cursor: "pointer",
            textDecoration: "underline",
          }}
          onClick={() =>
            navigate(`/Destinations/${continentSlug}/${countrySlug}`)
          }
        >
          {countryName}
        </Typography>

        <Box display="flex" gap={1.25} alignItems="flex-end" mt={3.5}>
          <CountBadge title="PLACES" count={citiesCount} />
          <CountBadge title="STORIES" count={storiesCount} />
        </Box>
      </Box>
    </Box>
  );
}

DestinationGuide.propTypes = {
  continentName: PropTypes.string,
  countryName: PropTypes.string.isRequired,
  citiesCount: PropTypes.number.isRequired,
  storiesCount: PropTypes.number.isRequired,
};
