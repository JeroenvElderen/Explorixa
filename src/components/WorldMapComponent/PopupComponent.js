// src/components/WorldMapComponent/PopupComponent.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import PinCard from 'examples/Charts/PinCard';
import RowPinCard from 'examples/Charts/PinCard/RowPinCard';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import themeDark from 'assets/theme-dark';
import { Typography, Box, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../SupabaseClient';
import PinInteractionPanel from 'components/PinInteractionPanel';

// Util: Sluggify
const sluggify = str => str?.toString().trim().replace(/\s+/g, '_');

export default function PopupComponent({ data, onClose }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const touchStartX = useRef(0);

  // State
  const [supPins, setSupPins] = useState([]);

  // Fetch all pins once for title→ID fallback
  useEffect(() => {
    let active = true;
    supabase
      .from('pins')
      .select('id, Name, description, imageurl, date')
      .then(({ data }) => {
        if (!active || !data) return;
        setSupPins(
          data.map(p => ({
            id: p.id?.toString(),
            title: p.Name,
            description: p.description,
            imageurl: p.imageurl,
            date: p.date,
          }))
        );
      })
      .catch(err => {
        console.error('Failed to load supPins', err);
      });
    return () => {
      active = false;
    };
  }, []);

  // Helper to find a numeric ID (or fallback by title)
  const getRealPinId = useCallback(
    pin => {
      if (pin.id && !isNaN(Number(pin.id))) return pin.id.toString();
      const match = supPins.find(
        sp => sp.title?.toLowerCase() === pin.title?.toLowerCase()
      );
      return match?.id?.toString() ?? null;
    },
    [supPins]
  );

  // Touch handlers
  const handleTouchStart = e => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = e => {
    if (Math.abs(e.changedTouches[0].clientX - touchStartX.current) < 5) {
      onClose();
    }
  };

  if (!data) return null;

  // Build currentPin and slugs
  const currentPin = {
    id: data.id?.toString(),
    title: data.title,
    description: data.description,
    imageurl: data.imageurl,
    date: data.date,
  };
  const realPinId = getRealPinId(currentPin);

  const rawCont = data.continentName || data.countryName || data.title;
  const rawCoun = data.countryName || data.title;
  const contSlug = sluggify(rawCont);
  const counSlug = sluggify(rawCoun);
  const pinSlug = sluggify(data.title);
  const pinPath = `/Destinations/${contSlug}/${counSlug}/${pinSlug}`;
  const formattedDate = data.date
    ? new Date(data.date).toISOString().slice(0, 10)
    : '';

  const allPins = [{ ...currentPin, id: realPinId }, ...supPins];
  const seen = new Set();
  const carouselPins = allPins.filter(p => {
    if (!p.id || seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  return (
    <div
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'fixed', top: 16, left: 0, width: '100vw',
        height: isMobile ? '500px' : '100vh',
        background: 'transparent', display: 'flex',
        justifyContent: 'center',
        alignItems: isMobile ? 'flex-start' : 'center',
        zIndex: 1300
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 500,
          margin: isMobile ? '0 0 10px' : '0 auto',
          display: 'flex', flexDirection: 'column',
          background: 'transparent', borderRadius: 16, boxShadow: 'none'
        }}
      >
        <ThemeProvider theme={themeDark}>
          {isMobile ? (
            <Box sx={{
              position: 'fixed', bottom: 130, left: '2.5vw', width: '95vw',
              display: 'flex', overflowX: 'auto', WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-x', overscrollBehaviorX: 'contain',
              scrollSnapType: 'x mandatory', scrollBehavior: 'smooth',
              flexWrap: 'nowrap', mt: 2, pb: 0,
              '&::-webkit-scrollbar': { display: 'none' }
            }}>
              {carouselPins.map(p => {
                const route = `/Destinations/${contSlug}/${counSlug}/${sluggify(p.title)}`;
                const pinDate = p.date ? new Date(p.date).toISOString().slice(0, 10) : '';
                return (
                  <Box key={p.id}
                    sx={{
                      flex: '0 0 100%', minWidth: '100%', scrollSnapAlign: 'start', mr: 2,
                      '&:last-of-type': { mr: 0 }
                    }}
                    onClick={() => {
                      onClose();
                      navigate(route, { state: { pin: p } });
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <RowPinCard
                      title={p.title}
                      description={p.description}
                      imageurl={p.imageurl}
                      imagealt={p.title}
                      truncateDescription
                      isExpanded={false}
                    />
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Box sx={{ position: 'relative' }}>
              <PinCard
                color="info"
                title={
                  <Typography variant="h6" align="center"
                    sx={{ mt: -1, mb: 1, fontWeight: 800, color: 'white' }}>
                    {data.title}
                  </Typography>
                }
                description={data.description}
                date={formattedDate}
                imageurl={data.imageurl}
                imagealt={data.title}
                height="300px"
                truncateDescription={false}
                link={pinPath}
                linkLabel={`Go to ${data.title}`}
                onLinkClick={() => {
                  onClose();
                  navigate(pinPath, { state: { pin: currentPin } });
                }}
              />
              
            </Box>
          )}
        </ThemeProvider>
      </div>
    </div>
  );
}
