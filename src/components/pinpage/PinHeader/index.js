// src/components/pinpage/PinHeader.js
import React from "react";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import { useTheme, useMediaQuery } from "@mui/material";
import MDTypography from "../../MDTypography";

export function PinHeader({ pin }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Grid
      container
      spacing={4}
      alignItems="center"
      justifyContent={isMobile ? "center" : "space-between"}
    >
      <Grid
        item
        xs={12}
        md={6}
        mt={1}
        textAlign={isMobile ? "center" : "left"}
      >
        {(pin.City || pin.countryName) && (
          <MDTypography variant="subtitle1" color="text">
            {pin.City}
            {pin.City && pin.countryName ? ", " : ""}
            {pin.countryName}
          </MDTypography>
        )}
        <MDTypography variant="h3" gutterBottom>
          {pin.Name}
        </MDTypography>
        {pin["Post Summary"] && (
          <MDTypography variant="body2" color="text" sx={{ mt: 1 }}>
            {pin["Post Summary"]}
          </MDTypography>
        )}
      </Grid>
    </Grid>
  );
}

PinHeader.propTypes = {
  pin: PropTypes.shape({
    City: PropTypes.string,
    countryName: PropTypes.string,
    Name: PropTypes.string.isRequired,
    "Post Summary": PropTypes.string,
  }).isRequired,
};
