import React, { useEffect, useState, useRef, useCallback } from 'react';
import PinCard from 'examples/Charts/PinCard';
import RowPinCard from 'examples/Charts/PinCard/RowPinCard';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import themeDark from 'assets/theme-dark';
import { Typography, Box, useMediaQuery, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../SupabaseClient';

// Util: Sluggify
const sluggify = str => str?.toString().trim().replace(/\s+/g, '_');

export default function PopupComponent({ data, onClose }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const cardRef = useRef(null);
  const touchStartRef = useRef({ x: 0, startedInside: false });

  const [supPins, setSupPins] = useState([]);

  // Fetch all pins once for title→ID fallback (and some fields for interaction panel)
  useEffect(() => {
    let active = true;
    supabase
      .from('pins')
      .select(`*`)
      .then(({ data }) => {
        if (!active || !data) return;
        setSupPins(
          data.map(p => ({
            id: p.id?.toString(),
            Name: p.Name,
            title: p.Name,
            description: p.description,
            imageurl: p.imageurl || p['Main Image'],
            date: p.date,
            Information: p.Information,
            been_there: p.been_there,
            want_to_go: p.want_to_go,
            saved_count: p.saved_count,
            created_at: p.created_at,
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
  const getRealPin = useCallback(
    pin => {
      if (pin.id && !isNaN(Number(pin.id))) {
        const matched = supPins.find(sp => sp.id === pin.id.toString());
        return matched || { ...pin, title: pin.title };
      }
      const match = supPins.find(
        sp => sp.title?.toLowerCase() === pin.title?.toLowerCase()
      );
      return match || pin;
    },
    [supPins]
  );

  // Only allow overlay to catch pointer events on desktop
  const overlayPointerEvents = isMobile ? 'none' : 'auto';

  const handleOverlayClick = e => {
    if (isMobile) return; // don't close on mobile, only via button
    if (cardRef.current && cardRef.current.contains(e.target)) return;
    onClose();
  };

  const handleTouchStart = e => {
    touchStartRef.current.x = e.touches[0].clientX;
    touchStartRef.current.startedInside =
      cardRef.current && cardRef.current.contains(e.target);
  };

  const handleTouchEnd = e => {
    if (!isMobile) return;
    const deltaX = Math.abs(e.changedTouches[0].clientX - touchStartRef.current.x);
    const endedInside =
      cardRef.current && cardRef.current.contains(e.changedTouches[0].target);
    if (!touchStartRef.current.startedInside && !endedInside && deltaX < 5) {
      // Don't close on mobile; handled by close button
    }
  };

  if (!data) return null;

  // Build currentPin and slugs
  const currentPinBase = {
    id: data.id?.toString(),
    title: data.title,
    description: data.description,
    imageurl: data.imageurl,
    date: data.date,
    Information: data.Information,
    been_there: data.been_there,
    want_to_go: data.want_to_go,
    saved_count: data.saved_count,
    'Main Image': data['Main Image'],
    created_at: data.created_at,
  };
  const currentPin = getRealPin(currentPinBase); // enrich if possible

  const rawCont = data.continentName || data.countryName || data.title;
  const rawCoun = data.countryName || data.title;
  const contSlug = sluggify(rawCont);
  const counSlug = sluggify(rawCoun);
  const pinSlug = sluggify(data.title);
  const pinPath = `/Destinations/${contSlug}/${counSlug}/${pinSlug}`;
  const formattedDate = data.date
    ? new Date(data.date).toISOString().slice(0, 10)
    : '';

  // dedupe carousel
  const allPins = [{ ...currentPin, id: currentPin.id }, ...supPins];
  const seen = new Set();
  const carouselPins = allPins.filter(p => {
    if (!p.id || seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  const handlePinUpdated = updated => {};

  return (
    <div
      onClick={handleOverlayClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'transparent',
        display: 'flex',
        justifyContent: 'center',
        alignItems: isMobile ? 'flex-start' : 'center',
        zIndex: 1300,
        pointerEvents: overlayPointerEvents, // <-- key: none on mobile, auto on desktop
      }}
    >
      <div
        ref={cardRef}
        style={{
          width: '100%',
          maxWidth: 500,
          margin: isMobile ? '0' : '0 auto',
          display: 'flex',
          flexDirection: 'column',
          background: 'transparent',
          borderRadius: 16,
          boxShadow: 'none',
          pointerEvents: 'auto', // Only the popup/cards catch interaction
        }}
      >
        <ThemeProvider theme={themeDark}>
          {isMobile ? (
            // MOBILE: Carousel fixed above navbar, map still interactive!
            <Box
              sx={{
                position: 'fixed',
                left: 0,
                right: 0,
                bottom: '44px', // Set to navbar height or adjust as needed!
                zIndex: 1400,
                width: '100vw',
                display: 'flex',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-x',
                overscrollBehaviorX: 'contain',
                scrollSnapType: 'x mandatory',
                scrollBehavior: 'smooth',
                flexWrap: 'nowrap',
                px: '2vw',
                background: 'transparent',
                '&::-webkit-scrollbar': { display: 'none' },
                pointerEvents: 'auto', // <--- this area catches swipes/taps!
              }}
            >
              {carouselPins.map(p => {
                const route = `/Destinations/${contSlug}/${counSlug}/${sluggify(
                  p.title || p.Name
                )}`;
                return (
                  <Box
                    key={p.id}
                    sx={{
                      flex: '0 0 600vw',
                      minWidth: '80vw',
                      maxWidth: '80vw',
                      height: 210, // match your RowPinCard's natural height
                      scrollSnapAlign: 'start',
                      mr: 2,
                      '&:last-of-type': { mr: 0 },
                      display: 'flex',
                      alignItems: 'stretch',
                    }}
                    onClick={() => {
                      onClose();
                      navigate(route, { state: { pin: p } });
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <RowPinCard
                      title={p.title || p.Name}
                      description={p.Information || p.description}
                      imageurl={p.imageurl}
                      imagealt={p.title || p.Name}
                      isExpanded={false}
                      pin={p}
                      onUpdated={handlePinUpdated}
                    />
                  </Box>
                );
              })}
            </Box>
          ) : (
            // DESKTOP: Centered PinCard, overlay closes on click-outside
            <Box sx={{ position: 'relative' }}>
              <PinCard
                color="info"
                pin={currentPin}
                title={
                  <Typography
                    variant="h6"
                    align="center"
                    sx={{
                      mt: -1,
                      mb: 1,
                      fontWeight: 800,
                      color: 'white',
                    }}
                  >
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
                onUpdated={handlePinUpdated}
              />
            </Box>
          )}
        </ThemeProvider>
      </div>
    </div>
  );
}
