// src/components/ListSectionWithPins.jsx
import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import PinsSection from "./PinsSection";

export default function ListsSection({ lists, loading, ...pinProps }) {
  if (loading) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography>Loading lists...</Typography>
      </Box>
    );
  }

  if (!lists.length) {
    return (
      <Typography variant="h6" align="center" color="textSecondary" mt={4}>
        You haven’t created any lists yet.
      </Typography>
    );
  }

  return (
    <Grid container spacing={4}>
      {lists.map((list) => (
        <Grid item xs={12} key={list.id}>
          {/* List header */}
          <Box mb={2}>
            <Typography variant="h5" gutterBottom>
              {list.name}
            </Typography>
          </Box>

          {/* Render pins in this list using your existing PinsSection */}
          <PinsSection pins={list.pins} {...pinProps} />
        </Grid>
      ))}
    </Grid>
  );
}
