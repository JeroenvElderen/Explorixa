import React from 'react';
import { Menu, MenuItem } from '@mui/material';
import { CURRENCY_OPTIONS } from './constants';
import { useTheme } from '@mui/material/styles';

export default function CurrencySelector({ anchorEl, currency, onSelect, onClose }) {
  const ITEM_HEIGHT = 48;
  const VISIBLE = 5;
  const menuWidth = anchorEl?.clientWidth ?? 200;

  const theme = useTheme();

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      // ↑ grow *up* instead of down
      anchorOrigin={{ vertical: 'top',    horizontal: 'left' }}
      transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      disableAutoFocusItem
  MenuListProps={{
    autoFocus: false,
    sx: {
      p: 0,
      maxHeight: ITEM_HEIGHT * VISIBLE, // cap at 5 items
      overflowY: 'auto',                // ← restores scrolling
      bgcolor: 'transparent',
    },
  }} 

  PaperProps={{
    elevation: 0,
    sx: {
      mt: '-8px',  // ← original vertical nudge
      // glass‑morphic gradient
      backdropFilter: 'blur(20px)',
      bgcolor: 'transparent !important', 
      background: 'none !important',
      backgroundImage:
        'linear-gradient(145deg, rgba(241,143,1,0.1) 0%, rgba(241,143,1,0) 100%) !important',

      // border + shadows + new radius
      border: '1px solid rgba(243,143,1,0.6)',
      boxShadow:
        'inset 4px 4px 10px rgba(241,143,1,0.4), inset -4px -4px 10px rgba(241,143,1,0.1), 0 6px 15px rgba(241,143,1,0.3)',
      borderRadius: '6px 6px 12px 12px',

      // fix dimensions
      width: menuWidth,
      maxHeight: ITEM_HEIGHT * VISIBLE,
      overflow: 'hidden',

      [theme.breakpoints.down('sm')]: {
        width: 'calc(100vw - 30px) !important',
        maxWidth: 'calc(100vw - 30px) !important',
        height: 'calc(100vh - 30px) !important',
      },
      [theme.breakpoints.up('sm')]: {
        width: 400,
        maxWidth: '359px',
      },
    },
  }}

  sx={{
    '& .MuiMenuItem-root.Mui-focusVisible': {
      backgroundColor: 'rgba(241,143,1,0.1)',
      outline: 'none',
    },
    '& .MuiMenuItem-root': {
      color: 'white',
      '&.Mui-selected, &:hover': {
        backgroundColor: 'rgba(241,143,1,0.2)',
      },
    },
  }}>
      {CURRENCY_OPTIONS.map(opt => (
        <MenuItem
          key={opt.code}
          disableRipple
          selected={currency === opt.code}
          onClick={() => { onSelect(opt.code); onClose(); }}
          sx={{ height: ITEM_HEIGHT }}
        >
          {opt.code} — {opt.name}
        </MenuItem>
      ))}
    </Menu>
  );
}
