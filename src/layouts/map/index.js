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
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ProfilePopup from "layouts/ProfilePopup";

const WorldMapComponent = lazy(() => import("../../components/WorldMapComponent"));
const PlaceConfigurator = lazy(() => import("../../components/PlaceConfigurator"));
const MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoiamVyb2VudmFuZWxkZXJlbiIsImEiOiJjbWMwa2M0cWswMm9jMnFzNjI3Z2I4YnV4In0.qUqeNUDYMBf3E54ouOd2Jg";

export default function Map() {
  const [controller, dispatch] = useMaterialUIController();
  const { openConfigurator, miniSidenav } = controller;

  const [profile, setProfile] = useState(null);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [selectingPoint, setSelectingPoint] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [flyToPlace, setFlyToPlace] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [poiClickedCount, setPoiClickedCount] = useState(0);
  const [navValue, setNavValue] = useState(0);
  const handleAnyNav = () => setShowProfilePopup(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    async function loadProfile() {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!authError && user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();
        if (!error) setProfile(data);
      }
    }
    loadProfile();
  }, []);

  const handleProfilePopupClose = () => {
    setShowProfilePopup(false);
    setNavValue(0);
  };

  const handleHomeClick = () => {
    setOpenConfigurator(dispatch, false);
    setResetKey((r) => r + 1);
    setNavValue(0);
  };

  const handleActivateMapClick = () => {
    setSelectingPoint(true);
    setOpenConfigurator(dispatch, true);
  };

  const handlePlaceSelected = async (place) => {
    await supabase.from("pins").insert({
      author: profile?.user_id,
      country: place.country,
      city: place.city,
      address: place.address,
      landmark: place.landmark,
      latitude: place.lat,
      longitude: place.lng,
    });
    setSelectedPlace(place);
    setFlyToPlace(true);
    setResetKey((r) => r + 1);
    setOpenConfigurator(dispatch, false);
  };

  const handlePlacePick = (place) => {
    setSelectedPlace(place);
    setSelectingPoint(false);
  };

  const handleMapClick = async ({ lng, lat }) => {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_ACCESS_TOKEN}&types=address,place,region,country,poi&limit=1`;
    const { features } = await fetch(url).then((r) => r.json());
    const feat = features[0] || {};
    const context = feat.context || [];
    handlePlacePick({
      lat,
      lng,
      country: context.find((c) => c.id.startsWith("country"))?.text,
      city: context.find((c) => c.id.startsWith("place"))?.text,
      address: feat.text,
      landmark: "",
    });
  };

  const handleCancelConfigurator = () => {
    setSelectedPlace(null);
    setResetKey((r) => r + 1);
    setOpenConfigurator(dispatch, false);
    setNavValue(0);
  };

  useEffect(() => { if (!miniSidenav) setNavValue(0); }, [miniSidenav]);
  useEffect(() => { if (!openConfigurator) setNavValue(0); }, [openConfigurator]);

  useEffect(() => {
    if (flyToPlace) {
      const timer = setTimeout(() => setFlyToPlace(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [flyToPlace]);

  console.log("showProfilePopup:", showProfilePopup, "profile:", profile);

  return (
    <DashboardLayout>
      <MDBox sx={{ pt: 10, pb: isMobile ? 9 : 0 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Suspense fallback={<div style={{ textAlign: "center", padding: 40 }}>Loading map...</div>}>
              <WorldMapComponent
                accessToken={MAPBOX_ACCESS_TOKEN}
                selectingPoint={selectingPoint}
                onMapClick={handleMapClick}
                onPoiClick={(place) => {
                  handlePlacePick(place);
                  setPoiClickedCount((c) => c + 1);
                  setFlyToPlace(false);
                }}
                target={selectedPlace ? [selectedPlace.lng, selectedPlace.lat] : undefined}
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
        onProfileClick={() => {
          setNavValue(2);
          setShowProfilePopup(true)
        }}
        onAnyNav={handleAnyNav}
      >
        
      </ResponsiveNavbar>

      {showProfilePopup && (
        <ProfilePopup user={profile} onClose={handleProfilePopupClose} />
      )}

      {openConfigurator && (
       
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
        
      )}
    </DashboardLayout>
  );
}
