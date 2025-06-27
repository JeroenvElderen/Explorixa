// src/pages/Map/index.js

import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "../../components/MDBox";
import { supabase } from "../../SupabaseClient";
import DashboardLayout from "../../examples/LayoutContainers/DashboardLayout";
import ResponsiveNavbar from "../../examples/Navbars/ResponsiveNavbar";
import WorldMapComponent from "../../components/WorldMapComponent";
import PlaceConfigurator from "../../components/PlaceConfigurator";
import { useMaterialUIController, setOpenConfigurator } from "../../context";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { Link } from "react-router-dom";

import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoiamVyb2VudmFuZWxkZXJlbiIsImEiOiJjbWMwa2M0cWswMm9jMnFzNjI3Z2I4YnV4In0.qUqeNUDYMBf3E54ouOd2Jg";

export default function Map() {
  const [controller, dispatch] = useMaterialUIController();
  const { openConfigurator, miniSidenav } = controller;

  const [loggedInAuthor, setLoggedInAuthor] = useState(null);
  const [selectingPoint, setSelectingPoint] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // bottom-nav state
  const [navValue, setNavValue] = useState(0);

  // whenever the sidenav closes (miniSidenav false), reset navValue → 0
  useEffect(() => {
    if (!miniSidenav) {
      setNavValue(0);
    }
  }, [miniSidenav]);

  // replaces previous showChrome logic: Home now simply closes the configurator
  const handleHomeClick = () => setOpenConfigurator(dispatch, false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) setLoggedInAuthor(data.user.id);
    })();
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setLoggedInAuthor(session?.user?.id ?? null);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleActivateMapClick = () => {
    setSelectingPoint(true);
    setOpenConfigurator(dispatch, true);
  };

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
    setOpenConfigurator(dispatch, false);
  };

  const handlePlacePick = (place) => {
    setSelectedPlace(place);
    setSelectingPoint(false);
  };

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
      country: context.find((c) => c.id.startsWith("country"))?.text || "",
      city: context.find((c) => c.id.startsWith("place"))?.text || "",
      address: feat.text || "",
      landmark: "",
    });
  };

  return (
    <DashboardLayout>
      <MDBox sx={{ pt: 10, pb: isMobile ? 9 : 0 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <WorldMapComponent
              accessToken={MAPBOX_ACCESS_TOKEN}
              selectingPoint={selectingPoint}
              onMapClick={handleMapClick}
              onPoiClick={handlePlacePick}
              target={selectedPlace ? [selectedPlace.lng, selectedPlace.lat] : undefined}
            />
          </Grid>
        </Grid>
      </MDBox>

      <ResponsiveNavbar
        navValue={navValue}
        onNavChange={setNavValue}
        onHomeClick={handleHomeClick}
        onConfiguratorClick={handleActivateMapClick}
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
        <PlaceConfigurator
          countryCode={null}
          accessToken={MAPBOX_ACCESS_TOKEN}
          initialData={selectedPlace}
          onPlacePick={handlePlacePick}
          onPlaceSelected={handlePlaceSelected}
          onActivateMapClick={handleActivateMapClick}
        />
      )}
    </DashboardLayout>
  );
}
