// src/components/PinStats.js
import React from "react";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import { useTheme, useMediaQuery } from "@mui/material";

export function PinStats() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // No actions anymore; placeholder to keep layout compatibility.
  return (
    <Grid
      container
      spacing={2}
      direction="row"
      wrap="nowrap"
      justifyContent={isMobile ? "space-between" : "flex-end"}
      sx={{ width: "100%" }}
    >
      {/* Intentionally empty; metrics removed */}
    </Grid>
  );
}

PinStats.propTypes = {};
