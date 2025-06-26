import React from "react";
import { Box, Typography, Card, CardMedia, CardContent } from "@mui/material";

function PinDetailCard({ pin, onClose }) {
  return (
    <Card sx={{ maxWidth: "100%", mb: 4, borderRadius: 3, boxShadow: 6 }}>
      <CardMedia
        component="img"
        image={pin["Main Image"]}
        alt={pin.title}
        height="300"
        sx={{ objectFit: "cover", borderRadius: "12px 12px 0 0" }}
      />
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: "white !important" }} gutterBottom>
          {pin.title}
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
