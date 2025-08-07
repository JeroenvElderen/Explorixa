// src/components/PinsView.jsx
import React from "react";
import PropTypes from "prop-types";
import { Button, Box } from "@mui/material";
import AllPinCard from "examples/Charts/PinCard/allpins";
import MDBox from "components/MDBox";
import { motion } from "framer-motion";
import { normalizeKey } from "utils/normalize";
import { timeAgo } from "./helpers";

export default function PinsView({
  allPins = [],
  selectedCategory,
  selectedPin,
  onResetCategory,
  handlePinClick,
  onBeenThere,
  onWantToGo,
  onSave,
}) {
  // 1) Decide which pins to show:
  let pinsToShow;
  if (selectedPin) {
    pinsToShow = [selectedPin];
  } else if (selectedCategory === "general" || selectedCategory === "All") {
    pinsToShow = allPins;
  } else {
    pinsToShow = allPins.filter(
      (pin) => normalizeKey(pin.Category) === selectedCategory
    );
  }

  // 2) Label for the “Show all” button:
  const catLabel =
    selectedCategory === "general"
      ? "General"
      : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);

  return (
    <>
      {/* “Show all {Category}” when viewing a single pin */}
      <Box px={2} mb={2} display="flex" gap={2}>
        {selectedPin && selectedCategory !== "general" && (
          <Button variant="outlined" onClick={onResetCategory}>
            Show all {catLabel}
          </Button>
        )}
      </Box>

      {/* 3) The scrollable list of cards */}
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
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(255,255,255,0.27)",
          },
        }}
      >
        {pinsToShow.map((pin, idx) => (
          <motion.div
            key={pin.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{
              scale: 1.016,
              boxShadow: "0 4px 32px 0 rgba(241,143,1,0.09)",
            }}
            transition={{ duration: 0.5, delay: 0.07 * idx }}
            style={{
              flex: "0 0 100%",
              scrollSnapAlign: "start",
              minWidth: "100%",
              maxWidth: "100%",
              marginBottom: 18,
              borderRadius: 14,
              cursor: "pointer",
            }}
            onClick={() => handlePinClick(pin)}
          >
            <AllPinCard
              pin={pin}
              title={pin.Name}
              description={pin.Information}
              imageurl={pin["Main Image"]}
              imagealt={pin.Name}
              date={timeAgo(pin.created_at)}
              showInternalInteraction={true}  // always show internal panel
              onBeenThere={onBeenThere}
              onWantToGo={onWantToGo}
              onSave={onSave}
            />
          </motion.div>
        ))}
      </MDBox>
    </>
  );
}

PinsView.propTypes = {
  allPins: PropTypes.array.isRequired,
  selectedCategory: PropTypes.string.isRequired,
  selectedPin: PropTypes.object,             // null or one pin
  onResetCategory: PropTypes.func.isRequired,
  handlePinClick: PropTypes.func.isRequired,
  onBeenThere: PropTypes.func.isRequired,
  onWantToGo: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};
