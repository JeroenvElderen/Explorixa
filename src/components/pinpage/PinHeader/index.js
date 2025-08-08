import React from "react";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import { useTheme, useMediaQuery, Box } from "@mui/material";
import MDTypography from "../../MDTypography";
import PinInteractionPanel from "components/PinInteractionPanel";

function PinHeader({ pin, onUpdated }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Grid
      container
      spacing= {isMobile ? 0 : 4}
      alignItems="flex-start"
      justifyContent="stretch"
      sx={{ position: "relative" }} // for absolute positioning
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
        <MDTypography variant="h3">
          {pin.Name}
        </MDTypography>
        {pin["Post Summary"] && (
          <MDTypography variant="body2" color="text" sx={{ mt: 1 }}>
            {pin["Post Summary"]}
          </MDTypography>
        )}
      </Grid>

      {/* filler to balance */}
      <Grid item xs={12} md={6} />

      {/* Desktop-only interaction panel in top-right corner */}
      {!isMobile && (
        <Box
          sx={{
            position: "absolute",
            top: 42,
            right: 0,
            display: "flex",
            alignItems: "center",
            p: 1,
            pointerEvents: "auto",
          }}
        >
          <PinInteractionPanel
            pin={pin}
            onUpdated={(updatedPin) => {
              onUpdated?.(updatedPin);
            }}
          />
        </Box>
      )}
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
  onUpdated: PropTypes.func,
};

PinHeader.defaultProps = {
  onUpdated: () => {},
};

export default PinHeader;