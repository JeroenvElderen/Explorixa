import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

// MUI components
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

// Custom components
import MDBox from "../../components/MDBox";
import MDTypography from "../../components/MDTypography";
import MDButton from "../../components/MDButton";
import SidenavCollapse from "../../examples/Sidenav/SidenavCollapse";
import SidenavRoot from "../../examples/Sidenav/SidenavRoot";
import sidenavLogoLabel from "../../examples/Sidenav/styles/sidenav";
import UserSearchBar from "components/Search/UserSearchBar";

// Context & Auth
import { useMaterialUIController } from "../../context";
import { useAuth } from "../../AuthContext";
import { supabase } from "../../SupabaseClient";

// Utility: build flat map of route depths
function buildKeyLevels(routes, level = 0, map = {}) {
  routes.forEach((r) => {
    map[r.key] = level;
    if (Array.isArray(r.children)) {
      buildKeyLevels(r.children, level + 1, map);
    }
  });
  return map;
}

export default function Sidenav({ color = "info", brand = "", brandName, routes, ...rest }) {
  // Always fully expanded
  const [controller] = useMaterialUIController();
  const { transparentSidenav, whiteSidenav, darkMode } = controller;
  const miniSidenav = false;

  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const sidenavRef = useRef(null);

  const keyLevels = useMemo(() => buildKeyLevels(routes), [routes]);
  const [openMenus, setOpenMenus] = useState({});

  // Determine text color based on theme
  let textColor = "white";
  if (transparentSidenav || (whiteSidenav && !darkMode)) textColor = "dark";
  else if (whiteSidenav && darkMode) textColor = "inherit";

  // Filter routes based on authentication
  const filteredRoutes = useMemo(
    () =>
      routes.filter((route) => {
        if ((route.key === "sign-in" || route.key === "sign-up") && isAuthenticated) return false;
        if (!isAuthenticated && ["billing", "rtl", "notifications", "tables", "profile"].includes(route.key))
          return false;
        return true;
      }),
    [routes, isAuthenticated]
  );

  // Toggle submenu open/close
  const toggleMenu = (key) => {
    const level = keyLevels[key];

    if (level === 1 && sidenavRef.current) {
      sidenavRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }

    setOpenMenus((prev) => {
      const next = { ...prev };
      Object.keys(prev).forEach((k) => {
        if (k !== key && keyLevels[k] === level) next[k] = false;
      });
      next[key] = !prev[key];
      return next;
    });
  };

  // Sign out
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/sign-in";
  };

  // Render each nav item (with optional children)
  const renderCollapse = (route, level = 0, parentKey = null) => {
    const { name, icon, noCollapse, key, href, route: routePath, children, sx = {} } = route;
    const hasChildren = Array.isArray(children) && children.length > 0;
    const isOpen = !!openMenus[key];
    const isParentOpen = parentKey && openMenus[parentKey];
    const childBackground = isParentOpen ? "rgba(241,143,1,0.2)" : undefined;

    return (
      <div key={key} style={{ position: "relative", paddingLeft: level > 1 ? 0 : 0 }}>
        {href ? (
          <Link href={href} target="_blank" rel="noreferrer" sx={{ textDecoration: "none" }}>
            <SidenavCollapse
              name={name}
              icon={icon}
              active={isOpen}
              noCollapse={noCollapse}
              sx={{
                ...sx,
                backgroundColor: level >= 2 ? childBackground : undefined,
                color: "white",
              }}
            />
          </Link>
        ) : (
          <NavLink
            to={routePath || "#"}
            onClick={(e) => {
              if (hasChildren) {
                e.preventDefault();
                toggleMenu(key);
              } else if (routePath) {
                navigate(routePath);
              }
            }}
            style={{ textDecoration: "none" }}
          >
            <SidenavCollapse
              name={name}
              icon={icon}
              active={isOpen}
              noCollapse={noCollapse}
              sx={{
                ...sx,
                backgroundColor: level >= 2 ? childBackground : undefined,
                color: "#fff",
                "& .MuiSvgIcon-root": isOpen ? { color: "#F18F01" } : undefined,
              }}
            />
          </NavLink>
        )}

        {hasChildren && isOpen && (
          <MDBox sx={{ paddingLeft: 0 }}>
            <List disablePadding>
              {children.map((child) => renderCollapse(child, level + 1, key))}
            </List>
          </MDBox>
        )}
      </div>
    );
  };

  // Build the full nav list
  const renderRoutes = useMemo(
    () => filteredRoutes.map((r) => (r.type === "collapse" ? renderCollapse(r) : null)),
    [filteredRoutes, openMenus]
  );

  // No-op for close
  const closeSidenav = () => {};

  return (
    <SidenavRoot
      {...rest}
      variant="permanent"
      ownerState={{ transparentSidenav, whiteSidenav, miniSidenav, darkMode }}
      sx={{
        zIndex: 1201,
        "& .MuiDrawer-paper": {
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          background: "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
          border: "1px solid rgba(243, 143, 1, 0.6)",
          boxShadow:
            "inset 4px 4px 10px rgba(0,0,0,0.4), inset -4px -4px 10px rgba(255,255,255,0.1), 0 6px 15px rgba(0,0,0,0.3)",
          borderRadius: "12px",
          overflow: "auto",
          ...(isMobile && { zIndex: 1000, height: "78vh", top: 0 }),
        },
      }}
    >
      {/* Brand / logo */}
      <MDBox pt={3} pb={1} px={4} textAlign="center" position="relative">
        <MDBox
          display={{ xs: "block", lg: "none" }}
          position="absolute"
          top={0}
          right={0}
          p={1.625}
          sx={{ cursor: "pointer" }}
          onClick={closeSidenav}
        >
          <MDTypography variant="h6" color="secondary">
            <Icon sx={{ fontWeight: "bold" }}>close</Icon>
          </MDTypography>
        </MDBox>
        <MDBox component={NavLink} to="/" display="flex" alignItems="center" sx={{ textDecoration: "none" }}>
          {brand && <MDBox component="img" src={brand} alt="Brand" width="2rem" />}
          <MDBox width={!brandName ? "100%" : "auto"} sx={(theme) => sidenavLogoLabel(theme, { miniSidenav })}>
            <MDTypography component="h6" variant="button" fontWeight="medium" color={textColor}>
              {brandName}
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>

      {/* Search bar */}
      <MDBox px={3} py={1}>
        <UserSearchBar />
      </MDBox>

      <Divider
        light={
          (!darkMode && !whiteSidenav && !transparentSidenav) ||
          (darkMode && !transparentSidenav && whiteSidenav)
        }
      />

      {/* Navigation items */}
      <List>{renderRoutes}</List>

      {/* Logout */}
      {isAuthenticated && (
        <MDBox px={2} pb={2}>
          <MDButton variant="outlined" color="error" fullWidth onClick={handleLogout}>
            <Icon sx={{ mr: 1 }}>logout</Icon> Logout
          </MDButton>
        </MDBox>
      )}
    </SidenavRoot>
  );
}

Sidenav.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  brand: PropTypes.string,
  brandName: PropTypes.string.isRequired,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};
