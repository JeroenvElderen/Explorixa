// src/components/PinCard.jsx
import React from 'react';
import { Box, Avatar, CardContent } from '@mui/material';
import MDTypography from 'components/MDTypography';
import ImageGridGallery from './ImageGridGallery';
import PinActions from './PinActions';

export default function PinCard({
  pin,
  profile,
  isSaved,
  isBeenThere,
  isWantToGo,
  saveBeenThere,
  removeBeenThere,
  saveWantToGo,
  removeWantToGo,
  onSaveClick,
  openLightbox,
  compact = false,
}) {
  let imageUrls = [];
  try {
    const parsed = JSON.parse(pin.Images || '[]');
    imageUrls = Array.isArray(parsed) ? parsed.map(u => u.trim()) : [];
  } catch {
    imageUrls = (pin.Images || '').split(',').map(u => u.trim());
  }
  const main = pin['Main Image']?.trim();
  if (main) imageUrls = [main, ...imageUrls.filter(u => u !== main)];

  return (
    <CardContent>
      {!compact && (
        <Box display="flex" alignItems="center" gap={2} mb={1}>
          <Avatar src={profile.avatar_url} />
          <Box>
            <MDTypography variant="subtitle2">{profile.full_name || profile.Username}</MDTypography>
            <MDTypography variant="caption" color="white">
              {new Date(pin.created_at).toLocaleDateString()}
            </MDTypography>
          </Box>
        </Box>
      )}
      {!compact && <MDTypography variant="h6">{pin.Name}</MDTypography>}
      {!compact && <MDTypography variant="body2" sx={{ mb: 2 }}>{pin.Information}</MDTypography>}
      <Box mb={2}>
        <ImageGridGallery
          imageUrls={imageUrls}
          onImageClick={(i) => openLightbox(imageUrls.map(src => ({ src })), i)}
          sx={compact ? { width: '100%', height: 120 } : {}}
        />
      </Box>
      <Box display="flex" gap={2} flexWrap="wrap">
        <PinActions
          isSaved={isSaved}
          savedCount={pin.saved_count || 0}
          onSave={() => onSaveClick(pin)}
          isBeenThere={isBeenThere}
          beenThereCount={pin.been_there || 0}
          onBeenThere={() => {
            const next = !isBeenThere;
            const count = next ? (pin.been_there||0)+1 : Math.max((pin.been_there||1)-1,0);
            next ? saveBeenThere(pin) : removeBeenThere(pin);
          }}
          isWantToGo={isWantToGo}
          wantToGoCount={pin.want_to_go || 0}
          onWantToGo={() => {
            const next = !isWantToGo;
            const count = next ? (pin.want_to_go||0)+1 : Math.max((pin.want_to_go||1)-1,0);
            next ? saveWantToGo(pin) : removeWantToGo(pin);
          }}
        />
      </Box>
    </CardContent>
  );
}
