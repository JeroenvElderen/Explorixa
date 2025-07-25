// src/components/PinsSection.jsx
import React, { useState } from 'react';
import { Box, Grid, Card, CircularProgress, Avatar } from '@mui/material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import ReorderIcon from '@mui/icons-material/Reorder';
import WindowIcon from '@mui/icons-material/Window';
import PinActions from './PinActions';
import ImageGridGallery from './ImageGridGallery';

const headerStyles = {
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  background: 'linear-gradient(145deg, rgba(241,143,1,0.3) 0%, rgba(241,143,1,0) 100%)',
  border: '1px solid rgba(255,255,255,0.6)',
  boxShadow: 'inset 4px 4px 10px rgba(241,143,1,0.4), inset -4px -4px 10px rgba(241,143,1,0.1), 0 6px 15px rgba(241,143,1,0.3)',
  borderRadius: '12px',
  p: 3,
};

export default function PinsSection({
  pins,
  profile,
  savedPins,
  beenTherePins,
  wantToGoPins,
  toggleBeenThere,
  toggleWantToGo,
  handleSaveClick,
  loadingPins,
  openLightbox,
}) {
  const [viewMode, setViewMode] = useState('list');
  const [expandedPinId, setExpandedPinId] = useState(null);

  // Group pins by Month Year
  const pinsByMonthYear = pins.reduce((acc, pin) => {
    const d = new Date(pin.created_at);
    const month = d.toLocaleString('default', { month: 'long' });
    const year = d.getFullYear();
    const key = `${month} ${year}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(pin);
    return acc;
  }, {});

  if (!profile) return null;

  return (
    <Grid item xs={12} md={8}>
      {/* Posts Header */}
      <Box mb={2} sx={headerStyles}>
        <MDTypography variant="h5" color="white" mb={1}>Pins</MDTypography>
        <Box display="flex" gap={3} borderBottom="1px solid #444" justifyContent="center">
          <Box
            onClick={() => setViewMode('list')}
            sx={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
              pb: 1, cursor: 'pointer', borderBottom: viewMode==='list'? '3px solid #F18F01':'3px solid transparent',
              color: viewMode==='list'? '#F18F01':'#aaa', fontWeight: 500, fontSize: '14px',
            }}
          >
            <ReorderIcon fontSize="small" /> List view
          </Box>
          <Box
            onClick={() => setViewMode('grid')}
            sx={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
              pb: 1, cursor: 'pointer', borderBottom: viewMode==='grid'? '3px solid #F18F01':'3px solid transparent',
              color: viewMode==='grid'? '#F18F01':'#aaa', fontWeight: 500, fontSize: '14px',
            }}
          >
            <WindowIcon fontSize="small" /> Grid view
          </Box>
        </Box>
      </Box>

      {loadingPins ? (
        <Box textAlign="center"><CircularProgress size={24} /></Box>
      ) : pins.length > 0 ? (
        viewMode === 'list' ? (
          // Existing List View
          <MDBox display="flex" flexDirection="column" gap={3}>
            {pins.map(pin => {
              const isFav = savedPins.some(p=>p.id===pin.id);
              const isBeen = beenTherePins.some(p=>p.id===pin.id);
              const isWant = wantToGoPins.some(p=>p.id===pin.id);
              let imageUrls = [];
              try {
                const raw = pin.Images||'';
                const parsed = JSON.parse(raw);
                imageUrls = Array.isArray(parsed)? parsed.map(u=>u.trim()): raw.split(',').map(u=>u.trim());
              } catch {
                imageUrls = (pin.Images||'').split(',').map(u=>u.trim());
              }
              const main = pin['Main Image']?.trim();
              if (main) imageUrls = [main, ...imageUrls.filter(u=>u!==main)];

              return (
                <Card key={pin.id} sx={{ ...headerStyles, p:3, mb:3 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Avatar src={profile.avatar_url} />
                    <Box>
                      <MDTypography variant="subtitle2">{profile.full_name||profile.Username}</MDTypography>
                      <MDTypography variant="caption" color="white">{new Date(pin.created_at).toLocaleDateString()}</MDTypography>
                    </Box>
                  </Box>
                  <MDTypography variant="h6">{pin.Name}</MDTypography>
                  <MDTypography variant="body2" sx={{ mb:2 }}>{pin.Information}</MDTypography>
                  <Box mb={2}>
                    <ImageGridGallery imageUrls={imageUrls} onImageClick={i=>openLightbox(imageUrls.map(src=>({src})), i)} />
                  </Box>
                  <Box display="flex" gap={2} flexWrap="wrap">
                    <PinActions
                      isSaved={isFav} savedCount={pin.saved_count||0} onSave={()=>handleSaveClick(pin)}
                      isBeenThere={isBeen} beenThereCount={pin.been_there||0} onBeenThere={()=>toggleBeenThere(pin)}
                      isWantToGo={isWant} wantToGoCount={pin.want_to_go||0} onWantToGo={()=>toggleWantToGo(pin)}
                    />
                  </Box>
                </Card>
              );
            })}
          </MDBox>
        ) : (
          // New Grid View
          <MDBox display="flex" flexDirection="column" gap={4}>
            {expandedPinId===null ? (
              <MDBox display="flex" flexDirection="column" gap={4}>
                {Object.entries(pinsByMonthYear).map(([monthYear, monthPins]) => (
                  <Box key={monthYear}>
                    <MDTypography variant="h5" color="white" mb={2}>{monthYear}</MDTypography>
                    <Grid container spacing={3} alignItems="stretch">
                      {monthPins.map(pin => {
                        let imageUrls = [];
                        try {
                          const parsed = JSON.parse(pin.Images||'[]');
                          imageUrls = Array.isArray(parsed)? parsed.map(u=>u.trim()):[];
                        } catch {
                          imageUrls = (pin.Images||'').split(',').map(u=>u.trim());
                        }
                        const main = (pin['Main Image']||'').trim();
                        if (main) imageUrls = [main, ...imageUrls.filter(u=>u!==main)];

                        return (
                          <Grid item xs={12} sm={6} md={4} lg={3} key={pin.id}>
                            <Card onClick={()=>setExpandedPinId(pin.id)} sx={{ cursor:'pointer', ...headerStyles, p:0.5, mb:4, display:'flex', flexDirection:'column', flex:1 }}>
                              <Box sx={{ width:'100%', height:120, overflow:'hidden', borderRadius:"8px", mb:1 }}>
                                <ImageGridGallery imageUrls={imageUrls} onImageClick={i=>openLightbox(imageUrls.map(src=>({src})),i)} sx={{ width:'100%', height:'100%' }} />
                              </Box>
                              <Box display="flex" alignItems="center" gap={1} mt={1}>
                                <Avatar src={profile.avatar_url} sx={{ width:24, height:24 }} />
                                <MDTypography variant="body2" sx={{ display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', flexGrow:1, fontSize:'12px', lineHeight:1.2 }}>{pin.Information}</MDTypography>
                              </Box>
                              <MDTypography variant="caption" color="white" sx={{ display:'block', mt:1, ml:4 }}>{new Date(pin.created_at).toLocaleDateString()}</MDTypography>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                ))}
              </MDBox>
            ) : (
              <Box id="expanded-pin" mt={4}>
                <MDTypography onClick={()=>setExpandedPinId(null)} sx={{ color:'#F18F01', fontSize:'14px', mb:2, cursor:'pointer', textDecoration:'underline', textAlign:'right' }}>← Back to Grid View</MDTypography>
                {(() => {
                  const pin = pins.find(p=>p.id===expandedPinId);
                  if (!pin) return null;
                  const isFav = savedPins.some(p=>p.id===pin.id);
                  const isBeen = beenTherePins.some(p=>p.id===pin.id);
                  const isWant = wantToGoPins.some(p=>p.id===pin.id);
                  let imageUrls = [];
                  try {
                    const parsed = JSON.parse(pin.Images||'[]');
                    imageUrls = Array.isArray(parsed)? parsed.map(u=>u.trim()):[];
                  } catch {
                    imageUrls = (pin.Images||'').split(',').map(u=>u.trim());
                  }
                  const main = (pin['Main Image']||'').trim();
                  if (main) imageUrls = [main, ...imageUrls.filter(u=>u!==main)];

                  return (
                    <Card sx={{ ...headerStyles, p:3 }}>
                      <Box display="flex" alignItems="center" gap={2} mb={1}>
                        <Avatar src={profile.avatar_url} />
                        <Box>
                          <MDTypography variant="subtitle2">{profile.full_name||profile.Username}</MDTypography>
                          <MDTypography variant="caption" color="white">{new Date(pin.created_at).toLocaleDateString()}</MDTypography>
                        </Box>
                      </Box>
                      <MDTypography variant="h6">{pin.Name}</MDTypography>
                      <MDTypography variant="body2" sx={{ mb:2 }}>{pin.Information}</MDTypography>
                      <Box mb={2}>
                        <ImageGridGallery imageUrls={imageUrls} onImageClick={i=>openLightbox(imageUrls.map(src=>({src})),i)} />
                      </Box>
                      <Box display="flex" gap={2} flexWrap="wrap">
                        <PinActions
                          isSaved={isFav} savedCount={pin.saved_count||0} onSave={()=>handleSaveClick(pin)}
                          isBeenThere={isBeen} beenThereCount={pin.been_there||0} onBeenThere={()=>toggleBeenThere(pin)}
                          isWantToGo={isWant} wantToGoCount={pin.want_to_go||0} onWantToGo={()=>toggleWantToGo(pin)}
                        />
                      </Box>
                    </Card>
                  );
                })()}
              </Box>
            )}
          </MDBox>
        )
      ) : (
        <MDTypography>No pins yet.</MDTypography>
      )}
    </Grid>
  );
}
