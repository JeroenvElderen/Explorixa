/**
=========================================================
* Material home 2 React - v2.2.0
=========================================================
...
*/

// Standard imports
import { useState, useEffect, useMemo, Suspense } from "react";
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
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "./context";
import { AuthProvider } from "./AuthContext";

// Images
import brandWhite from "./assets/images/logo-ct.png";
import brandDark from "./assets/images/logo-ct-dark.png";

// Framer Motion
import { AnimatePresence } from "framer-motion";
import PageWrapper from "./components/PageWrapper"; // <-- Add this file!

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

  // RTL Cache
  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });
    setRtlCache(cacheRtl);
  }, []);

  // Mini sidenav mouse events
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

  // Configurator open/close
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  // Set RTL direction on body
  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  // Animate scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [pathname]);

  // Route components mapping
  const getRoutes = (allRoutes) =>
    allRoutes.flatMap((route) => {
      if (route.children) {
        return getRoutes(route.children);
      }
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

  const isMapPage = pathname.toLowerCase() === "/home";

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
        {isMapPage ? "place" : "settings"}
      </Icon>
    </MDBox>
  );

  // --- RTL layout ---
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
                  brand={transparentSidenav || whiteSidenav ? brandDark : brandDark}
                  brandName="Material home 2"
                  routes={routes}
                  onMouseEnter={handleOnMouseEnter}
                  onMouseLeave={handleOnMouseLeave}
                />
                {showConfiguratorButton && configsButton}
              </>
            )}
            {layout === "vr"}
            <Suspense
              fallback={
                <div style={{ textAlign: "center", marginTop: 80 }}>
                  <CircularProgress color="info" size={40} />
                </div>
              }
            >
              <AnimatePresence mode="wait" initial={false}>
                <Routes location={pathname} key={pathname}>
                  {getRoutes(routes)}
                  <Route path="*" element={<Navigate to="/home" />} />
                </Routes>
              </AnimatePresence>
            </Suspense>
          </AuthProvider>
        </ThemeProvider>
      </CacheProvider>
    );
  }

  // --- LTR layout ---
  return (
    <ThemeProvider theme={themeDark}>
      <CssBaseline />
      <AuthProvider>
        {layout === "home" && (
          <>
            <Sidenav
              color={sidenavColor}
              brand={transparentSidenav || whiteSidenav ? brandDark : brandDark}
              brandName="Explorixa"
              routes={routes}
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
            />
            {/* {showConfiguratorButton && configsButton} */}
          </>
        )}
        {layout === "vr"}
        <Suspense
          fallback={
            <div style={{ textAlign: "center", marginTop: 80 }}>
              <CircularProgress color="info" size={40} />
            </div>
          }
        >
          <AnimatePresence mode="wait" initial={false}>
            <Routes location={pathname} key={pathname}>
              {getRoutes(routes)}
              <Route path="*" element={<Navigate to="/home" />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  );
}
