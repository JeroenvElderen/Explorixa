// src/components/PinMapCard/CountBadge.jsx
import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function CountBadge({ title, count }) {
  return (
    <Box
      sx={{
        background: "#F18F01",
        borderRadius: 1.5,
        px: 1,
        py: 0.2,
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minWidth: 65,
        minHeight: 55,
      }}
    >
      <Typography variant="overline" sx={{ color: "#fff", fontWeight: 700, fontSize: "0.70rem", letterSpacing: 1 }}>
        {title}
      </Typography>
      <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700, fontSize: "1.10rem", mt: "2px" }}>
        {count}
      </Typography>
    </Box>
  );
}
