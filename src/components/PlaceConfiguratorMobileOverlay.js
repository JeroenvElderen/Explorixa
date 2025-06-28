// Mobile overlay for PlaceConfigurator: just add, don't rewrite PlaceConfigurator.jsx
// Place this at the bottom of PlaceConfigurator.jsx (or import into your component file)

import Drawer from "@mui/material/Drawer";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import React from "react";

/**
 * Usage: Only wrap your PlaceConfigurator in this component.
 * Desktop: renders children as normal.
 * Mobile: renders as a Drawer sheet above bottom nav.
 */
export function PlaceConfiguratorMobileOverlay({ open, onClose, children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!isMobile) return children;

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          height: `calc(100dvh - 56px)`, // 56px = BottomNavigation height
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          overflow: "visible",
          boxShadow: 24,
        },
      }}
      ModalProps={{ keepMounted: true }}
    >
      <div style={{ height: '100%', padding: '12px 0 24px 0', overflow: 'auto' }}>
        {children}
      </div>
    </Drawer>
  );
}

/* Usage in your Map.js (or parent):


{openConfigurator && (
  <PlaceConfiguratorMobileOverlay
    open={openConfigurator}
    onClose={handleCancelConfigurator}
  >
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
  </PlaceConfiguratorMobileOverlay>
)}
*/

// That's it! No need to change PlaceConfigurator's internal code. It will look like a full-screen sheet above your bottom navbar on mobile, and desktop stays unchanged.
