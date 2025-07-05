import React from "react";
import { Box, Typography, Card, CardMedia, CardContent } from "@mui/material";

function PinDetailCard({ pin, onClose }) {
  return (
    <Card sx={{
      mb: 2,
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      background:
        "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
      border: "1px solid rgba(243, 143, 1, 0.6)",
      boxShadow:
        "inset 4px 4px 10px rgba(0,0,0,0.4), inset -4px -4px 10px rgba(255,255,255,0.1), 0 6px 15px rgba(0,0,0,0.3)",
      borderRadius: "12px",
      "&::-webkit-scrollbar": { width: 0, height: 0 },
      "&::-webkit-scrollbar-track": { background: "transparent" },
      "&::-webkit-scrollbar-thumb": { background: "transparent" },
      scrollbarWidth: "none",
      scrollbarColor: "transparent transparent",
      "-ms-overflow-style": "none",
    }}>
      <CardMedia
        component="img"
        image={pin["Main Image"]}
        alt={pin.title}
        height="300"
        sx={{ objectFit: "cover", borderRadius: "12px 12px 0 0" }}
      />
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: "white !important" }} gutterBottom>
          {pin.Name || "Untitled"}
        </Typography>

        <Typography variant="body2" color="white !important" sx={{ mb: 2 }}>
          {new Date(pin.created_at).toLocaleDateString()} • {pin.countryName}
        </Typography>

        <Typography variant="body1" color="white !important" sx={{ lineHeight: 1.8 }}>
          {pin.Information}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default PinDetailCard;
