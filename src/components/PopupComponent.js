// src/components/PopupComponent.jsx
import React from 'react';
import PinCard from 'examples/Charts/PinCard';
import { ThemeProvider } from '@mui/material/styles';
import themeDark from 'assets/theme-dark';
import { Link } from 'react-router-dom';
import { Typography } from '@mui/material';
import routes from 'routes';

// Recursively find route by country name or key (case-insensitive)
function findRouteByName(items, name) {
  const needle = name?.toString().toLowerCase().trim();
  if (!needle) return undefined;
  for (const item of items) {
    const nm = item.name?.toString().toLowerCase().trim();
    const key = item.key?.toString().toLowerCase().trim();
    if (item.route && (nm === needle || key === needle)) {
      return item.route;
    }
    if (item.children) {
      const found = findRouteByName(item.children, name);
      if (found) return found;
    }
  }
  return undefined;
}

export default function PopupComponent({ data, onClose }) {
  if (!data) return null;

  const formattedDate = data.date ? new Date(data.date).toISOString().slice(0, 10) : '';
  const countryName = data.countryName || data.title;
  // Look up the exact route, fallback to slug-based dynamic path
  const matchedRoute = findRouteByName(routes, countryName);
  const fallbackRoute = `/Destinations/World_destinations/${
    countryName.replace(/\s+/g, '_')
  }`;
  const countryPath = matchedRoute || fallbackRoute;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 9999, cursor: 'pointer',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '500px', display: 'flex', flexDirection: 'column', cursor: 'default' }}
      >
        <ThemeProvider theme={themeDark}>
          <PinCard
            color="info"
            title={
              <Typography
                variant="h6"
                align="center"
                sx={{ mt: -1, mb: 1, fontWeight: 800, color: 'white' }}
              >
                {countryName}
              </Typography>
            }
            description={
              <div
                style={{
                  maxHeight: '120px',
                  overflowY: 'auto',
                  padding: '14px',
                  boxSizing: 'border-box',
                  color: 'white',
                }}
              >
                {data.description}
              </div>
            }
            date={formattedDate}
            imageurl={data.imageurl}
            imagealt={data.title}
            height="300px"
            truncateDescription={false}
          />
          {/* Link uses found route or fallback slug path */}
          <Link
            to={countryPath}
            onClick={onClose}
            style={{
              marginTop: '16px', padding: '12px 0', textAlign: 'center',
              background: 'linear-gradient(195deg, rgb(73,163,241), rgb(26,115,232))',
              color: '#fff', borderRadius: '0 0 6px 6px',
              boxShadow: '0 2px 4px -1px rgb(26 115 232 / 20%), 0 4px 5px 0 rgb(26 115 232 / 14%), 0 1px 10px 0 rgb(26 115 232 / 12%)',
              textDecoration: 'none', cursor: 'pointer', fontWeight: 600, letterSpacing: '0.15px',
            }}
          >
            Go to {countryName}
          </Link>
        </ThemeProvider>
      </div>
    </div>
  );
}
