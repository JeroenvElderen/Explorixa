// src/components/PinMapCard/CoordsField.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ExploreIcon from "@mui/icons-material/Explore";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

export function CoordsField({ latitude, longitude }) {
  // ✅ Hooks always at top
  const [hover, setHover] = useState(false);
  const [copied, setCopied] = useState(false);

  // guard after hooks
  if (latitude == null || longitude == null) {
    return null;
  }

  const formatted = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      mt={1}
      sx={{
        cursor: "pointer",
        borderRadius: 1,
        py: 1,
        px: 1,
        "&:hover": { background: "rgba(241,143,1,0.42)" },
      }}
      onClick={handleCopy}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={copied ? "Copied!" : "Click to copy coordinates"}
    >
      <Box display="flex" alignItems="center">
        <ExploreIcon sx={{ color: "#bc862b", mr: 0.75 }} />
        <Typography variant="h6" sx={{ color: "white !important" }}>
          {formatted}
        </Typography>
      </Box>
      <Box display="flex" alignItems="center">
        {hover && !copied && (
          <ContentCopyIcon
            sx={{ ml: 1, fontSize: 20, color: "#bc862b", opacity: 0.8 }}
          />
        )}
        {copied && (
          <Typography
            variant="caption"
            sx={{ ml: 2, color: "#bc862b", fontWeight: 500 }}
          >
            Copied!
          </Typography>
        )}
      </Box>
    </Box>
  );
}

CoordsField.propTypes = {
  latitude: PropTypes.number,
  longitude: PropTypes.number,
};
