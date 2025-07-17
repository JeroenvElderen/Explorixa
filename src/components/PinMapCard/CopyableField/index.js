// src/components/PinMapCard/CopyableField.jsx
import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

export default function CopyableField({
  icon: Icon,
  label,
  value,
  formatValue = (v) => v,
}) {
  const [hover, setHover] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(formatValue(value));
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <Box
      display="flex"
      alignItems="center"
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
      title={copied ? "Copied!" : `Click to copy ${label}`}
    >
      <Icon sx={{ color: "#bc862b", mr: 0.75 }} />
      <Box sx={{ flex: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ color: "white !important" }}>
          {formatValue(value)}
        </Typography>
      </Box>

      {hover && !copied && (
        <ContentCopyIcon sx={{ ml: 1, fontSize: 20, color: "#bc862b", opacity: 0.8 }} />
      )}
      {copied && (
        <Typography variant="caption" sx={{ ml: 2, color: "#bc862b", fontWeight: 500 }}>
          Copied!
        </Typography>
      )}
    </Box>
  );
}
