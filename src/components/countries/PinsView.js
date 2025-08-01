// src/components/CountryPage/PinsView.jsx

import React from "react";
import { FormControl, Select, MenuItem, Button, Box } from "@mui/material";
import MDBox from "components/MDBox";
import AllPinCard from "examples/Charts/PinCard/allpins";
import PinInteractionPanel from "components/PinInteractionPanel";
import { timeAgo } from "./helpers";

export default function PinsView({
  allPins = [],
  countryCities = [],
  categories = [],
  selectedCity,
  setSelectedCity,
  selectedCategory,
  setSelectedCategory,
  onReset,
  onBack,
  handlePinClick,
}) {
  return (
    <>
      {/* Filter Controls */}
      <MDBox
        mb={3}
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          p: 2,
          borderRadius: 2,
          background: "transparent",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(243,143,1,0.6)",
        }}
      >
        <FormControl
          variant="outlined"
          size="medium"
          sx={{
            minWidth: 180,
            background: "rgba(255,255,255,0.05)",
            color: "white",
          }}
        >
          <Select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            displayEmpty
            sx={{ color: "white", height: "100%" }}
          >
            {countryCities.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          variant="outlined"
          size="medium"
          sx={{
            minWidth: 180,
            background: "rgba(255,255,255,0.05)",
            color: "white",
          }}
        >
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            displayEmpty
            sx={{ color: "white", height: "100%" }}
          >
            <MenuItem value="All">All Categories</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          onClick={onReset}
          sx={{
            borderColor: "rgba(243,143,1,0.6)",
            color: "white !important",
            background: "transparent",
            "&:hover": {
              background: "rgba(243,143,1,0.1)",
              borderColor: "rgba(243,143,1,1)",
            },
          }}
        >
          Reset
        </Button>
        <Button
          variant="outlined"
          onClick={onBack}
          sx={{
            borderColor: "rgba(243,143,1,0.6)",
            color: "white !important",
            background: "rgba(255,255,255,0.05)",
            "&:hover": {
              background: "rgba(243,143,1,0.1)",
              borderColor: "rgba(243,143,1,1)",
            },
          }}
        >
          Back
        </Button>
      </MDBox>

      {/* Pin Cards + PinInteractionPanel */}
      <MDBox
        mt={4.5}
        sx={{
          display: "flex",
          flexDirection: "column",
          maxHeight: 600,
          overflowY: "auto",
          scrollSnapType: "y mandatory",
          gap: 2,
          px: 2,
          py: 2,
          WebkitOverflowScrolling: "touch",
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-thumb": { backgroundColor: "rgba(255,255,255,0.3)" },
        }}
      >
        {allPins.map((pin) => (
          <Box
            key={pin.id}
            sx={{ flex: "0 0 100%", scrollSnapAlign: "start", minWidth: "100%", maxWidth: "100%", mb: 2 }}
          >
            <div onClick={() => handlePinClick(pin)} style={{ cursor: "pointer" }}>
              <AllPinCard
                pin={pin}
                title={pin.Name}
                description={pin.Information}
                category={pin.Category}
                imageurl={pin["Main Image"]}
                imagealt={pin.Name}
                date={timeAgo(pin.created_at)}
              />
            </div>
          </Box>
        ))}
      </MDBox>
    </>
  );
}
