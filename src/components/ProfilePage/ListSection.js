import React from "react";
import { Grid, Card, CardContent, Typography, CircularProgress, Box } from "@mui/material";

export default function ListsSection({ lists, loading }) {
  if (loading) {
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
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
    <Grid container spacing={2}>
      {lists.map((list) => (
        <Grid item xs={12} sm={6} md={4} key={list.id}>
          <Card>
            <CardContent>
              <Typography variant="h6">{list.name}</Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {list.item_count} items
              </Typography>
              <Typography variant="body2">{list.description}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
