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
  const [mobileToggles, setMobileToggles] = useState({});

  // Desktop toggles
  const [isBeenThere, setIsBeenThere] = useState(false);
  const [beenThereCount, setBeenThereCount] = useState(0);
  const [isWantToGo, setIsWantToGo] = useState(false);
  const [wantToGoCount, setWantToGoCount] = useState(0);
  const [isSavedLocal, setIsSavedLocal] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  // Fetch pins…
  useEffect(() => {
    let active = true;
    (async () => {
      const selectCols = 'id, "Name", "Main Image", created_at, "Information", been_there, want_to_go, saved_count';
      const { data: fetched } = await supabase
        .from('pins')
        .select(selectCols)
        .order('created_at', { ascending: false });
      if (!active || !fetched) return;
      setSupPins(fetched.map(p => ({
        id: p.id.toString(),
        title: p.Name,
        description: p.Information ?? "",
        imageurl: p['Main Image'],
        date: p.created_at,
        been_there: p.been_there || 0,
        want_to_go: p.want_to_go || 0,
        saved_count: p.saved_count || 0,
      })));
    })();
    return () => { active = false };
  }, []);

  // Build currentPin + path
  const pinTitle = data?.title?.toString() ?? "";
  const currentPin = {
    id: data?.id?.toString(),
    title: pinTitle,
    description: data?.description ?? "",
    imageurl: data?.imageurl ?? "",
    date: data?.date,
  };
  const realPinId = getRealPinId(currentPin, supPins);
  const allowSave = Boolean(realPinId);
  const rawCont = data?.continentName || data?.countryName || data?.title;
  const rawCoun = data?.countryName || data?.title;
  const contSlug = sluggify(rawCont);
  const counSlug = sluggify(rawCoun);
  const pinSlug = sluggify(data?.title);
  const pinPath = `/Destinations/World_destinations/${contSlug}/${counSlug}/${pinSlug}`;
  const formattedDate = data?.date ? new Date(data.date).toISOString().slice(0, 10) : '';

  // Carousel pins
  const allPins = [{ ...currentPin, id: realPinId }, ...supPins];
  const seen = new Set();
  const carouselPins = allPins.filter(p => {
    const id = p.id?.toString();
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  // Reset desktop counts
  useEffect(() => {
    const db = supPins.find(p => p.id === realPinId) || {};
    setBeenThereCount(db.been_there || 0);
    setWantToGoCount(db.want_to_go || 0);
    setSavedCount(db.saved_count || 0);
    setIsBeenThere(false);
    setIsWantToGo(false);
    setIsSavedLocal(false);
  }, [realPinId, supPins]);

  if (!data) return null;

  // Touch handlers…
  const handleTouchStart = e => { touchStartX.current = e.touches[0].clientX };
  const handleTouchEnd = e => {
    if (Math.abs(e.changedTouches[0].clientX - touchStartX.current) < 5) onClose();
  };

  // Desktop handlers…
  const handleToggleBeenThere = async e => {
    e.stopPropagation();
    const nxt = !isBeenThere;
    const cnt = nxt ? beenThereCount + 1 : Math.max(beenThereCount - 1, 0);
    setIsBeenThere(nxt); setBeenThereCount(cnt);
    await supabase.from('pins').update({ been_there: cnt }).eq('id', realPinId);
  };
  const handleToggleWantToGo = async e => {
    e.stopPropagation();
    const nxt = !isWantToGo;
    const cnt = nxt ? wantToGoCount + 1 : Math.max(wantToGoCount - 1, 0);
    setIsWantToGo(nxt); setWantToGoCount(cnt);
    await supabase.from('pins').update({ want_to_go: cnt }).eq('id', realPinId);
  };
  const handleSave = async e => {
    e.stopPropagation();
    if (!allowSave) return alert("This pin can’t be saved.");
    const nxt = !isSavedLocal;
    const cnt = nxt ? savedCount + 1 : Math.max(savedCount - 1, 0);
    setIsSavedLocal(nxt); setSavedCount(cnt);
    await supabase.from('pins').update({ saved_count: cnt }).eq('id', realPinId);
    if (nxt) save({ ...currentPin, id: realPinId, saved_count: cnt });
    else remove({ id: realPinId });
  };

  // Mobile handlers generator…
  const mkToggle = (p, key, col, countKey) => async e => {
    e.stopPropagation();
    const curr = mobileToggles[p.id]?.[key] ?? false;
    const currCnt = mobileToggles[p.id]?.[countKey] ?? p[col] ?? 0;
    const nxt = !curr;
    const nxtCount = nxt ? currCnt + 1 : Math.max(currCnt - 1, 0);
    setMobileToggles(m => ({
      ...m,
      [p.id]: { ...(m[p.id] || {}), [key]: nxt, [countKey]: nxtCount }
    }));
    await supabase.from('pins').update({ [col]: nxtCount }).eq('id', p.id);
  };
  const mkSave = p => async e => {
    e.stopPropagation();
    const saved = mobileToggles[p.id]?.isSaved ?? false;
    const currCnt = mobileToggles[p.id]?.savedCount ?? p.saved_count ?? 0;
    const nxtCnt = saved ? Math.max(currCnt - 1, 0) : currCnt + 1;
    setMobileToggles(m => ({
      ...m,
      [p.id]: { ...(m[p.id] || {}), isSaved: !saved, savedCount: nxtCnt }
    }));
    await supabase.from('pins').update({ saved_count: nxtCnt }).eq('id', p.id);
    if (!saved) save({ ...p, saved_count: nxtCnt });
    else remove({ id: p.id });
  };

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
        alignItems: isMobile ? 'flex-start' : 'center', zIndex: 9999
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        onTouchStart={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 500, margin: isMobile ? '0 0 10px' : '0 auto',
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
              flexWrap: 'nowrap', mt: 2, pb: 0, '&::-webkit-scrollbar': { display: 'none' }
            }}>
              {carouselPins.map(p => {
                const safeTitle = p.title;
                const route = `/Destinations/World_destinations/${contSlug}/${counSlug}/${sluggify(p.title)}`;
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
                      title={safeTitle}
                      description={p.description}
                      date={pinDate}
                      imageurl={p.imageurl}
                      imagealt={safeTitle}
                      height="150px"
                      truncateDescription
                      link={route}
                      linkLabel={`Go to ${safeTitle}`}
                      onLinkClick={() => {
                        onClose();
                        navigate(route, { state: { pin: p } });
                      }}
                      isSaved={mobileToggles[p.id]?.isSaved ?? false}
                      savedCount={mobileToggles[p.id]?.savedCount ?? p.saved_count ?? 0}
                      onSave={mkSave(p)}
                      isBeenThere={mobileToggles[p.id]?.isBeenThere ?? false}
                      beenThereCount={mobileToggles[p.id]?.beenThereCount ?? p.been_there ?? 0}
                      onBeenThere={mkToggle(p, 'isBeenThere', 'been_there', 'beenThereCount')}
                      isWantToGo={mobileToggles[p.id]?.isWantToGo ?? false}
                      wantToGoCount={mobileToggles[p.id]?.wantToGoCount ?? p.want_to_go ?? 0}
                      onWantToGo={mkToggle(p, 'isWantToGo', 'want_to_go', 'wantToGoCount')}
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
