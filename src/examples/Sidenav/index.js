import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, NavLink } from "react-router-dom";
import PropTypes from "prop-types";

// MUI components
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";

// Custom components
import MDBox from "../../components/MDBox";
import MDTypography from "../../components/MDTypography";
import MDButton from "../../components/MDButton";
import SidenavCollapse from "../../examples/Sidenav/SidenavCollapse";
import SidenavRoot from "../../examples/Sidenav/SidenavRoot";
import sidenavLogoLabel from "../../examples/Sidenav/styles/sidenav";
import FlyoutMenu from "../../examples/flyout";

// Context & Auth
import {
  useMaterialUIController,
  setMiniSidenav,
  setTransparentSidenav,
  setWhiteSidenav,
} from "../../context";

import { useAuth } from "../../AuthContext";
import { supabase } from "../../SupabaseClient";

function Sidenav({ color="info", brand="", brandName, routes, ...rest }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode } = controller;
  const location = useLocation();

  const { user } = useAuth();
  const isAuthenticated = Boolean(user);

  const hoverTimeoutRef = useRef(null);

  // Track flyout hovered menu key and open collapsible menus
  const [hoveredMenuKey, setHoveredMenuKey] = useState(null);
  const [openMenus, setOpenMenus] = useState({});

  // Map of refs for flyout menus by their keys
  const flyoutRefs = useRef({});

  // Determine text color based on theme & sidenav styles
  let textColor = "white";
  if (transparentSidenav || (whiteSidenav && !darkMode)) textColor = "dark";
  else if (whiteSidenav && darkMode) textColor = "inherit";

  // Responsive sidenav handling
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 1200;
      setMiniSidenav(dispatch, isMobile);
      setTransparentSidenav(dispatch, !isMobile && transparentSidenav);
      setWhiteSidenav(dispatch, !isMobile && whiteSidenav);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch, transparentSidenav, whiteSidenav]);

  // Filter routes depending on authentication status
  const filteredRoutes = useMemo(() => {
    return routes.filter((route) => {
      // Hide sign-in/sign-up when authenticated
      if ((route.key === "sign-in" || route.key === "sign-up") && isAuthenticated) return false;

      // Hide certain routes when not authenticated
      if (
        !isAuthenticated &&
        ["billing", "rtl", "notifications", "tables", "profile"].includes(route.key)
      ) return false;

      return true;
    });
  }, [routes, isAuthenticated]);

  // Toggle open state for collapsible menus (non-flyout)
  const toggleMenu = (key) => {
    setOpenMenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Logout handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/sign-in";
  };

  // Flyout menu mouse handlers (with debounce for smooth UX)
  const onMouseEnterMenu = (key) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredMenuKey(key);
  };

  const onMouseLeaveMenu = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredMenuKey(null);
      hoverTimeoutRef.current = null;
    }, 200);
  };

  // Recursive function to render collapsible routes with flyout support
  const renderCollapse = (route, level = 0) => {
    const { name, icon, noCollapse, key, href, route: routePath, children, flyout } = route;

    const hasChildren = Array.isArray(children) && children.length > 0;
    const isFlyout = flyout === true;

    // Ensure a ref exists for this flyout key
    if (isFlyout && !flyoutRefs.current[key]) {
      flyoutRefs.current[key] = React.createRef();
    }

    console.log(children)
   



    return (
      <div
        key={key}
        ref={isFlyout ? flyoutRefs.current[key] : null} // Attach ref for flyout menus
        style={{ position: "relative", paddingLeft: level * 16 }}
        onMouseEnter={() => isFlyout && onMouseEnterMenu(key)}
        onMouseLeave={() => isFlyout && onMouseLeaveMenu()}
      >
        {href ? (
  <Link href={href} target="_blank" rel="noreferrer" sx={{ textDecoration: "none" }}>
    <SidenavCollapse name={name} icon={icon} noCollapse={noCollapse} />
  </Link>
) : (
  <NavLink
  to={routePath || "#"}
  onClick={(e) => {
    if (hasChildren && !routePath) {
      // Only prevent click if there's no route
      e.preventDefault();
      toggleMenu(key);
    }
  }}
  style={{ textDecoration: "none" }}
>
  <SidenavCollapse
    name={name}
    icon={icon}
    active={location.pathname === routePath}
    noCollapse={noCollapse}
  />
</NavLink>
)}


        {/* Normal collapsible children */}
        {hasChildren && !isFlyout && openMenus[key] && (
  <MDBox
    sx={{
      ...(level >= 2
        ? {
            maxHeight: 200,
            overflowY: "auto",
            paddingRight: 1,
            marginLeft: 2,
          }
        : {
            paddingLeft: 2,
          }),
    }}
  >
    <List disablePadding>
      {children.map((child) => renderCollapse(child, level + 1))}
    </List>
  </MDBox>
)}



        {/* Flyout children */}
        {isFlyout && children && hoveredMenuKey === key && (
  <FlyoutMenu
    parentKey={key}
    childrenRoutes={children}
    hoveredMenuKey={hoveredMenuKey}
    onCloseFlyout={() => setHoveredMenuKey(null)}
    onHoverMenu={onMouseEnterMenu}
    onMouseLeave={onMouseLeaveMenu}
    anchorRect={flyoutRefs.current[key]?.current?.getBoundingClientRect()}
    level={level}
  />
)}

      </div>
    );
  };

  // Render all routes based on their type
  const renderRoutes = useMemo(() => {
    return filteredRoutes.map(({ type, key, title }) => {
      if (type === "collapse") {
        const route = filteredRoutes.find((r) => r.key === key);
        return renderCollapse(route);
      }
      if (type === "title") {
        return (
          <MDTypography
            key={key}
            color={textColor}
            display="block"
            variant="caption"
            fontWeight="bold"
            textTransform="uppercase"
            pl={3}
            mt={2}
            mb={1}
            ml={1}
          >
            {title}
          </MDTypography>
        );
      }
      if (type === "divider") {
        return (
          <Divider
            key={key}
            light={
              (!darkMode && !whiteSidenav && !transparentSidenav) ||
              (darkMode && !transparentSidenav && whiteSidenav)
            }
          />
        );
      }
      return null;
    });
  }, [
    filteredRoutes,
    location.pathname,
    textColor,
    darkMode,
    whiteSidenav,
    transparentSidenav,
    openMenus,
    hoveredMenuKey,
  ]);

  // Close sidenav on small screens
  const closeSidenav = () => setMiniSidenav(dispatch, true);

  return (
    <SidenavRoot
      {...rest}
      variant="permanent"
      ownerState={{ transparentSidenav, whiteSidenav, miniSidenav, darkMode }}
    >
      <MDBox pt={3} pb={1} px={4} textAlign="center" position="relative">
        <MDBox
          display={{ xs: "block", xl: "none" }}
          position="absolute"
          top={0}
          right={0}
          p={1.625}
          onClick={closeSidenav}
          sx={{ cursor: "pointer" }}
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

      <Divider
        light={
          (!darkMode && !whiteSidenav && !transparentSidenav) ||
          (darkMode && !transparentSidenav && whiteSidenav)
        }
      />

      <List>{renderRoutes}</List>

      {isAuthenticated && (
        <MDBox px={2} pb={2}>
          <MDButton variant="outlined" color="error" fullWidth onClick={handleLogout}>
            <Icon sx={{ mr: 1 }}>logout</Icon>
            Logout
          </MDButton>
        </MDBox>
      )}
    </SidenavRoot>
  );
}

Sidenav.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "dark",
  ]),
  brand: PropTypes.string,
  brandName: PropTypes.string.isRequired,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidenav;
