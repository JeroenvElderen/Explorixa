import React, { useEffect, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton, Typography, Tooltip } from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { supabase } from '../SupabaseClient';
import ListDialog from './AddToList/AddToListDialog';
import useSupabaseUser from '../hooks/useSupabaseUser';

export default function PinInteractionPanel({ pin: initialPin, onUpdated, refreshKey }) {
  const user = useSupabaseUser();
  const userId = user?.id;

  const [pin, setPin] = useState(initialPin);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hasBeenThere, setHasBeenThere] = useState(false);
  const [hasWantToGo, setHasWantToGo] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [userListsContainingPin, setUserListsContainingPin] = useState([]);

  const realtimeChannelRef = useRef(null);
  const pendingRef = useRef({
    been_there: false,
    want_to_go: false,
    saved_count: false,
  });

  const guardUser = () => {
    if (!userId) {
      alert('You must be logged in.');
      return false;
    }
    return true;
  };

  // Helper RPC increment/decrement aggregate
  const adjustAggregate = async (field, delta) => {
    if (!pin?.id) return null;
    pendingRef.current[field] = true;
    try {
      const { data, error } = await supabase.rpc('increment_pin_counter', {
        p_id_bigint: Number(pin.id),
        field_name: field,
        delta,
      });
      if (error) throw error;
      const updated = Array.isArray(data) ? data[0] : data;
      setPin(prev => ({ ...prev, ...updated }));
      onUpdated?.({ ...pin, ...updated });
      return updated;
    } finally {
      setTimeout(() => {
        pendingRef.current[field] = false;
      }, 150);
    }
  };

  const refreshPerUserFlags = useCallback(
    async forcePin => {
      if (!forcePin?.id) return;
      if (!userId) {
        setHasBeenThere(false);
        setHasWantToGo(false);
        setIsSaved(false);
        setUserListsContainingPin([]);
        return;
      }
      try {
        const [beenRes, wantRes, listPinsRes] = await Promise.all([
          supabase
            .from('user_been_there')
            .select('*', { head: true, count: 'exact' })
            .eq('user_id', userId)
            .eq('pin_id', forcePin.id),
          supabase
            .from('user_want_to_go')
            .select('*', { head: true, count: 'exact' })
            .eq('user_id', userId)
            .eq('pin_id', forcePin.id),
          supabase.from('list_pins').select('list_id').eq('pin_id', forcePin.id),
        ]);

        setHasBeenThere(!beenRes.error && beenRes.count > 0);
        setHasWantToGo(!wantRes.error && wantRes.count > 0);

        if (listPinsRes.error) {
          setIsSaved(false);
          setUserListsContainingPin([]);
        } else {
          const listIds = (listPinsRes.data || []).map(r => r.list_id);
          if (listIds.length === 0) {
            setIsSaved(false);
            setUserListsContainingPin([]);
          } else {
            const { data: userLists, error: listsErr } = await supabase
              .from('lists')
              .select('id')
              .in('id', listIds)
              .eq('user_id', userId);
            if (listsErr) {
              setIsSaved(false);
              setUserListsContainingPin([]);
            } else {
              const owned = (userLists || []).map(l => l.id);
              setUserListsContainingPin(owned);
              setIsSaved(owned.length > 0);
            }
          }
        }
      } catch (e) {
        console.warn('refreshPerUserFlags failed', e);
        setHasBeenThere(false);
        setHasWantToGo(false);
        setIsSaved(false);
        setUserListsContainingPin([]);
      }
    },
    [userId]
  );

  // sync incoming pin prop
  useEffect(() => {
    setPin(initialPin);
  }, [initialPin]);

  // initial load: per-user flags
  useEffect(() => {
    if (!initialPin) return;
    refreshPerUserFlags(initialPin);
  }, [initialPin, userId, refreshKey]); // <-- refreshKey included

  // realtime subscription to pin aggregates (been_there, want_to_go, saved_count)
  useEffect(() => {
    if (!pin?.id) return;

    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
      realtimeChannelRef.current = null;
    }

    const channel = supabase
      .channel(`pin-updates-${pin.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pins',
          filter: `id=eq.${pin.id}`,
        },
        payload => {
          const updated = payload.new;
          setPin(prev => {
            const merged = { ...prev };
            if (!pendingRef.current.been_there && typeof updated.been_there !== 'undefined') {
              merged.been_there = updated.been_there;
            }
            if (!pendingRef.current.want_to_go && typeof updated.want_to_go !== 'undefined') {
              merged.want_to_go = updated.want_to_go;
            }
            if (!pendingRef.current.saved_count && typeof updated.saved_count !== 'undefined') {
              merged.saved_count = updated.saved_count;
            }
            onUpdated?.(merged);
            return merged;
          });
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;

    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
        realtimeChannelRef.current = null;
      }
    };
  }, [pin?.id, onUpdated]);

  // Toggle handlers (with stopPropagation!)
  const toggleBeenThere = async (e) => {
    e.stopPropagation();
    if (!guardUser() || !pin?.id) return;
    setLoading(true);
    const prevFlag = hasBeenThere;
    const prevCount = Number(pin.been_there) || 0;

    setHasBeenThere(!prevFlag);
    setPin(p => ({
      ...p,
      been_there: prevFlag ? Math.max(prevCount - 1, 0) : prevCount + 1,
    }));

    try {
      if (prevFlag) {
        await supabase
          .from('user_been_there')
          .delete()
          .eq('user_id', userId)
          .eq('pin_id', pin.id);
        await adjustAggregate('been_there', -1);
      } else {
        await supabase.from('user_been_there').insert({
          user_id: userId,
          pin_id: pin.id,
        });
        await adjustAggregate('been_there', 1);
      }
    } catch (e) {
      console.warn('toggleBeenThere error', e);
      await refreshPerUserFlags(pin);
      const { data: freshPin } = await supabase
        .from('pins')
        .select('been_there, want_to_go, saved_count')
        .eq('id', pin.id)
        .single();
      if (freshPin) setPin(prev => ({ ...prev, ...freshPin }));
    } finally {
      setLoading(false);
    }
  };

  const toggleWantToGo = async (e) => {
    e.stopPropagation();
    if (!guardUser() || !pin?.id) return;
    setLoading(true);
    const prevFlag = hasWantToGo;
    const prevCount = Number(pin.want_to_go) || 0;

    setHasWantToGo(!prevFlag);
    setPin(p => ({
      ...p,
      want_to_go: prevFlag ? Math.max(prevCount - 1, 0) : prevCount + 1,
    }));

    try {
      if (prevFlag) {
        await supabase
          .from('user_want_to_go')
          .delete()
          .eq('user_id', userId)
          .eq('pin_id', pin.id);
        await adjustAggregate('want_to_go', -1);
      } else {
        await supabase.from('user_want_to_go').insert({
          user_id: userId,
          pin_id: pin.id,
        });
        await adjustAggregate('want_to_go', 1);
      }
    } catch (e) {
      console.warn('toggleWantToGo error', e);
      await refreshPerUserFlags(pin);
      const { data: freshPin } = await supabase
        .from('pins')
        .select('been_there, want_to_go, saved_count')
        .eq('id', pin.id)
        .single();
      if (freshPin) setPin(prev => ({ ...prev, ...freshPin }));
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    if (!guardUser() || !pin?.id) return;
    setLoading(true);
    try {
      if (isSaved && userListsContainingPin.length) {
        await supabase
          .from('list_pins')
          .delete()
          .in('list_id', userListsContainingPin)
          .eq('pin_id', pin.id);
      } else {
        setDialogOpen(true);
        setLoading(false);
        return;
      }
      await refreshPerUserFlags(pin);
      const { data: freshPin } = await supabase
        .from('pins')
        .select('been_there, want_to_go, saved_count')
        .eq('id', pin.id)
        .single();
      if (freshPin) setPin(prev => ({ ...prev, ...freshPin }));
    } catch (e) {
      console.warn('favorite toggle failed', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAfterListSaved = async () => {
    await refreshPerUserFlags(pin);
    setDialogOpen(false);
  };

  // Derived counts (only from pins table)
  const resolvedBeenThereCount = Number(pin.been_there) || 0;
  const resolvedWantToGoCount = Number(pin.want_to_go) || 0;
  const resolvedSavedCount = Number(pin.saved_count) || 0;

  const initialized =
    typeof hasBeenThere === 'boolean' &&
    typeof hasWantToGo === 'boolean' &&
    typeof isSaved === 'boolean';

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={0.5}
      sx={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: 12,
        px: 1,
        py: 0.5,
        opacity: initialized ? 1 : 0.9,
        transition: 'opacity .2s ease',
        width: 'fit-content',
        maxWidth: '100%',
      }}
    >
      {/* Been There */}
      <Tooltip title="Been there">
        <Box
          textAlign="center"
          sx={{
            minWidth: 44,
            display: 'flex',
            alignItems: 'center',
            gap: 0.25,
          }}
        >
          <IconButton
            aria-label="been there"
            onClick={toggleBeenThere}
            disabled={loading}
            size="small"
            sx={{
              backgroundColor: hasBeenThere
                ? 'rgba(40,167,69,0.15)'
                : 'transparent',
              '&:hover': {
                backgroundColor: hasBeenThere
                  ? 'rgba(40,167,69,0.25)'
                  : 'rgba(40,167,69,0.08)',
              },
              transition: 'background-color .2s ease',
              p: 0.4,
            }}
          >
            {hasBeenThere ? (
              <FlagIcon fontSize="small" sx={{ color: 'green' }} />
            ) : (
              <OutlinedFlagIcon fontSize="small" sx={{ color: 'green' }} />
            )}
          </IconButton>
          <Typography variant="caption" display="block" sx={{ color: '#fff' }}>
            {resolvedBeenThereCount}
          </Typography>
        </Box>
      </Tooltip>

      {/* Want To Go */}
      <Tooltip title="Want to go">
        <Box
          textAlign="center"
          sx={{
            minWidth: 44,
            display: 'flex',
            alignItems: 'center',
            gap: 0.25,
          }}
        >
          <IconButton
            aria-label="want to go"
            onClick={toggleWantToGo}
            disabled={loading}
            size="small"
            sx={{
              backgroundColor: hasWantToGo
                ? 'rgba(255,215,0,0.15)'
                : 'transparent',
              '&:hover': {
                backgroundColor: hasWantToGo
                  ? 'rgba(255,215,0,0.25)'
                  : 'rgba(255,215,0,0.08)',
              },
              transition: 'background-color .2s ease',
              p: 0.4,
            }}
          >
            {hasWantToGo ? (
              <StarIcon fontSize="small" sx={{ color: 'gold' }} />
            ) : (
              <StarBorderIcon fontSize="small" sx={{ color: 'gold' }} />
            )}
          </IconButton>
          <Typography variant="caption" display="block" sx={{ color: '#fff' }}>
            {resolvedWantToGoCount}
          </Typography>
        </Box>
      </Tooltip>

      {/* Save / Favorite */}
      <Tooltip title="Save">
        <Box
          textAlign="center"
          sx={{
            minWidth: 44,
            display: 'flex',
            alignItems: 'center',
            gap: 0.25,
          }}
        >
          <IconButton
            aria-label="save"
            onClick={handleFavoriteClick}
            disabled={loading}
            size="small"
            sx={{
              backgroundColor: isSaved
                ? 'rgba(241,143,1,0.15)'
                : 'transparent',
              '&:hover': {
                backgroundColor: isSaved
                  ? 'rgba(241,143,1,0.25)'
                  : 'rgba(241,143,1,0.08)',
              },
              transition: 'background-color .2s ease',
              p: 0.4,
            }}
          >
            {isSaved ? (
              <FavoriteIcon fontSize="small" sx={{ color: 'error.main' }} />
            ) : (
              <FavoriteBorderIcon fontSize="small" sx={{ color: 'error.main' }} />
            )}
          </IconButton>
          <Typography variant="caption" display="block" sx={{ color: '#fff' }}>
            {resolvedSavedCount}
          </Typography>
        </Box>
      </Tooltip>

      <ListDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        pin={pin}
        onSaved={handleAfterListSaved}
      />
    </Box>
  );
}

PinInteractionPanel.propTypes = {
  pin: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    been_there: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    want_to_go: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    saved_count: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }).isRequired,
  onUpdated: PropTypes.func,
  refreshKey: PropTypes.number,
};

PinInteractionPanel.defaultProps = {
  onUpdated: () => {},
  refreshKey: 0,
};
