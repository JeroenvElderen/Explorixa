import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "../../components/MDBox";
import Button from "@mui/material/Button";
import { supabase } from "../../SupabaseClient";
import DashboardLayout from "../../examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "../../examples/Navbars/DashboardNavbar";
import WorldMapComponent from "../../components/WorldMapComponent";
import PlaceConfigurator from "../../components/PlaceConfigurator";
import { useMaterialUIController, setOpenConfigurator } from "../../context";

const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoiamVyb2VudmFuZWxkZXJlbiIsImEiOiJjbWMwa2M0cWswMm9jMnFzNjI3Z2I4YnV4In0.qUqeNUDYMBf3E54ouOd2Jg";

export default function Map() {
  
  const [controller, dispatch] = useMaterialUIController();
  const { openConfigurator } = controller;

  const [loggedInAuthor, setLoggedInAuthor] = useState(null);
  const [selectingPoint, setSelectingPoint] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) {
        setLoggedInAuthor(data.user.id);
      }
    };
    init();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setLoggedInAuthor(session?.user?.id ?? null);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleAddPinClick = () => {
    setOpenConfigurator(dispatch, true);
  };

  const handleActivateMapClick = () => {
    setSelectingPoint(true);
    setOpenConfigurator(dispatch, true);
  };

  // Called when the user clicks "Save" in the configurator
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

  // Called when the user picks a point on the map (via click or POI)
  // Only sets the place & exits selection mode; does NOT close the configurator
  const handlePlacePick = (place) => {
    setSelectedPlace(place);
    setSelectingPoint(false);
  };

  // Map click → reverse geocode → pick the place
  const handleMapClick = async ({ lng, lat }) => {
    const url =
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json` +
      `?access_token=${MAPBOX_ACCESS_TOKEN}` +
      `&types=address,place,region,country,poi&limit=1`;

    const res = await fetch(url);
    const { features } = await res.json();
    const feat = features[0] || {};
    const context = feat.context || [];

    const address = feat.text || "";
    const city = (context.find((c) => c.id.startsWith("place")) || {}).text || "";
    const country = (context.find((c) => c.id.startsWith("country")) || {}).text || "";

    handlePlacePick({
      lat,
      lng,
      country,
      city,
      address,
      landmark: "",
    });
  };

  return (
    <DashboardLayout>
      <DashboardNavbar
        variant="boxed"
        action={
          <Button
            variant="contained"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleAddPinClick();
            }}
          >
            📍 Add Pin
          </Button>
        }
        sx={{
          position: "fixed",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "960px",
          zIndex: 1300,
        }}
      />
      <MDBox sx={{ position: "relative", m: "-20px" }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <WorldMapComponent
              accessToken={MAPBOX_ACCESS_TOKEN}
              selectingPoint={selectingPoint}
              onMapClick={handleMapClick}
              onPoiClick={handlePlacePick}
              target={
                selectedPlace ? [selectedPlace.lng, selectedPlace.lat] : undefined
              }
            />
          </Grid>
        </Grid>
      </MDBox>

      {/* Configurator stays open until the user hits "Save" */}
      <div style={{ display: openConfigurator ? "block" : "none" }}>
        <PlaceConfigurator
          countryCode={null}
          accessToken={MAPBOX_ACCESS_TOKEN}
          initialData={selectedPlace}
          onPlacePick={handlePlacePick}
          onPlaceSelected={handlePlaceSelected}
          onActivateMapClick={handleActivateMapClick}
        />
      </div>
    </DashboardLayout>
  );
}
