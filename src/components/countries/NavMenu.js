// src/components/NavMenu.jsx
import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import { Box, Button, Stack, useMediaQuery, useTheme } from "@mui/material";

const normalize = (s) =>
  String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const NAV_OPTIONS = [
  { key: "all", label: "General" },
  { key: normalize("Traditions"), label: "Traditions" },
  { key: normalize("Accommodation"), label: "Accommodation" },
  { key: normalize("active?"), label: "Active ?" },
  { key: normalize("Do's / Don'ts"), label: "Do's / Don'ts" },
  { key: normalize("Nightlife"), label: "NightLife" },
  { key: normalize("Discover"), label: "Discover" },
  { key: normalize("Yumy Yumy"), label: "Yumy Yumy" },
  { key: "map", label: "Map" },
];

export default function NavMenu({
  continent,
  onBack,
  selectedView,
  onViewChange,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const scrollRef = useRef();

  // for drag-to-scroll
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };
  const onMouseLeave = () => {
    isDragging.current = false;
  };
  const onMouseUp = () => {
    isDragging.current = false;
  };
  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1; // scroll-fastness
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const btnSx = (active) => ({
    borderColor: "rgba(243,143,1,0.6)",
    color: active ? "#F18F01" : "white",
    background: active ? "rgba(243,143,1,0.13)" : "rgba(255,255,255,0.07)",
    "&:hover": {
      background: "rgba(243,143,1,0.13)",
      borderColor: "#F18F01",
      color: "#F18F01",
      boxShadow: "0 0 0 2px #f18f0133",
    },
    fontWeight: 500,
    letterSpacing: 0.2,
    textTransform: "none",
    py: 1,
    px: 2,
    whiteSpace: "nowrap",
    flexShrink: 0,
  });

  // MOBILE: same as before
  if (isMobile) {
    return (
      <Box mb={2} px={2}>
        <Box
          sx={{
            display: "flex",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          <Box sx={{ mr: 1 }}>
            <Button variant="outlined" sx={btnSx(false)} onClick={onBack}>
              ← Back to {continent}
            </Button>
          </Box>
          {NAV_OPTIONS.map(({ key, label }) => (
            <Box key={key} sx={{ mr: 1 }}>
              <Button
                variant="outlined"
                sx={btnSx(selectedView === key)}
                onClick={() => onViewChange(key)}
              >
                {label}
              </Button>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  // DESKTOP: enable click+drag scroll
  return (
    <Box
      sx={{
        width: "100%",
        borderRadius: 2,
        backdropFilter: "blur(10px)",
        background:
          "linear-gradient(90deg,rgba(255,255,255,0.13),rgba(241,143,1,0.04) 100%)",
        boxShadow: "0 4px 20px 0 rgba(241,143,1,0.07)",
        p: 2,
        mb: 2,
      }}
    >
      <Box
        ref={scrollRef}
        sx={{
          display: "flex",
          overflowX: "auto",
          cursor: isDragging.current ? "grabbing" : "grab",
          "&::-webkit-scrollbar": { display: "none" },
        }}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Button variant="outlined" sx={btnSx(false)} onClick={onBack}>
            ← Back to {continent}
          </Button>
          {NAV_OPTIONS.map(({ key, label }) => (
            <Button
              key={key}
              variant="outlined"
              sx={btnSx(selectedView === key)}
              onClick={() => onViewChange(key)}
            >
              {label}
            </Button>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

NavMenu.propTypes = {
  continent: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired,
  selectedView: PropTypes.oneOf(NAV_OPTIONS.map((o) => o.key)).isRequired,
  onViewChange: PropTypes.func.isRequired,
};
