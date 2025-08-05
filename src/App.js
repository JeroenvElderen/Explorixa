/**
=========================================================
* Material home 2 React - v2.2.0
=========================================================
*/

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// @mui material
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";
import CircularProgress from "@mui/material/CircularProgress";

// App components
import MDBox from "./components/MDBox";
import Sidenav from "./examples/Sidenav";
import Configurator from "./examples/Configurator";

// Images
import brandWhite from "./assets/images/logo-ct.png";
import brandDark from "./assets/images/logo-ct-dark.png";

// Themes
import theme from "./assets/theme";
import themeRTL from "./assets/theme/theme-rtl";
import themeDark from "./assets/theme-dark";
import themeDarkRTL from "./assets/theme-dark/theme-rtl";

// RTL
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

// Routes
import routes from "./routes";

// Context
import {
  useMaterialUIController,
  setMiniSidenav,
  setOpenConfigurator,
} from "./context";
import { AuthProvider } from "./AuthContext";

// Framer Motion
import { AnimatePresence } from "framer-motion";
import PageWrapper from "./components/PageWrapper"; // wraps for playOnVisible

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();
  const showConfiguratorButton = pathname === "/home";

  // Prefetch lazy chunks on idle
  useEffect(() => {
    import(/* webpackPrefetch: true */ "components/StarFieldOverall");
    import(
      /* webpackPrefetch: true */ "layouts/dashboard/components/ProjectsContinent"
    );
    import(
      /* webpackPrefetch: true */ "./components/continent/RecentPinsGrid"
    );
  }, []);

  // RTL Cache
  useMemo(() => {
    const cacheRtl = createCache({ key: "rtl", stylisPlugins: [rtlPlugin] });
    setRtlCache(cacheRtl);
  }, []);

  // Sidenav hover handlers
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // Configurator toggler
  const handleConfiguratorOpen = () =>
    setOpenConfigurator(dispatch, !openConfigurator);

  // Body dir attribute
  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  // Scroll to top on navigation
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [pathname]);

  // Build route elements
  const getRoutes = (allRoutes) =>
    allRoutes.flatMap((route) => {
      if (route.children) return getRoutes(route.children);
      if (route.route && route.component) {
        return (
          <Route
            exact
            path={route.route}
            key={route.key}
            element={<PageWrapper>{<route.component />}</PageWrapper>}
          />
        );
      }
      return [];
    });

  // Loading spinner for Suspense
  function LoadingSpinner() {
    return (
      <div style={{ textAlign: "center", marginTop: 80 }}>
        <CircularProgress color="info" size={40} />
      </div>
    );
  }

  // Render routes under Suspense + AnimatePresence
  const renderRoutes = () => (
    <Suspense fallback={<LoadingSpinner />}>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={pathname} key={pathname}>
          {getRoutes(routes)}
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );

  // Configurator button
  const configsButton = (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.25rem"
      height="3.25rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right="2rem"
      bottom="2rem"
      zIndex={99}
      color="dark"
      sx={{ cursor: "pointer" }}
      onClick={handleConfiguratorOpen}
    >
      <Icon fontSize="small" color="inherit">
        {pathname === "/home" ? "place" : "settings"}
      </Icon>
    </MDBox>
  );

  // RTL layout
  if (direction === "rtl") {
    return (
      <CacheProvider value={rtlCache}>
        <ThemeProvider theme={themeDarkRTL}>
          <CssBaseline />
          <AuthProvider>
            {layout === "home" && (
              <>
                <Sidenav
                  color={sidenavColor}
                  brand={
                    transparentSidenav || whiteSidenav
                      ? brandDark
                      : brandDark
                  }
                  brandName="Explorixa"
                  routes={routes}
                  onMouseEnter={handleOnMouseEnter}
                  onMouseLeave={handleOnMouseLeave}
                />
                {showConfiguratorButton && configsButton}
              </>
            )}
            {renderRoutes()}
          </AuthProvider>
        </ThemeProvider>
      </CacheProvider>
    );
  }

  // LTR layout
  return (
    <ThemeProvider theme={themeDark}>
      <CssBaseline />
      <AuthProvider>
        {layout === "home" && (
          <>
            <Sidenav
              color={sidenavColor}
              brand={
                transparentSidenav || whiteSidenav
                  ? brandDark
                  : brandDark
              }
              brandName="Explorixa"
              routes={routes}
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
            />
            {/* {showConfiguratorButton && configsButton} */}
          </>
        )}
        {renderRoutes()}
      </AuthProvider>
    </ThemeProvider>
  );
}
