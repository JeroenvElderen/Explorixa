import './App.css';
import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// Material UI + Dashboard Theme
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from 'assets/theme'; // Adjust path if needed

// App Components
import DefaultNavbar from 'examples/Navbars/DefaultNavbar';
import SearchBar from 'components/SearchBar';
import MapComponent from './components/MapComponent';
import Register from './components/Register';
import Login from './components/Login';
import { MaterialUIControllerProvider } from "./context";
import Overview from 'layouts/profile';

const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

function App() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/register' || location.pathname.startsWith('/profile');

  const [searchLocation, setSearchLocation] = useState(null);

  // Called from Navbar's search input
  const handleSearch = async (query) => {
    if (!query) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${MAPBOX_ACCESS_TOKEN}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        setSearchLocation({ lng, lat, name: query });
      } else {
        alert('No results found');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('Failed to perform search.');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MaterialUIControllerProvider>
      {!hideNavbar && (
        <div className="navbar-wrapper">
          <DefaultNavbar />
          <SearchBar onSearch={handleSearch} />
        </div>
      )}
        <Routes>
          {/* Pass searchLocation & accessToken as props to MapComponent */}
          <Route
            path="/"
            element={<MapComponent searchLocation={searchLocation} accessToken={MAPBOX_ACCESS_TOKEN} />}
          />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile/*" element={<Overview />} />
        </Routes>
      </MaterialUIControllerProvider>
    </ThemeProvider>
  );
}

export default App;
