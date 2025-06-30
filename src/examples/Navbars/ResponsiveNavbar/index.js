import React, { useState, useRef, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Menu from "@mui/material/Menu";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import HomeIcon from "@mui/icons-material/Home";
import AddLocationIcon from "@mui/icons-material/AddLocation";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/MenuOpen";
import MenuOpenIcon from "@mui/icons-material/Menu";

import {
  useMaterialUIController,
  setMiniSidenav,
  setOpenConfigurator,
} from "../../../context";
import NotificationItem from "../../../examples/Items/NotificationItem";

export default function ResponsiveNavbar({
  onHomeClick,
  onConfiguratorClick,
  poiClicked,
  onProfileClick,
  navValue,
  onNavChange,
  onAnyNav,
}) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, openConfigurator } = controller;

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [openMenu, setOpenMenu] = useState(null);
  const closingByNav = useRef(false);

  const theme = useTheme();

  const isWeb = useMediaQuery(theme.breakpoints.up("lg"));
  const isDesktop = useMediaQuery("(min-width:1200px");

  const ICON_SIZE = 24;
  const GAP = theme.spacing(1);
  const ITEM_SIZE = 56;
  const animTimeout = useRef(null);

  // Close helpers
  const closeSidenav = () => {
    if (isWeb) return;
    if (!miniSidenav) setMiniSidenav(dispatch, true);
  };
  
  const closeConfigurator = () => {
    if (openConfigurator) setOpenConfigurator(dispatch, false);
  };

   useEffect(() => {
    if (!openConfigurator) {
      if (!closingByNav.current) {
        setSlideIndex(0);
        setSelectedIndex(0);
      }
      // clear the flag for next time
      closingByNav.current = false;
    }
  }, [openConfigurator]);


  // Trigger on POI click: open configurator and select Add Pin
  useEffect(() => {
    if (poiClicked) {
      closeSidenav();
      // open configurator panel immediately
      setOpenConfigurator(dispatch, true);
      // set Add Pin active via nav index
      setSlideIndex(1);
      setSelectedIndex(1);
      // notify parent if needed
      if (onConfiguratorClick) onConfiguratorClick();
    }
  }, [poiClicked, dispatch]);

  // Generic slide-and-click handler for Home, Profile, Sidenav toggle
  const handleClick = (newIndex, callback) => {
    setSlideIndex(newIndex);
    clearTimeout(animTimeout.current);
    animTimeout.current = setTimeout(() => {
      setSelectedIndex(newIndex);
      if (callback) callback();
    }, 600);
  };

  const handleHome = () => {
    if (onAnyNav) onAnyNav();
    closeSidenav();
    closeConfigurator();
    handleClick(0, onHomeClick);
  };

  const handleConfiguratorToggle = () => {
    if (onAnyNav) onAnyNav();
    closeSidenav();
    // toggle open state
    const willOpen = !openConfigurator;
    setOpenConfigurator(dispatch, willOpen);
    setSlideIndex(1);
    setSelectedIndex(1);
    if (onConfiguratorClick) onConfiguratorClick();
  };

  const handleProfile = () => {
    closeSidenav();
    closingByNav.current = true;
    closeConfigurator();
    handleClick(2);
    if (onProfileClick) onProfileClick();
  };

  const handleMiniToggle = () => {
    if (onAnyNav) onAnyNav();
    closingByNav.current = true;
    const newMini = !miniSidenav;
    setMiniSidenav(dispatch, newMini);
    closeConfigurator();
    const idx = newMini ? 0 : 3;
    handleClick(idx, () => {
      if (newMini) onHomeClick();
    });
  };

  const handleOpenMenu = (e) => setOpenMenu(e.currentTarget);
  const handleCloseMenu = () => setOpenMenu(null);

  useEffect(() => {
    return () => clearTimeout(animTimeout.current);
  }, []);

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          top: "auto",
          bottom: 30,
          left: 0,
          right: 0,
          backgroundColor: "transparent",
          pointerEvents: "none",
          zIndex: (t) => (isWeb ? t.zIndex.drawer - 1 : t.zIndex.drawer + 1),
        }}
      >
        <Toolbar
          sx={{
            p: 0,
            m: 0,
            width: "100%",
            pointerEvents: "auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              p: GAP,
              backdropFilter: "blur(20px)",
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.6)",
              borderRadius: "60px",
              boxShadow:
                "inset 4px 4px 10px rgba(0,0,0,0.4), inset -4px -4px 10px rgba(255,255,255,0.1), 0 6px 15px rgba(0,0,0,0.3)",
            }}
          >
            {/* Sliding active background */}
            <Box
              sx={{
                position: "absolute",
                top: GAP,
                left: `calc(${GAP} + ${slideIndex} * (${ITEM_SIZE}px + ${GAP}))`,
                width: ITEM_SIZE,
                height: ITEM_SIZE,
                borderRadius: "50%",
                transition: `left 600ms ease`,
                backdropFilter: "blur(12px)",
                background:
                  "linear-gradient(145deg, rgba(241,143,1,0.85) 0%, rgba(241,143,1,0.7) 100%)",
                border: "1px solid rgba(255, 255, 255, 0.4)",
                boxShadow:
                  "inset 0 0 10px rgba(255,255,255,0.4), 0 0 12px rgba(241,143,1,0.7)",
                pointerEvents: "none",
              }}
            />
            <BottomNavigation
              showLabels={false}
              value={navValue}
              sx={{
                background: "transparent",
                display: "flex",
                gap: GAP,
                p: 0,
                m: 0,
                '& .MuiBottomNavigationAction-root': {
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minWidth: 0,
                  padding: GAP,
                  borderRadius: "50%",
                  width: ITEM_SIZE,
                  height: ITEM_SIZE,
                },
                '& .MuiBottomNavigationAction-root svg': {
                  width: ICON_SIZE,
                  height: ICON_SIZE,
                  color: "#fff",
                },
              }}
            >
              <BottomNavigationAction icon={<HomeIcon />} onClick={handleHome} />
              <BottomNavigationAction
                icon={<AddLocationIcon />}
                onClick={handleConfiguratorToggle}
              />
              <BottomNavigationAction
                icon={<AccountCircleIcon />}
                onClick={handleProfile}
              />
              {!isDesktop && (
              <BottomNavigationAction
                icon={
                  miniSidenav ? <MenuOpenIcon /> : <MenuIcon />
                }
                onClick={handleMiniToggle}
              />
              )}
            </BottomNavigation>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={openMenu}
        open={Boolean(openMenu)}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        sx={{ mt: 2 }}
      >
        <NotificationItem
          icon={
            <Box component="span" sx={{ color: "#000" }}>
              email
            </Box>
          }
          title="Check new messages"
        />
        <NotificationItem
          icon={
            <Box component="span" sx={{ color: "#000" }}>
              podcasts
            </Box>
          }
          title="Manage Podcast sessions"
        />
        <NotificationItem
          icon={
            <Box component="span" sx={{ color: "#000" }}>
              shopping_cart
            </Box>
          }
          title="Payment completed"
        />
      </Menu>
    </>
  );
}
