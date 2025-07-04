import React, { useState } from "react";
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
import MapIcon from "@mui/icons-material/Map";
import { useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";

import {
  useMaterialUIController,
  setMiniSidenav,
  setOpenConfigurator,
} from "../../../context";
import NotificationItem from "../../../examples/Items/NotificationItem";

export default function SimpleResponsiveNavbar({
  onHomeClick,
  onConfiguratorClick,
  onProfileClick,
  onAnyNav,
  poiClicked,
}) {
  const navigate = useNavigate();
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, openConfigurator } = controller;

  // dropdown menu state
  const [openMenu, setOpenMenu] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:1199.95px)");
  const isDesktop = !isMobile;

  const ICON_SIZE = 24;
  const GAP = theme.spacing(1);
  const ITEM_SIZE = 56;

  // helpers
  const closeSidenav = () => {
    if (!miniSidenav) setMiniSidenav(dispatch, true);
  };
  const closeConfigurator = () => {
    if (openConfigurator) setOpenConfigurator(dispatch, false);
  };

  if (isDesktop) {
  return (
    <AppBar position="fixed" elevation={0} sx={{ top: 16, right: 16, width: "auto", pointerEvents: "auto", background: "transparent", boxShadow: "none" }}>
      <IconButton
        onClick={() => {
          onAnyNav?.();
          closeConfigurator();
          onConfiguratorClick?.();
        }}
        sx={{
          bgcolor: "rgba(255,255,255,0.2)",
          "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
        }}
      >
        <AddLocationIcon sx={{ color: "#fff" }} />
      </IconButton>
    </AppBar>
  );
}

  const handleNavClick = (actionFn) => {
    onAnyNav?.();
    closeConfigurator();
    closeSidenav();
    actionFn();
  };

  const actions = [
    {
      icon: <HomeIcon />,
      onClick: () =>
        handleNavClick(() => {
          onHomeClick?.();
          navigate("/");
        }),
    },
    {
      icon: <MapIcon />,
      onClick: () =>
        handleNavClick(() => {
          navigate("/map");
        }),
    },
    {
      icon: <AddLocationIcon />,
      onClick: () =>
        handleNavClick(() => {
          onConfiguratorClick?.();
          navigate("/map");
        }),
    },
    {
      icon: <AccountCircleIcon />,
      onClick: () =>
        handleNavClick(() => {
          onProfileClick?.();
          navigate("/profile");
        }),
    },
    {
      icon: miniSidenav ? <MenuOpenIcon /> : <MenuIcon />,
      onClick: () => {
        onAnyNav?.();
        setMiniSidenav(dispatch, !miniSidenav);
        closeConfigurator();
      },
    },
  ];

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
          zIndex: (t) => t.zIndex.drawer - 1,
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
              display: "flex",
              gap: GAP,
              p: GAP,
              backdropFilter: "blur(20px)",
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)",
              border: "1px solid rgba(243, 143, 1, 0.6)",
              borderRadius: "60px",
              boxShadow:
                "inset 4px 4px 10px rgba(0,0,0,0.4), inset -4px -4px 10px rgba(255,255,255,0.1), 0 6px 15px rgba(0,0,0,0.3)",
            }}
          >
            <BottomNavigation
              showLabels={false}
              sx={{
                background: "transparent",
                display: "flex",
                gap: GAP,
                p: 0,
                m: 0,
              }}
            >
              {actions.map((action, idx) => (
                <BottomNavigationAction
                  key={idx}
                  icon={action.icon}
                  onClick={action.onClick}
                  sx={{
                    minWidth: 0,
                    padding: GAP,
                    borderRadius: "50%",
                    width: ITEM_SIZE,
                    height: ITEM_SIZE,
                    "& svg": { width: ICON_SIZE, height: ICON_SIZE, color: "#fff" },
                    "&:hover": {
                      backdropFilter: "blur(12px)",
                      background:
                        "linear-gradient(145deg, rgba(241,143,1,0.85) 0%, rgba(241,143,1,0.7) 100%)",
                      border: "1px solid rgba(255,255,255,0.4)",
                      boxShadow:
                        "inset 0 0 10px rgba(255,255,255,0.4), 0 0 12px rgba(241,143,1,0.7)",
                    },
                  }}
                />
              ))}
            </BottomNavigation>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={openMenu}
        open={Boolean(openMenu)}
        onClose={() => setOpenMenu(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        sx={{ mt: 2 }}
      >
        <NotificationItem
          icon={<Box component="span" sx={{ color: "#000" }}>email</Box>}
          title="Check new messages"
        />
        <NotificationItem
          icon={<Box component="span" sx={{ color: "#000" }}>podcasts</Box>}
          title="Manage Podcast sessions"
        />
        <NotificationItem
          icon={<Box component="span" sx={{ color: "#000" }}>shopping_cart</Box>}
          title="Payment completed"
        />
      </Menu>
    </>
  );
}
