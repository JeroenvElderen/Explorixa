// src/pages/PinPage.jsx

import React from "react";
import DashboardLayout from "../examples/LayoutContainers/DashboardLayout";
import SimpleResponsiveNavbar from "../examples/Navbars/ResponsiveNavbar/allpage";
import Footer from "../examples/Footer";
import StarField from "../components/StarField";
import { Grid, Box } from "@mui/material";
import usePin from "components/pinpage/hooks/usePin";
import {
  PinMainCard,
  PinContentSection,
  PinSidebar,
  PinMediaSection,
} from "../components/pinpage";

export default function PinPage() {
  const {
    pin,
    loading,
    notFound,
    currentUserId,
    setPin,
    infoDialogOpen,
    setInfoDialogOpen,
    updatePinInfo,
    isMobile,
    images,
  } = usePin();

  if (loading) return <div>Loading...</div>;
  if (notFound)
    return (
      <DashboardLayout>
        <SimpleResponsiveNavbar />
        <Box p={4} textAlign="center">
          <h2>Pin not found</h2>
        </Box>
        <Footer />
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <SimpleResponsiveNavbar />
      <StarField />

      {isMobile ? (
        <Box>
          <PinMediaSection
            images={images}
            pin={pin}
            isMobile={isMobile}
            setPin={setPin}
          />
          <PinMainCard
            pin={pin}
            currentUserId={currentUserId}
            setPin={setPin}
            isMobile={isMobile}
          />
          <PinContentSection
            pin={pin}
            infoDialogOpen={infoDialogOpen}
            setInfoDialogOpen={setInfoDialogOpen}
            updatePinInfo={updatePinInfo}
          />
          <PinSidebar pin={pin} />
        </Box>
      ) : (
        <Box>
          {/* Desktop layout */}
          <Box>
            <PinMainCard
              pin={pin}
              currentUserId={currentUserId}
              setPin={setPin}
              isMobile={isMobile}
            />
          </Box>
          <Box mt={2}>
            <PinMediaSection
              images={images}
              pin={pin}
              isMobile={isMobile}
              setPin={setPin}
            />
          </Box>
          <Grid container spacing={3} mt={2}>
            <Grid item xs={12} md={8}>
              <PinContentSection
                pin={pin}
                infoDialogOpen={infoDialogOpen}
                setInfoDialogOpen={setInfoDialogOpen}
                updatePinInfo={updatePinInfo}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <PinSidebar pin={pin} />
            </Grid>
          </Grid>
        </Box>
      )}

      <Footer />
    </DashboardLayout>
  );
}
