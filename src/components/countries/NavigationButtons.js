// src/components/CountryPage/NavigationButtons.jsx

import React from "react";
import { Button, Stack } from "@mui/material";

export default function NavigationButtons({
  continent,
  onBack,
  onNextCountry,
  onPrevCountry,
  disableNext,
  disablePrev,
  currentCountry,
  countriesList,
  navigate,
}) {
  return (
    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
      <Button
        variant="outlined"
        onClick={onBack}
        sx={{
          borderColor: "rgba(243,143,1,0.6)",
          color: "white",
          "&:hover": { background: "rgba(243,143,1,0.1)" },
        }}
        disabled={!continent}
      >
        ← Back to {continent || "continent"}
      </Button>
      <Button
        variant="outlined"
        onClick={onPrevCountry}
        disabled={disablePrev}
        sx={{
          borderColor: "rgba(243,143,1,0.6)",
          color: "white",
        }}
      >
        ← Previous Country
      </Button>
      <Button
        variant="outlined"
        onClick={onNextCountry}
        disabled={disableNext}
        sx={{
          borderColor: "rgba(243,143,1,0.6)",
          color: "white",
        }}
      >
        Next Country →
      </Button>
    </Stack>
  );
}
