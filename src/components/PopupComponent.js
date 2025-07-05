// src/components/PopupComponent.jsx
import React from 'react';
import PinCard from 'examples/Charts/PinCard';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import themeDark from 'assets/theme-dark';
import { Link } from 'react-router-dom';
import { Typography, IconButton, Box, useMediaQuery } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import routes from 'routes';
import { useSavedPins } from '../components/SavedPinsContext';
import DOMPurify from "dompurify";
import RowPinCard from 'examples/Charts/PinCard/RowPinCard';

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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // sm ~600px

  if (!data) return null;

  // Use a stable identifier: prefer data.id, fallback to title
  const pinId = data.id ?? data.title;
  const isSaved = pins.some(p => p.id === pinId);

  const formattedDate = data.date
    ? new Date(data.date).toISOString().slice(0, 10)
    : '';
  const countryName = data.countryName || data.title;
  const matchedRoute = findRouteByName(routes, countryName);
  const fallbackRoute = `/Destinations/World_destinations/${countryName.replace(/\s+/g, '_')}`;
  const countryPath = matchedRoute || fallbackRoute;
  const CardComponent = isMobile ? RowPinCard : PinCard;
  const handleSave = e => {
    e.stopPropagation();
    if (isSaved) remove({ id: pinId });
    else save({
      id: pinId,
      title: data.title,
      description: data.description,
      imageurl: data.imageurl,
      date: data.date,
    });
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: isMobile ? 'flex-start' : 'center',
        paddingTop: isMobile ? '20px' : 0,
        zIndex: 9999,
        cursor: 'pointer',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '90%',
          maxWidth: '500px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <ThemeProvider theme={themeDark}>
          {/* Wrap PinCard in a relative container */}
          <Box sx={{ position: 'relative' }} onClick={onClose} >
            <CardComponent
              color="info"
              title={
                <Typography variant="h6" align="center" sx={{ mt: -1, mb: 1, fontWeight: 800, color: 'white' }}>
                  {data.title}
                </Typography>
              }
              description={
                data.description
              }
              date={formattedDate}
              imageurl={data.imageurl}
              imagealt={data.title}
              height="300px"
              truncateDescription={false}
            />
            {/* Heart icon at bottom-right, always red */}
            <IconButton
              onClick={handleSave}
              size="small"
              sx={{
                position: 'absolute',
                bottom: 34,
                right: 12,
                p: 1,
                color: 'error.main',
                backgroundColor: 'rgba(0,0,0,0.3)',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.5)' },
              }}
            >
              {isSaved
                ? <FavoriteIcon fontSize="small" />
                : <FavoriteBorderIcon fontSize="small" />
              }
            </IconButton>
          </Box>

          {/* Link button below PinCard */}
          <Link
            to={countryPath}
            onClick={onClose}
            style={{
              marginTop: '16px',
              padding: '12px 0',
              textAlign: 'center',
              background: 'linear-gradient(195deg, rgb(241,143,1), rgba(241,143,1,0.5))',
              color: '#fff',
              borderRadius: '12px',
              boxShadow: '0 2px 4px -1px rgb(241 143 1 / 20%), 0 4px 5px 0 rgb(241 143 1 / 14%), 0 1px 10px 0 rgb(241 143 1 / 12%)',
              textDecoration: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              letterSpacing: '0.15px',
            }}
          >
            Go to {countryName}
          </Link>
        </ThemeProvider>
      </div>
    </div>
  );
}
