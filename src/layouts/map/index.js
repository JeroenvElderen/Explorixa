import React, { lazy, Suspense, useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import MDBox from "../../components/MDBox";
import { supabase } from "../../SupabaseClient";
import DashboardLayout from "../../examples/LayoutContainers/DashboardLayout";
import ResponsiveNavbar from "../../examples/Navbars/ResponsiveNavbar";

import { useMaterialUIController, setOpenConfigurator } from "../../context";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { Link } from "react-router-dom";

import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";


const WorldMapComponent = lazy(() => import("../../components/WorldMapComponent"));
const PlaceConfigurator = lazy(() => import("../../components/PlaceConfigurator"));
const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoiamVyb2VudmFuZWxkZXJlbiIsImEiOiJjbWMwa2M0cWswMm9jMnFzNjI3Z2I4YnV4In0.qUqeNUDYMBf3E54ouOd2Jg";

export default function Map() {
  const [controller, dispatch] = useMaterialUIController();
  const { openConfigurator, miniSidenav } = controller;

  const [loggedInAuthor, setLoggedInAuthor] = useState(null);
  const [selectingPoint, setSelectingPoint] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  // control flying to a new pin
  const [flyToPlace, setFlyToPlace] = useState(false);
  // resetKey to clear highlighted POI marker
  const [resetKey, setResetKey] = useState(0);
  // count POI clicks
  const [poiClickedCount, setPoiClickedCount] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // bottom nav state
  const [navValue, setNavValue] = useState(0);

  // reset nav on sidenav/configurator close
  useEffect(() => { if (!miniSidenav) setNavValue(0); }, [miniSidenav]);
  useEffect(() => { if (!openConfigurator) setNavValue(0); }, [openConfigurator]);

  // clear fly flag after flying
  useEffect(() => {
    if (flyToPlace) {
      const timer = setTimeout(() => setFlyToPlace(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [flyToPlace]);

  // Home button: close configurator and reset highlight
  const handleHomeClick = () => {
    setOpenConfigurator(dispatch, false);
    setResetKey(r => r + 1);
  };

  // Activate map click for adding new pin
  const handleActivateMapClick = () => {
    setSelectingPoint(true);
    setOpenConfigurator(dispatch, true);
  };

  // When a pin is selected and saved
  const handlePlaceSelected = async (place) => {
    await supabase.from("pins").insert({
      author: loggedInAuthor,
      country: place.country,
      city: place.city,
      address: place.address,
      landmark: place.landmark,
      latitude: place.lat,
      longitude: place.lng,
    });
    setSelectedPlace(place);
    setFlyToPlace(true);
    setResetKey(r => r + 1);
    setOpenConfigurator(dispatch, false);
  };

  // When an existing POI or map click is picked
  const handlePlacePick = (place) => {
    setSelectedPlace(place);
    setSelectingPoint(false);
  };

  // Geocode on map click
  const handleMapClick = async ({ lng, lat }) => {
    const url =
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json` +
      `?access_token=${MAPBOX_ACCESS_TOKEN}` +
      `&types=address,place,region,country,poi&limit=1`;
    const res = await fetch(url);
    const { features } = await res.json();
    const feat = features[0] || {};
    const context = feat.context || [];
    handlePlacePick({
      lat,
      lng,
      country: context.find(c => c.id.startsWith("country"))?.text || "",
      city: context.find(c => c.id.startsWith("place"))?.text || "",
      address: feat.text || "",
      landmark: "",
    });
  };

  // Cancel in configurator: clear form and reset highlight
  const handleCancelConfigurator = () => {
    setSelectedPlace(null);
    setResetKey(r => r + 1);
    setOpenConfigurator(dispatch, false);
    setNavValue(0);
  };

  return (
    <DashboardLayout>
      <MDBox sx={{ pt: 10, pb: isMobile ? 9 : 0 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Suspense fallback={<div style={{textAlign:"center", padding:40}}>Loading map...</div>}>
            <WorldMapComponent
              accessToken={MAPBOX_ACCESS_TOKEN}
              selectingPoint={selectingPoint}
              onMapClick={handleMapClick}
              onPoiClick={(place) => {
                handlePlacePick(place);
                setPoiClickedCount(c => c + 1);
                setFlyToPlace(false);
              }}
              target={
                selectedPlace?.lng != null && selectedPlace?.lat != null
                  ? [selectedPlace.lng, selectedPlace.lat]
                  : undefined
              }
              flyOnTarget={flyToPlace}
              resetKey={resetKey}
            />
            </Suspense>
          </Grid>
        </Grid>
      </MDBox>

      <ResponsiveNavbar
        navValue={navValue}
        onNavChange={setNavValue}
        onHomeClick={handleHomeClick}
        onConfiguratorClick={handleActivateMapClick}
        poiClicked={poiClickedCount}
      >
        <BottomNavigation
          value={navValue}
          onChange={(_, newValue) => setNavValue(newValue)}
          showLabels
          sx={{
            width: "100vw",
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: theme.zIndex.appBar,
            backgroundColor: theme.palette.background.paper,
            ".Mui-selected, .Mui-selected > svg": {
              color: theme.palette.primary.main,
            },
          }}
        >
          <BottomNavigationAction label="Home" icon={<HomeIcon />} />
          <BottomNavigationAction label="Search" icon={<SearchIcon />} />
          <BottomNavigationAction
            label="Profile"
            icon={<AccountCircleIcon />} 
            component={Link}
            to="/profile"
          />
        </BottomNavigation>
      </ResponsiveNavbar>

      {openConfigurator && (
        <Box
          sx={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: `calc(56px + 20px)`,  // nav height + gap
            zIndex: theme.zIndex.appBar + 1, // above navbar
          }}
        >
          <Box>
            <Suspense fallback={<div>Loading Configurator...</div>}>
            <PlaceConfigurator
              key={resetKey}
              countryCode={null}
              accessToken={MAPBOX_ACCESS_TOKEN}
              initialData={selectedPlace}
              onPlacePick={handlePlacePick}
              onPlaceSelected={handlePlaceSelected}
              onActivateMapClick={handleActivateMapClick}
              onCancel={handleCancelConfigurator}
            />
            </Suspense>
          </Box>
        </Box>
      )}
    </DashboardLayout>
  );
}
