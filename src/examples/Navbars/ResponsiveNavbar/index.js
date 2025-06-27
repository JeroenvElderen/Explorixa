// src/examples/Navbars/ResponsiveNavbar/index.js

import React, { useState } from "react";
import { Link } from "react-router-dom";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Menu from "@mui/material/Menu";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";

import HomeIcon from "@mui/icons-material/Home";
import { AddLocation } from "@mui/icons-material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { IconButton, Icon } from "@mui/material";

import {
  useMaterialUIController,
  setMiniSidenav,
  setOpenConfigurator,
} from "../../../context";
import NotificationItem from "../../../examples/Items/NotificationItem";
import { navbarMobileMenu } from "./styles";

const iconsStyle = ({ palette: { white } }) => ({
  color: white.main,
});

export default function ResponsiveNavbar({ onHomeClick, onConfiguratorClick }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, openConfigurator } = controller;

  // **Internal** selected‐tab state
  const [selected, setSelected] = useState(0);
  const [openMenu, setOpenMenu] = useState(null);

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only("xs"));

  const handleOpenMenu = (e) => setOpenMenu(e.currentTarget);
  const handleCloseMenu = () => setOpenMenu(null);

  const handleHome = () => {
    setSelected(0);
    onHomeClick();
  };

  const handleConfiguratorToggle = () => {
    setSelected(1);
    onConfiguratorClick();
  };

  const handleProfile = () => {
    setSelected(2);
  };

  const handleMiniToggle = () => {
    const newMini = !miniSidenav;
    setMiniSidenav(dispatch, newMini);

    if (!newMini) {
      // just expanded
      setSelected(3);
    } else {
      // just collapsed
      setSelected(0);
      onHomeClick();
    }
  };

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
          width: "100%",
          backgroundColor: "transparent",
          pointerEvents: "none",
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
      >
        <Toolbar
          sx={{
            p: 0,
            m: 0,
            width: "100%",
            pointerEvents: "auto",
            justifyContent: "center",
            "& .MuiBottomNavigation-root": {
              marginRight: openConfigurator ? "200px" : 0,
            }
          }}
        >
          <BottomNavigation
            showLabels={false}
            value={selected}
            sx={{
              backgroundColor: "rgb(33,40,60)",
              borderRadius: "50px",
              display: "flex",
              gap: theme.spacing(0.5),
              px: theme.spacing(1),
              "& svg": { color: "#fff" },
              "& .MuiBottomNavigationAction-root": {
                minWidth: 0,
                padding: theme.spacing(1.5),
                margin: 1,
              },
              "& .Mui-selected": {
                backgroundColor: "#F18F01",
                borderRadius: "50%",
                color: theme.palette.primary.contrastText,
              },
              ml: openConfigurator ? "00px" : 0,
              transition: "margin-right 300ms ease-in-out",
            }}
          >
            {/* Home */}
            <BottomNavigationAction
              icon={<HomeIcon sx={{ height: 22, width: "auto" }} />}
              onClick={handleHome}
              selected={selected === 0}
            />

            {/* Add Location */}
            <BottomNavigationAction
              icon={<AddLocation sx={{ height: 22, width: "auto" }} />}
              onClick={handleConfiguratorToggle}
              selected={selected === 1}
            />

            {/* Profile */}
            <BottomNavigationAction
              icon={<AccountCircleIcon sx={{ height: 22, width: "auto" }} />}
              component={Link}
              to="/profile"
              onClick={handleProfile}
              selected={selected === 2}
            />

            {/* Hamburger */}
            <BottomNavigationAction
              icon={
                <IconButton
                  size="small"
                  disableRipple
                  color="inherit"
                  sx={navbarMobileMenu}
                  onClick={handleMiniToggle}
                >
                  <Icon sx={iconsStyle} fontSize="medium">
                    {miniSidenav ? "menu_open" : "menu"}
                  </Icon>
                </IconButton>
              }
              selected={selected === 3}
            />
          </BottomNavigation>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={openMenu}
        open={Boolean(openMenu)}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        sx={{ mt: 2 }}
      >
        <NotificationItem icon={<Icon>email</Icon>} title="Check new messages" />
        <NotificationItem icon={<Icon>podcasts</Icon>} title="Manage Podcast sessions" />
        <NotificationItem icon={<Icon>shopping_cart</Icon>} title="Payment completed" />
      </Menu>
    </>
  );
}
