import React from "react";
import { FormControl, Select, MenuItem, Button, Box } from "@mui/material";
import MDBox from "components/MDBox";
import AllPinCard from "examples/Charts/PinCard/allpins";
import PinInteractionPanel from "components/PinInteractionPanel";
import { timeAgo } from "./helpers";
import { motion } from "framer-motion";

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
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.05 }}
        style={{
          marginBottom: 22,
          display: "flex",
          gap: 18,
          flexWrap: "wrap",
          padding: "18px",
          borderRadius: 16,
          background: "linear-gradient(120deg, rgba(255,255,255,0.21) 40%, rgba(241,143,1,0.08) 100%)",
          backdropFilter: "blur(13px)",
          border: "1px solid rgba(243,143,1,0.26)",
          boxShadow: "0 2px 22px 0 rgba(241,143,1,0.08)",
        }}
      >
        <FormControl
          variant="outlined"
          size="medium"
          sx={{
            minWidth: 180,
            background: "rgba(255,255,255,0.07)",
            color: "white",
            borderRadius: 1.3,
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
            background: "rgba(255,255,255,0.07)",
            color: "white",
            borderRadius: 1.3,
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
            fontWeight: 500,
            "&:hover": {
              background: "rgba(243,143,1,0.13)",
              borderColor: "rgba(243,143,1,1)",
              color: "#F18F01 !important",
            },
            borderRadius: 1.3,
            minWidth: 95,
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
            background: "rgba(255,255,255,0.08)",
            fontWeight: 500,
            "&:hover": {
              background: "rgba(243,143,1,0.13)",
              borderColor: "rgba(243,143,1,1)",
              color: "#F18F01 !important",
            },
            borderRadius: 1.3,
            minWidth: 80,
          }}
        >
          Back
        </Button>
      </motion.div>

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
          "&::-webkit-scrollbar-thumb": { backgroundColor: "rgba(255,255,255,0.27)" },
        }}
      >
        {allPins.map((pin, idx) => (
          <motion.div
            key={pin.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.016, boxShadow: "0 4px 32px 0 rgba(241,143,1,0.09)" }}
            transition={{ duration: 0.5, delay: 0.07 * idx }}
            style={{
              flex: "0 0 100%",
              scrollSnapAlign: "start",
              minWidth: "100%",
              maxWidth: "100%",
              marginBottom: 18,
              borderRadius: 14,
            }}
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
          </motion.div>
        ))}
      </MDBox>
    </>
  );
}
