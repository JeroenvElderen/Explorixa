/**
=========================================================
* Material home 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-home-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState, useEffect, useMemo, Suspense } from "react";

// react-router components
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// @mui material components
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";

// Material home 2 React components
import MDBox from "./components/MDBox";

// Material home 2 React example components
import Sidenav from "./examples/Sidenav";
import Configurator from "./examples/Configurator";

// Material home 2 React themes
import theme from "./assets/theme";
import themeRTL from "./assets/theme/theme-rtl";

// Material home 2 React Dark Mode themes
import themeDark from "./assets/theme-dark";
import themeDarkRTL from "./assets/theme-dark/theme-rtl";

// RTL plugins
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

// Material home 2 React routes
import routes from "./routes";

// Material home 2 React contexts
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "./context";

// ** Import AuthProvider from your AuthContext.js (create it if you haven't) **
import { AuthProvider } from "./AuthContext";  // <-- make sure path is correct!

// Images
import brandWhite from "./assets/images/logo-ct.png";
import brandDark from "./assets/images/logo-ct-dark.png";

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
    // darkMode,  // no longer used
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();
  const showConfiguratorButton = pathname ==="/home";

  // Cache for the rtl
  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });

    setRtlCache(cacheRtl);
  }, []);

  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // Change the openConfigurator state
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  // Setting the dir attribute for the body element
  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const getRoutes = (allRoutes) =>
  allRoutes.flatMap((route) => {
    if (route.children) {
      return getRoutes(route.children);
    }

    if (route.route && route.component) {
  return <Route exact path={route.route} element={<route.component />} key={route.key} />;
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

  return direction === "rtl" ? (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={themeDarkRTL}>
        <CssBaseline />
        <AuthProvider>
          {layout === "home" && (
            <>
              <Sidenav
                color={sidenavColor}
                brand={(transparentSidenav) || whiteSidenav ? brandDark : brandDark}
                brandName="Material home 2"
                routes={routes}
                onMouseEnter={handleOnMouseEnter}
                onMouseLeave={handleOnMouseLeave}
              />
              
              {showConfiguratorButton && configsButton}
            </>
          )}
          {layout === "vr" }
          <Suspense fallback={<div style={{textAlign: "center", marginTop: 80 }}>Loading...</div>}>
          <Routes>
            {getRoutes(routes)}
            <Route path="*" element={<Navigate to="/home" />} />
          </Routes>
          </Suspense>
        </AuthProvider>
      </ThemeProvider>
    </CacheProvider>
  ) : (
    <ThemeProvider theme={themeDark}>
      <CssBaseline />
      <AuthProvider>
        {layout === "home" && (
          <>
            <Sidenav
              color={sidenavColor}
              brand={(transparentSidenav) || whiteSidenav ? brandDark : brandDark}
              brandName="Explorixa"
              routes={routes}
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
            />
            
            {/* {showConfiguratorButton && configsButton} */}
          </>
        )}
        {layout === "vr" }
        <Routes>
          {getRoutes(routes)}
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}
