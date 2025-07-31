// src/components/WorldMapComponent/PopupComponent.jsx
import React, { useEffect, useState, useRef } from 'react';
import PinCard from 'examples/Charts/PinCard';
import RowPinCard from 'examples/Charts/PinCard/RowPinCard';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import themeDark from 'assets/theme-dark';
import { Typography, Box, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSavedPins } from '../../components/SavedPinsContext';
import { supabase } from '../../SupabaseClient';
import ListDialog from '../AddToList/AddToListDialog';

// Util: Sluggify
const sluggify = str => str?.toString().trim().replace(/\s+/g, '_');

export default function PopupComponent({ data, onClose }) {
  const navigate = useNavigate();
    const {
    pins,            // favorites (unused here)
    save, remove,
    beenTherePins,
    saveBeenThere,
    removeBeenThere,
    wantToGoPins,
    saveWantToGo,
    removeWantToGo,
  } = useSavedPins();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const touchStartX = useRef(0);

  // State for all pins (fallback), toggles, counts
  const [supPins, setSupPins] = useState([]);
  const [mobileToggles, setMobileToggles] = useState({});
  const [isBeenThere, setIsBeenThere] = useState(false);
  const [beenThereCount, setBeenThereCount] = useState(0);
  const [isWantToGo, setIsWantToGo] = useState(false);
  const [wantToGoCount, setWantToGoCount] = useState(0);
  const [isSavedLocal, setIsSavedLocal] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  // Dialog state
  const [listDialogOpen, setListDialogOpen] = useState(false);
  const [dialogPin, setDialogPin] = useState(null);

  // Fetch all pins once for title→ID fallback
  useEffect(() => {
    let active = true;
    supabase
      .from('pins')
      .select('id, Name, been_there, want_to_go, saved_count')
      .then(({ data }) => {
        if (!active || !data) return;
        setSupPins(data.map(p => ({
          id: p.id.toString(),
          title: p.Name,
          been_there: p.been_there,
          want_to_go: p.want_to_go,
          saved_count: p.saved_count,
        })));
      });
    return () => { active = false; };
  }, []);

  // Helper to find a numeric ID (or fallback by title)
  const getRealPinId = pin => {
    if (pin.id && !isNaN(Number(pin.id))) return pin.id.toString();
    const match = supPins.find(
      sp => sp.title?.toLowerCase() === pin.title?.toLowerCase()
    );
    return match?.id?.toString() ?? null;
  };

  // Reset desktop counts whenever data or supPins change
  useEffect(() => {
    if (!data) return;
    const currentPin = {
      id: data.id?.toString(),
      title: data.title,
    };
    const realId = getRealPinId(currentPin);
    const db = supPins.find(p => p.id === realId) || {};
    setBeenThereCount(db.been_there || 0);
    setWantToGoCount(db.want_to_go || 0);
    setSavedCount(db.saved_count || 0);
    setIsBeenThere(beenTherePins.some(p => p.id.toString() === realId));
    setIsWantToGo(wantToGoPins.some(p => p.id.toString() === realId));
    setIsSavedLocal(pins.some(p => p.id.toString() === realId));
  }, [data, supPins]);

  // Touch handlers for mobile closing
  const handleTouchStart = e => { touchStartX.current = e.touches[0].clientX };
  const handleTouchEnd = e => {
    if (Math.abs(e.changedTouches[0].clientX - touchStartX.current) < 5) {
      onClose();
    }
  };

  // Desktop toggles
  const handleToggleBeenThere = async e => {
    e.stopPropagation();
    const nxt = !isBeenThere;
    const cnt = nxt ? beenThereCount + 1 : Math.max(beenThereCount - 1, 0);
    setIsBeenThere(nxt);
    setBeenThereCount(cnt);
    const realId = getRealPinId({ id: data.id?.toString(), title: data.title });
    await supabase.from('pins').update({ been_there: cnt }).eq('id', realId);
        if (nxt) saveBeenThere({ id: realId, title: data.title });
    else    removeBeenThere({ id: realId });
  };
  const handleToggleWantToGo = async e => {
    e.stopPropagation();
    const nxt = !isWantToGo;
    const cnt = nxt ? wantToGoCount + 1 : Math.max(wantToGoCount - 1, 0);
    setIsWantToGo(nxt);
    setWantToGoCount(cnt);
    const realId = getRealPinId({ id: data.id?.toString(), title: data.title });
    await supabase.from('pins').update({ want_to_go: cnt }).eq('id', realId);
    if (nxt) saveWantToGo({ id: realId, title: data.title });
    else    removeWantToGo({ id: realId });
  };

  // Mobile toggle generator (been there, want to go)
  const mkToggle = (p, key, col, countKey) => async e => {
    e.stopPropagation();
    const curr = mobileToggles[p.id]?.[key] ?? false;
    const currCnt = mobileToggles[p.id]?.[countKey] ?? p[col] ?? 0;
    const nxt = !curr;
    const nxtCount = nxt ? currCnt + 1 : Math.max(currCnt - 1, 0);
    setMobileToggles(m => ({
      ...m,
      [p.id]: { ...(m[p.id]||{}), [key]: nxt, [countKey]: nxtCount }
    }));
    await supabase.from('pins').update({ [col]: nxtCount }).eq('id', p.id);
  };

  // Mobile save generator
  const mkSave = p => async e => {
    e.stopPropagation();
    const saved = mobileToggles[p.id]?.isSaved ?? false;
    const currCnt = mobileToggles[p.id]?.savedCount ?? p.saved_count ?? 0;
    const nxtCnt = saved ? Math.max(currCnt - 1, 0) : currCnt + 1;
    setMobileToggles(m => ({
      ...m,
      [p.id]: { ...(m[p.id]||{}), isSaved: !saved, savedCount: nxtCnt }
    }));
    await supabase.from('pins').update({ saved_count: nxtCnt }).eq('id', p.id);
    if (!saved) save({ ...p, saved_count: nxtCnt });
    else remove({ id: p.id });
  };

  // Open dialog only when we have a valid numeric ID
  const openListDialog = pinObj => e => {
    e.stopPropagation();
    const idStr = getRealPinId(pinObj);
    if (!idStr) return alert("This pin can’t be saved (no ID).");
    const idNum = Number(idStr);
    if (Number.isNaN(idNum)) return alert("Invalid pin ID.");
    const initialSaved = pinObj.saved_count ?? savedCount;
    setDialogPin({ ...pinObj, id: idNum, saved_count: initialSaved });
    setListDialogOpen(true);
  };

  // If there's no data to show, bail render (hooks are already wired)
  if (!data) return null;

  // Build currentPin and path slugs
  const currentPin = {
    id: data.id?.toString(),
    title: data.title,
    description: data.description,
    imageurl: data.imageurl,
    date: data.date,
  };
  const realPinId = getRealPinId(currentPin);
  const allowSave = Boolean(realPinId);

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
                      color="info"
                      title={p.title}
                      description={p.description}
                      date={pinDate}
                      imageurl={p.imageurl}
                      imagealt={p.title}
                      height="150px"
                      truncateDescription
                      link={route}
                      linkLabel={`Go to ${p.title}`}
                      onLinkClick={() => {
                        onClose();
                        navigate(route, { state: { pin: p } });
                      }}
                      onSave={openListDialog(p)}
                      onBeenThere={mkToggle(p, 'isBeenThere', 'been_there', 'beenThereCount')}
                      onWantToGo={mkToggle(p, 'isWantToGo', 'want_to_go', 'wantToGoCount')}
                      isSaved={mobileToggles[p.id]?.isSaved || false}
                      savedCount={mobileToggles[p.id]?.savedCount ?? p.saved_count}
                      isBeenThere={mobileToggles[p.id]?.isBeenThere || false}
                      beenThereCount={mobileToggles[p.id]?.beenThereCount ?? p.been_there}
                      isWantToGo={mobileToggles[p.id]?.isWantToGo || false}
                      wantToGoCount={mobileToggles[p.id]?.wantToGoCount ?? p.want_to_go}
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
                onBeenThere={handleToggleBeenThere}
                onWantToGo={handleToggleWantToGo}
                    isSaved={isSavedLocal}
      savedCount={savedCount}
      onSave={e => {
        e.stopPropagation();
        if (isSavedLocal) {
          // User clicked to unsave
          remove({ ...currentPin, id: realPinId });
          setIsSavedLocal(false);
          setSavedCount(c => Math.max(c - 1, 0));
          // also persist decrement on the pins table
          supabase
            .from('pins')
            .update({ saved_count: savedCount - 1 })
            .eq('id', realPinId)
            .catch(console.error);
        } else {
          // Open dialog to save
          openListDialog(currentPin)(e);
        }
      }}
                isBeenThere={isBeenThere}
                beenThereCount={beenThereCount}
                isWantToGo={isWantToGo}
                wantToGoCount={wantToGoCount}
              />
            </Box>
          )}

          <ListDialog
            open={listDialogOpen}
            onClose={() => {
              setListDialogOpen(false);
              setDialogPin(null);
            }}
            pin={dialogPin}
            onSaved={() => {
              setIsSavedLocal(true);
              setSavedCount(c => c + 1);
              save(dialogPin);
            }}
          />
        </ThemeProvider>
      </div>
    </div>
  );
}
