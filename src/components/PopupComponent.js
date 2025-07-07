import React, { useEffect, useState, useRef } from 'react';
import PinCard from 'examples/Charts/PinCard';
import RowPinCard from 'examples/Charts/PinCard/RowPinCard';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import themeDark from 'assets/theme-dark';
import { Typography, Box, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSavedPins } from '../components/SavedPinsContext';
import { supabase } from '../SupabaseClient';

// Util: Sluggify
const sluggify = str => str?.toString().trim().replace(/\s+/g, '_');

function getRealPinId(pin, supPins) {
  if (pin.id && !isNaN(Number(pin.id))) return pin.id.toString();
  const match = supPins.find(
    sp => sp.title?.toLowerCase() === pin.title?.toLowerCase()
  );
  return match?.id?.toString() ?? null;
}

export default function PopupComponent({ data, onClose }) {
  const navigate = useNavigate();
  const { pins, save, remove } = useSavedPins();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const touchStartX = useRef(0);
  const [supPins, setSupPins] = useState([]);
  // Carousel toggle state (by pin id)
  const [mobileToggles, setMobileToggles] = useState({});
  const updateMobileToggle = (pinId, updates) => {
    setMobileToggles(prev => ({
      ...prev,
      [pinId]: { ...(prev[pinId] || {}), ...updates }
    }));
  };

  // Desktop toggles
  const [isBeenThere, setIsBeenThere] = useState(false);
  const [beenThereCount, setBeenThereCount] = useState(0);
  const [isWantToGo, setIsWantToGo] = useState(false);
  const [wantToGoCount, setWantToGoCount] = useState(0);
  const [isSavedLocal, setIsSavedLocal] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  // Fetch pins with all counts
  useEffect(() => {
    let active = true;
    (async () => {
      const selectCols = 'id, "Name", "Main Image", created_at, "Information", been_there, want_to_go, saved_count';
      const { data: fetched, error } = await supabase
        .from('pins')
        .select(selectCols)
        .order('created_at', { ascending: false });
      if (!active) return;
      if (!error && Array.isArray(fetched)) {
        const shaped = fetched.map(p => ({
          id: p.id.toString(),
          description: p.Information ?? "",
          title: p.Name,
          imageurl: p['Main Image'],
          date: p.created_at,
          been_there: p.been_there || 0,
          want_to_go: p.want_to_go || 0,
          saved_count: p.saved_count || 0,
        }));
        setSupPins(shaped);
      }
    })();
    return () => { active = false; };
  }, []);

  // Build pin info and look up DB id
  const pinTitle = data?.title?.toString() ?? "";
  const currentPin = {
    id: data?.id?.toString(),
    title: pinTitle,
    description: data?.description?.toString() ?? "",
    imageurl: data?.imageurl?.toString() ?? "",
    date: data?.date
  };
  const realPinId = getRealPinId(currentPin, supPins);

  // Defensive: Only allow saving if DB id exists
  const allowSave = realPinId && !isNaN(Number(realPinId));

  // Compose carousel pins (deduped)
  const normalizeId = id => id != null ? id.toString().trim() : "";
  const pinsArray = [
    { ...currentPin, id: realPinId }, // always use correct DB id
    ...supPins
  ];
  const seenIds = new Set();
  const carouselPins = pinsArray.filter(pin => {
    const id = normalizeId(pin.id);
    if (!id || seenIds.has(id)) return false;
    seenIds.add(id);
    return true;
  });

  // Carousel helpers
  const formatTitle = pin => pin.title?.toString() ?? pin.id?.toString() ?? '';
  const formattedDate = data?.date ? new Date(data.date).toISOString().slice(0, 10) : '';
  const rawContinent = data?.continentName || data?.countryName || data?.title;
  const rawCountry = data?.countryName || data?.title;
  const rawPinTitle = data?.title;
  const continentSlug = sluggify(rawContinent);
  const countrySlug = sluggify(rawCountry);
  const pinSlug = sluggify(rawPinTitle);
  const pinPath = `/Destinations/World_destinations/${continentSlug}/${countrySlug}/${pinSlug}`;

  // Set desktop counts/toggles from supPins (or reset on pin change)
  useEffect(() => {
    const pinObj = supPins.find(p => p.id?.toString() === realPinId) || {};
    setBeenThereCount(Number(pinObj.been_there) || 0);
    setWantToGoCount(Number(pinObj.want_to_go) || 0);
    setSavedCount(Number(pinObj.saved_count) || 0);
    setIsBeenThere(false);
    setIsWantToGo(false);
    setIsSavedLocal(false);
  }, [realPinId, supPins]);

  // --- Early return: must come AFTER all hooks ---
  if (!data) return null;

  // --- Touch backdrop handlers ---
  const handleBackdropTouchStart = e => { touchStartX.current = e.touches[0].clientX; };
  const handleBackdropTouchEnd = e => {
    const deltaX = Math.abs(e.changedTouches[0].clientX - touchStartX.current);
    if (deltaX < 5) onClose();
  };

  // --- Desktop handlers ---
  const handleToggleBeenThere = async (e) => {
    e.stopPropagation();
    const newState = !isBeenThere;
    const newCount = newState ? beenThereCount + 1 : Math.max(beenThereCount - 1, 0);
    setIsBeenThere(newState);
    setBeenThereCount(newCount);
    await supabase.from("pins").update({ been_there: newCount }).eq("id", realPinId);
  };
  const handleToggleWantToGo = async (e) => {
    e.stopPropagation();
    const newState = !isWantToGo;
    const newCount = newState ? wantToGoCount + 1 : Math.max(wantToGoCount - 1, 0);
    setIsWantToGo(newState);
    setWantToGoCount(newCount);
    await supabase.from("pins").update({ want_to_go: newCount }).eq("id", realPinId);
  };
  const handleSave = async (e) => {
    e.stopPropagation();
    if (!allowSave) {
      alert("Sorry, this pin is not a real database pin and can't be saved.");
      return;
    }
    const newState = !isSavedLocal;
    const newCount = newState ? savedCount + 1 : Math.max(savedCount - 1, 0);
    setIsSavedLocal(newState);
    setSavedCount(newCount);
    await supabase.from("pins").update({ saved_count: newCount }).eq("id", realPinId);
    if (newState) {
      save({ ...currentPin, id: realPinId, saved_count: newCount });
    } else {
      remove({ id: realPinId });
    }
  };

  // --- MOBILE carousel handlers ---
  const makeMobileToggleHandler = (pin, key, dbCol, countKey) => async (e) => {
    e.stopPropagation();
    const pinId = pin.id;
    const curr = mobileToggles[pinId]?.[key] ?? false;
    const currCount = mobileToggles[pinId]?.[countKey] ?? pin[dbCol] ?? 0;
    const newVal = !curr;
    const newCount = newVal ? currCount + 1 : Math.max(currCount - 1, 0);
    updateMobileToggle(pinId, { [key]: newVal, [countKey]: newCount });
    await supabase.from("pins").update({ [dbCol]: newCount }).eq("id", pinId);
  };
  const makeMobileSaveHandler = (pin) => async (e) => {
    e.stopPropagation();
    const pinId = pin.id;
    const isSaved = mobileToggles[pinId]?.isSaved ?? false;
    const currCount = mobileToggles[pinId]?.savedCount ?? pin.saved_count ?? 0;
    const newVal = !isSaved;
    const newCount = newVal ? currCount + 1 : Math.max(currCount - 1, 0);
    updateMobileToggle(pinId, { isSaved: newVal, savedCount: newCount });
    await supabase.from("pins").update({ saved_count: newCount }).eq("id", pinId);
    if (newVal) save({ ...pin, saved_count: newCount });
    else remove({ id: pinId });
  };

  return (
    <div
      onClick={onClose}
      onTouchStart={handleBackdropTouchStart}
      onTouchEnd={handleBackdropTouchEnd}
      style={{
        position: 'fixed',
        top: 16,
        left: 0,
        width: '100vw',
        height: isMobile ? '500px' : '100vh',
        backgroundColor: 'transparent',
        display: 'flex',
        justifyContent: 'center',
        alignItems: isMobile ? 'flex-start' : 'center',
        zIndex: 9999,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        onTouchStart={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 500,
          margin: isMobile ? '0 0 10px 0' : '0 auto',
          display: 'flex',
          flexDirection: 'column',
          background: 'transparent',
          borderRadius: 16,
          boxShadow: 'none',
        }}
      >
        <ThemeProvider theme={themeDark}>
          {isMobile ? (
            <Box
              sx={{
                position: 'fixed',
                bottom: 130,
                left: '2.5vw',
                width: '95vw',
                display: 'flex',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-x',
                overscrollBehaviorX: 'contain',
                scrollSnapType: 'x mandatory',
                scrollBehavior: 'smooth',
                flexWrap: 'nowrap',
                mt: 2,
                pb: 0,
                '&::-webkit-scrollbar': { display: 'none' },
                px: 0
              }}
            >
              {carouselPins.map(pin => {
                const safeTitle = formatTitle(pin);
                const route = `/Destinations/World_destinations/${continentSlug}/${countrySlug}/${sluggify(pin.title)}`;
                const pinDate = pin.date ? new Date(pin.date).toISOString().slice(0, 10) : '';
                const pinId = pin.id;
                return (
                  <Box
                    key={pin.id}
                    sx={{
                      flex: '0 0 100%',
                      minWidth: '100%',
                      scrollSnapAlign: 'start',
                      mr: 2,
                      '&:last-of-type': { mr: 0 },
                      
                    }}
                    onClick={() => {
                        onClose();
                        navigate(route);
                      }}
                      style={{cursor: 'pointer'}}
                  >
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
                      onLinkClick={() => {
                        onClose();
                        navigate(route);
                      }}
                      // Pass counts/toggles/handlers:
                      isSaved={mobileToggles[pinId]?.isSaved ?? false}
                      savedCount={mobileToggles[pinId]?.savedCount ?? pin.saved_count ?? 0}
                      onSave={makeMobileSaveHandler(pin)}
                      isBeenThere={mobileToggles[pinId]?.isBeenThere ?? false}
                      beenThereCount={mobileToggles[pinId]?.beenThereCount ?? pin.been_there ?? 0}
                      onBeenThere={makeMobileToggleHandler(pin, "isBeenThere", "been_there", "beenThereCount")}
                      isWantToGo={mobileToggles[pinId]?.isWantToGo ?? false}
                      wantToGoCount={mobileToggles[pinId]?.wantToGoCount ?? pin.want_to_go ?? 0}
                      onWantToGo={makeMobileToggleHandler(pin, "isWantToGo", "want_to_go", "wantToGoCount")}
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
                link={pinPath}
                linkLabel={`Go to ${data.title}`}
                onLinkClick={() => {
                  onClose();
                  navigate(pinPath);
                }}
                // Pass all counts/toggles/handlers
                isSaved={isSavedLocal}
                savedCount={savedCount}
                onSave={handleSave}
                isBeenThere={isBeenThere}
                onBeenThere={handleToggleBeenThere}
                beenThereCount={beenThereCount}
                isWantToGo={isWantToGo}
                onWantToGo={handleToggleWantToGo}
                wantToGoCount={wantToGoCount}
              />
            </Box>
          )}
        </ThemeProvider>
      </div>
    </div>
  );
}
