// src/layouts/map/index.jsx
import React, {
  lazy,
  Suspense,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import Grid from "@mui/material/Grid";
import MDBox from "../../components/MDBox";
import { supabase } from "../../SupabaseClient";
import DashboardLayout from "../../examples/LayoutContainers/DashboardLayout";
import ResponsiveNavbar from "../../examples/Navbars/ResponsiveNavbar";
import { useMaterialUIController, setOpenConfigurator } from "../../context";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import ProfilePopup from "../ProfilePopup";

const WorldMapComponent = lazy(() =>
  import("../../components/WorldMapComponent/WorldMapComponent")
);
// wrap in memo
const MemoWorldMap = React.memo(WorldMapComponent);

const PlaceConfigurator = lazy(() =>
  import("../../components/PlaceConfigurator/PlaceConfigurator")
);

const MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoiamVyb2VudmFuZWxkZXJlbiIsImEiOiJjbWMwa2M0cWswMm9jMnFzNjI3Z2I4YnV4In0.qUqeNUDYMBf3E54ouOd2Jg";

export default function Map() {
  const [controller, dispatch] = useMaterialUIController();
  const { openConfigurator } = controller;
  const worldMapRef = useRef(null);

  // page state
  const [profile, setProfile] = useState(null);
  const [selectingPoint, setSelectingPoint] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [flyToPlace, setFlyToPlace] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [poiClickedCount, setPoiClickedCount] = useState(0);
  const [navValue, setNavValue] = useState(1);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // load user profile once
  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (!error && data.user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("user_id", data.user.id)
          .single()
          .then(({ data: prof }) => setProfile(prof));
      }
    });
  }, []);

  // stable callbacks
  const handleMapClick = useCallback(async place => {
    const { lng, lat } = place;
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json` +
        `?access_token=${MAPBOX_ACCESS_TOKEN}` +
        `&types=address,place,region,country,poi&limit=1`
    );
    const { features = [] } = await res.json();
    const feat = features[0] || {};
    const ctx = feat.context || [];
    const country =
      ctx.find(c => c.id.startsWith("country"))?.text || "";
    const city =
      ctx.find(c => c.id.startsWith("place"))?.text ||
      ctx.find(c => c.id.startsWith("region"))?.text ||
      "";

    setSelectedPlace({
      ...place,
      address: feat.text || place.name || "",
      landmark: place.landmark || "",
      country,
      city,
      lat,
      lng,
    });
    setSelectingPoint(false);
  }, []);

  const handlePoiClick = useCallback(
    async place => {
      await handleMapClick(place);
      setPoiClickedCount(c => c + 1);
      setOpenConfigurator(dispatch, true);
      setNavValue(2);
    },
    [dispatch, handleMapClick]
  );

  // style memo
  const mapStyle = useMemo(() => ({ height: "100%" }), []);

  const mapProps = useMemo(
    () => ({
      accessToken: MAPBOX_ACCESS_TOKEN,
      selectingPoint,
      onMapClick: handleMapClick,
      onPoiClick: handlePoiClick,
      target: selectedPlace,
      flyOnTarget: flyToPlace,
      style: mapStyle,
      ref: worldMapRef,
    }),
    [
      selectingPoint,
      handleMapClick,
      handlePoiClick,
      selectedPlace,
      flyToPlace,
      mapStyle,
    ]
  );

  // clear flyToPlace after brief moment
  useEffect(() => {
    if (flyToPlace) {
      const t = setTimeout(() => setFlyToPlace(false), 1000);
      return () => clearTimeout(t);
    }
  }, [flyToPlace]);

  return (
    <DashboardLayout
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <MDBox
        sx={{
          pt: 10,
          pb: isMobile ? 9 : 0,
          flexGrow: 1,
          position: "relative",
        }}
      >
        <Grid container sx={{ height: "100%" }}>
          <Grid item xs={12} sx={{ height: "100%" }}>
            <Suspense
              fallback={
                <div style={{ textAlign: "center", padding: 40 }}>
                  Loading map…
                </div>
              }
            >
              <MemoWorldMap {...mapProps} />
            </Suspense>
          </Grid>
        </Grid>
      </MDBox>

      <ResponsiveNavbar
        navValue={navValue}
        onNavChange={setNavValue}
        onHomeClick={() => {
          setResetKey(r => r + 1);
          setNavValue(0);
          setOpenConfigurator(dispatch, false);
        }}
        onConfiguratorClick={() => {
          setSelectingPoint(true);
          setOpenConfigurator(dispatch, true);
          setNavValue(2);
        }}
        poiClicked={poiClickedCount}
        onProfileClick={() => setNavValue(3)}
        onAnyNav={() => {}}
      />

      {openConfigurator && (
        <Suspense fallback={<div>Loading configurator…</div>}>
          <PlaceConfigurator
            key={resetKey}
            userId={profile?.user_id}
            accessToken={MAPBOX_ACCESS_TOKEN}
            initialData={selectedPlace}
            onPlacePick={p => setSelectedPlace(p)}
            onPlaceSelected={p => {
              setSelectedPlace(p);
              setFlyToPlace(true);
              setOpenConfigurator(dispatch, false);
              setNavValue(1);
            }}
            onCancel={() => {
              setSelectingPoint(false);
              setOpenConfigurator(dispatch, false);
            }}
          />
        </Suspense>
      )}
    </DashboardLayout>
  );
}
