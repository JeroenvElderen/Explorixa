import React, { useEffect, useState, useRef } from 'react';
import PinCard from 'examples/Charts/PinCard';
import RowPinCard from 'examples/Charts/PinCard/RowPinCard';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import themeDark from 'assets/theme-dark';
import { Typography, Box, useMediaQuery } from '@mui/material';
import routes from 'routes';
import { useSavedPins } from '../components/SavedPinsContext';
import { supabase } from '../SupabaseClient';

// Recursively find route by country name or key (case-insensitive)
function findRouteByName(items, name) {
  const needle = name?.toString().toLowerCase().trim();
  if (!needle) return;
  for (const item of items) {
    const nm = item.name?.toString().toLowerCase().trim();
    const key = item.key?.toString().toLowerCase().trim();
    if (item.route && (nm === needle || key === needle)) return item.route;
    if (item.children) {
      const found = findRouteByName(item.children, name);
      if (found) return found;
    }
  }
}

export default function PopupComponent({ data, onClose }) {
  const { pins, save, remove } = useSavedPins();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Detect tap vs drag on backdrop
  const touchStartX = useRef(0);
  const handleBackdropTouchStart = e => { touchStartX.current = e.touches[0].clientX; };
  const handleBackdropTouchEnd = e => {
    const deltaX = Math.abs(e.changedTouches[0].clientX - touchStartX.current);
    if (deltaX < 5) onClose();
  };

  // Fetch all pins from Supabase
  const [supPins, setSupPins] = useState([]);
  const [loadingSup, setLoadingSup] = useState(true);
  useEffect(() => {
  let active = true;
  (async () => {
    const selectCols = 'id, "Name", "Main Image", created_at';
    console.log('selectCols →', selectCols);
    const { data: fetched, error } = await supabase
      .from('pins')
      .select(selectCols)
      .order('created_at', { ascending: false });

    if (!active) return;
    if (error) {
      console.error('Supabase error fetching pins:', error);
    } else {
        const shaped = fetched.map(p => ({
           id:       p.id.toString(),
          title:    p.Name,
          imageurl: p['Main Image'],
          date:     p.created_at,
        }));
        console.log('shaped supPins:', shaped);
        setSupPins(shaped);
    }
    setLoadingSup(false);
  })();
  return () => { active = false; };
}, []);




  if (!data) return null;

  // Prepare current pin object
  const pinId = data.id?.toString() ?? data.title?.toString() ?? '';
  const currentPin = {
    id: pinId,
    title: data.title.toString(),
    description: data.description?.toString() ?? '',
    imageurl: data.imageurl?.toString() ?? '',
    date: data.date
  };

  // Combined list for carousel on mobile
  const carouselPins = [
    currentPin,
    ...supPins.filter(p => p.id?.toString() !== pinId)
  ];

  // Helpers
  const formatTitle = pin => pin.title?.toString() ?? pin.id?.toString() ?? '';
  const isSaved = pins.some(p => p.id?.toString() === pinId);
  const formattedDate = data.date ? new Date(data.date).toISOString().slice(0, 10) : '';
  const countryName = data.countryName ?? data.title;
  const matchedRoute = findRouteByName(routes, countryName);
  const fallbackRoute = `/Destinations/World_destinations/${countryName.replace(/\s+/g, '_')}`;
  const countryPath = matchedRoute || fallbackRoute;
  const handleSave = e => {
    e.stopPropagation();
    isSaved ? remove({ id: pinId }) : save(currentPin);
  };

  return (
    <div
      onTouchStart={handleBackdropTouchStart}
      onTouchEnd={handleBackdropTouchEnd}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex', justifyContent: 'center',
        alignItems: isMobile ? 'flex-start' : 'center',
        paddingTop: isMobile ? '20px' : 0,
        zIndex: 9999
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '90%', maxWidth: '500px', display: 'flex', flexDirection: 'column' }}
      >
        <ThemeProvider theme={themeDark}>

          {isMobile ? (
            // Carousel only on mobile, inline with RowPinCards
            <Box
              sx={{
                width: '100%', display: 'flex', overflowX: 'auto',
                WebkitOverflowScrolling: 'touch', touchAction: 'pan-x',
                overscrollBehaviorX: 'contain', scrollSnapType: 'x mandatory',
                scrollBehavior: 'smooth', flexWrap: 'nowrap', mt: 2, pb: 1,
                '&::-webkit-scrollbar': { display: 'none' }, px: 1
              }}
            >
              {carouselPins.map(pin => {
                const safeTitle = formatTitle(pin);
                const route = findRouteByName(routes, safeTitle) ||
                  `/Destinations/World_destinations/${safeTitle.replace(/\s+/g, '_')}`;
                const pinDate = pin.date ? new Date(pin.date).toISOString().slice(0, 10) : '';
                const saved = pins.some(p => p.id?.toString() === pin.id?.toString());
                const onPinSave = e => {
                  e.stopPropagation();
                  saved
                    ? remove({ id: pin.id.toString() })
                    : save({
                        id: pin.id.toString(), title: safeTitle,
                        description: pin.description ?? '',
                        imageurl: pin.imageurl ?? '',
                        date: pin.date
                      });
                };

                return (
                  <Box key={pin.id} sx={{ flex: '0 0 90%', minWidth: '90%', scrollSnapAlign: 'start', mr: 2, '&:last-of-type': { mr: 0 } }}>
                    <RowPinCard
                      color="info"
                      title={safeTitle}
                      description={pin.description}
                      date={pinDate}
                      imageurl={pin.imageurl}
                      imagealt={safeTitle}
                      height="150px"
                      truncateDescription={true}
                      link={route}
                      linkLabel={`Go to ${safeTitle}`}
                      onLinkClick={onClose}
                      onSave={onPinSave}
                      isSaved={saved}
                    />
                  </Box>
                );
              })}
            </Box>
          ) : (
            // Desktop main single PinCard
            <Box sx={{ position: 'relative' }}>
              <PinCard
                color="info"
                title={
                  <Typography variant="h6" align="center" sx={{ mt: -1, mb: 1, fontWeight: 800, color: 'white' }}>
                    {data.title}
                  </Typography>
                }
                description={data.description}
                date={formattedDate}
                imageurl={data.imageurl}
                imagealt={data.title}
                height="300px"
                truncateDescription={false}
                link={countryPath}
                linkLabel={`Go to ${countryName}`}
                onLinkClick={onClose}
                onSave={handleSave}
                isSaved={isSaved}
              />
            </Box>
          )}

        </ThemeProvider>
      </div>
    </div>
  );
}
