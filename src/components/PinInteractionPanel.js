// src/components/PinInteractionPanel/PinInteractionPanel.jsx
import React, { useEffect, useState, useCallback } from 'react';
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

/**
 * Unified panel: been_there, want_to_go, save (with list dialog).
 * Reflects whether current user has toggled each and adjusts global counters.
 */
export default function PinInteractionPanel({ pin: initialPin, onUpdated }) {
  const user = useSupabaseUser();
  const [pin, setPin] = useState(initialPin);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hasBeenThere, setHasBeenThere] = useState(false);
  const [hasWantToGo, setHasWantToGo] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [userListsContainingPin, setUserListsContainingPin] = useState([]);

  const guardUser = () => {
    if (!user?.id) {
      alert('You must be logged in.');
      return false;
    }
    return true;
  };

  const refreshState = useCallback(
    async (forcePin = pin) => {
      if (!forcePin?.id) return;

      const { data: freshPin, error: pinErr } = await supabase
        .from('pins')
        .select('been_there, want_to_go, saved_count')
        .eq('id', forcePin.id)
        .single();

      const mergedPin =
        !pinErr && freshPin ? { ...forcePin, ...freshPin } : forcePin;
      setPin(mergedPin);
      onUpdated?.(mergedPin);

      if (!user?.id) {
        setHasBeenThere(false);
        setHasWantToGo(false);
        setIsSaved(false);
        setUserListsContainingPin([]);
        return;
      }

      const pinId = forcePin.id;

      try {
        const { count: beenCount, error: beenErr } = await supabase
          .from('user_been_there')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('pin_id', pinId);
        if (beenErr) throw beenErr;
        setHasBeenThere(beenCount > 0);
      } catch {
        setHasBeenThere(false);
      }

      try {
        const { count: wantCount, error: wantErr } = await supabase
          .from('user_want_to_go')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('pin_id', pinId);
        if (wantErr) throw wantErr;
        setHasWantToGo(wantCount > 0);
      } catch {
        setHasWantToGo(false);
      }

      try {
        const { data: listPins, error: lpErr } = await supabase
          .from('list_pins')
          .select('list_id')
          .eq('pin_id', pinId);
        if (lpErr) throw lpErr;
        const listIds = (listPins || []).map(r => r.list_id);
        if (listIds.length === 0) {
          setIsSaved(false);
          setUserListsContainingPin([]);
        } else {
          const { data: userLists, error: listsErr } = await supabase
            .from('lists')
            .select('id')
            .in('id', listIds)
            .eq('user_id', user.id);
          if (listsErr) throw listsErr;
          const owned = (userLists || []).map(l => l.id);
          setUserListsContainingPin(owned);
          setIsSaved(owned.length > 0);
        }
      } catch {
        setIsSaved(false);
        setUserListsContainingPin([]);
      }
    },
    [onUpdated, user, pin]
  );

  useEffect(() => {
    setPin(initialPin);
  }, [initialPin]);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  const safeUpsert = async (table, body) => {
    const res = await supabase.from(table).insert(body);
    if (res.error) {
      alert(`Failed to save to ${table}: ${res.error.message}`);
      throw res.error;
    }
    return res.data;
  };

  const safeDelete = async (table, conditions) => {
    let query = supabase.from(table).delete();
    conditions.forEach(({ column, operator = 'eq', value }) => {
      if (operator === 'eq') query = query.eq(column, value);
      else if (operator === 'in') query = query.in(column, value);
    });
    const res = await query;
    if (res.error) {
      alert(`Failed to delete from ${table}: ${res.error.message}`);
      throw res.error;
    }
    return res.data;
  };

  const mutateGlobalCount = async (field, delta) => {
    if (!pin?.id) return null;
    // RPC only; +1 or -1 atomic
    const { data, error } = await supabase.rpc('increment_pin_counter', {
      p_id_bigint: Number(pin.id),
      field_name: field,
      delta,
    });
    if (error) {
      alert(`Counter update failed: ${error.message}`);
      return null;
    }
    const updated = Array.isArray(data) ? data[0] : data;
    setPin(u => ({ ...u, ...updated }));
    onUpdated?.(updated);
    return updated;
  };

  const toggleBeenThere = async () => {
    if (!guardUser()) return;
    setLoading(true);
    try {
      if (hasBeenThere) {
        await safeDelete('user_been_there', [
          { column: 'user_id', value: user.id },
          { column: 'pin_id', value: pin.id },
        ]);
        await mutateGlobalCount('been_there', -1);
      } else {
        await safeUpsert('user_been_there', {
          user_id: user.id,
          pin_id: pin.id,
        });
        await mutateGlobalCount('been_there', 1);
      }
      setHasBeenThere(b => !b);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleWantToGo = async () => {
    if (!guardUser()) return;
    setLoading(true);
    try {
      if (hasWantToGo) {
        await safeDelete('user_want_to_go', [
          { column: 'user_id', value: user.id },
          { column: 'pin_id', value: pin.id },
        ]);
        await mutateGlobalCount('want_to_go', -1);
      } else {
        await safeUpsert('user_want_to_go', {
          user_id: user.id,
          pin_id: pin.id,
        });
        await mutateGlobalCount('want_to_go', 1);
      }
      setHasWantToGo(w => !w);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteClick = async () => {
    if (!guardUser()) return;
    setLoading(true);
    try {
      if (isSaved && userListsContainingPin.length) {
        await supabase
          .from('list_pins')
          .delete()
          .in('list_id', userListsContainingPin)
          .eq('pin_id', pin.id);
        await mutateGlobalCount('saved_count', -1);
        setIsSaved(false);
      } else if (!isSaved) {
        setDialogOpen(true);
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
      if (!dialogOpen) await refreshState();
    }
  };

  const handleAfterListSaved = async () => {
    await refreshState();
    setDialogOpen(false);
  };

  const initialized =
    typeof hasBeenThere === 'boolean' &&
    typeof hasWantToGo === 'boolean' &&
    typeof isSaved === 'boolean';

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={2}
      sx={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: 12,
        px: 1.5,
        py: 4 / 8, // reduced vertical padding
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
            minWidth: 50,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
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
              p: 0.5,
            }}
          >
            {hasBeenThere ? (
              <FlagIcon fontSize="small" sx={{ color: 'green' }} />
            ) : (
              <OutlinedFlagIcon fontSize="small" sx={{ color: 'green' }} />
            )}
          </IconButton>
          <Typography variant="caption" display="block" sx={{ color: '#fff' }}>
            {pin.been_there || 0}
          </Typography>
        </Box>
      </Tooltip>

      {/* Want To Go */}
      <Tooltip title="Want to go">
        <Box
          textAlign="center"
          sx={{
            minWidth: 50,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
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
              p: 0.5,
            }}
          >
            {hasWantToGo ? (
              <StarIcon fontSize="small" sx={{ color: 'gold' }} />
            ) : (
              <StarBorderIcon fontSize="small" sx={{ color: 'gold' }} />
            )}
          </IconButton>
          <Typography variant="caption" display="block" sx={{ color: '#fff' }}>
            {pin.want_to_go || 0}
          </Typography>
        </Box>
      </Tooltip>

      {/* Save / Favorite */}
      <Tooltip title="Save">
        <Box
          textAlign="center"
          sx={{
            minWidth: 50,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
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
              p: 0.5,
            }}
          >
            {isSaved ? (
              <FavoriteIcon fontSize="small" sx={{ color: 'error.main' }} />
            ) : (
              <FavoriteBorderIcon
                fontSize="small"
                sx={{ color: 'error.main' }}
              />
            )}
          </IconButton>
          <Typography variant="caption" display="block" sx={{ color: '#fff' }}>
            {pin.saved_count || 0}
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
};

PinInteractionPanel.defaultProps = {
  onUpdated: () => {},
};
