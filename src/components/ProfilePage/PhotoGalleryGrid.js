// src/components/PhotoGalleryGrid.jsx
import React from 'react';
import { Grid, Box } from '@mui/material';
import { Card } from '@mui/material';
import MDTypography from 'components/MDTypography';

const cardStyles = {
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  background: 'linear-gradient(145deg, rgba(241,143,1,0.3) 0%, rgba(241,143,1,0) 100%)',
  border: '1px solid rgba(255,255,255,0.6)',
  boxShadow:
    'inset 4px 4px 10px rgba(241,143,1,0.4), inset -4px -4px 10px rgba(241,143,1,0.1), 0 6px 15px rgba(241,143,1,0.3)',
  borderRadius: '12px',
  p: 3,
};

export default function PhotoGalleryGrid({ photos = [], openLightbox }) {
  return (
    <Card sx={cardStyles}>
      <MDTypography variant="h6" mb={2}>All Photos</MDTypography>
      <Grid container spacing={1}>
        {photos.map((photo, idx) => (
          <Grid item xs={2} key={idx}>
            <Box
              component="img"
              src={photo.src}
              alt={`Photo ${idx + 1}`}
              sx={{
                width: '100%',
                aspectRatio: '1 / 1',
                objectFit: 'cover',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
              onClick={() =>
                openLightbox(
                  photos.map((p) => ({ src: p.src })),
                  idx
                )
              }
            />
          </Grid>
        ))}
      </Grid>
    </Card>
  );
}
