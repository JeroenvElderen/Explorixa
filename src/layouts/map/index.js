import React, { lazy, Suspense, useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "../../components/MDBox";
import { supabase } from "../../SupabaseClient";
import DashboardLayout from "../../examples/LayoutContainers/DashboardLayout";
import ResponsiveNavbar from "../../examples/Navbars/ResponsiveNavbar";
import { useMaterialUIController, setOpenConfigurator } from "../../context";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import ProfilePopup from "layouts/ProfilePopup";

const WorldMapComponent = lazy(() => import("../../components/WorldMapComponent"));
const PlaceConfigurator   = lazy(() => import("../../components/PlaceConfigurator"));

const MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoiamVyb2VudmFuZWxkZXJlbiIsImEiOiJjbWMwa2M0cWswMm9jMnFzNjI3Z2I4YnV4In0.qUqeNUDYMBf3E54ouOd2Jg";
const FALLBACK_USER_ID    = "920ae8e3-79d1-4303-905b-e35cbf68e3d5";

export default function Map() {
  const [controller, dispatch] = useMaterialUIController();
  const { openConfigurator } = controller;

  const [profile, setProfile]             = useState(null);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [selectingPoint, setSelectingPoint]     = useState(false);
  const [selectedPlace, setSelectedPlace]       = useState(null);
  const [flyToPlace, setFlyToPlace]             = useState(false);
  const [resetKey, setResetKey]                 = useState(0);
  const [poiClickedCount, setPoiClickedCount]   = useState(0);
  const [navValue, setNavValue]                 = useState(1);

  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Load user profile once
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
    setResetKey(r => r + 1);
    setNavValue(0);
  };

  const handleActivateMapClick = () => {
    setSelectingPoint(true);
    setOpenConfigurator(dispatch, true);
    setNavValue(2);
  };

  const handlePlaceSelected = async (place) => {
    setSelectedPlace(place);
    setFlyToPlace(true);
    setResetKey(r => r + 1);
    setOpenConfigurator(dispatch, false);
    setNavValue(1);
  };

  const handlePlacePick = (place) => {
    setSelectedPlace(place);
    setSelectingPoint(false);
  };

  // Single async reverse‐geocode handler for both map & POI clicks
  const handleMapClick = async (place) => {
    const { lng, lat } = place;
    const url =
      `https://api.mapbox.com/geocoding/v5/mapbox.places/` +
      `${lng},${lat}.json` +
      `?access_token=${MAPBOX_ACCESS_TOKEN}` +
      `&types=address,place,region,country,poi&limit=1`;

    try {
      const res = await fetch(url);
      const { features = [] } = await res.json();
      const feat = features[0] || {};
      const ctx  = feat.context || [];

      const country = ctx.find(c => c.id.startsWith("country"))?.text || "";
      const city    = ctx.find(c => c.id.startsWith("place"))?.text
                    || ctx.find(c => c.id.startsWith("region"))?.text
                    || "";

      handlePlacePick({
        ...place,
        address:  feat.text     || place.name || "",
        landmark: place.landmark || "",
        country,
        city,
        lat,
        lng,
      });
    } catch (err) {
      console.error("Reverse geocode failed:", err);
    }
  };

  const handleCancelConfigurator = () => {
    setOpenConfigurator(dispatch, false);
    setSelectingPoint(false);
    setSelectedPlace(null);
    setResetKey(r => r + 1);
    setNavValue(1);
  };

  // Clear flyToPlace after animation
  useEffect(() => {
    if (flyToPlace) {
      const timer = setTimeout(() => setFlyToPlace(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [flyToPlace]);

  return (
    <DashboardLayout>
      <MDBox sx={{ pt: 10, pb: isMobile ? 9 : 0 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Suspense fallback={<div style={{ textAlign:"center", padding:40 }}>Loading map…</div>}>
              <WorldMapComponent
                accessToken={MAPBOX_ACCESS_TOKEN}
                selectingPoint={selectingPoint}
                onMapClick={handleMapClick}
                onPoiClick={async (place) => {
                  await handleMapClick(place);
                  setPoiClickedCount(c => c + 1);
                  setFlyToPlace(false);
                  setOpenConfigurator(dispatch, true);
                  setNavValue(2);
                }}
                target={selectedPlace ? [selectedPlace.lng, selectedPlace.lat] : undefined}
                flyOnTarget={flyToPlace}
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
        onProfileClick={() => setShowProfilePopup(true)}
        onAnyNav={() => setShowProfilePopup(false)}
      />

      {openConfigurator && (
        <Suspense fallback={<div>Loading Configurator…</div>}>
          <PlaceConfigurator
            key={resetKey}
            userId={profile?.user_id ?? FALLBACK_USER_ID}
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
