import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import { NavLink, useLocation } from "react-router-dom";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Paper from "@mui/material/Paper";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import { createPortal } from "react-dom";
import { useTheme, lighten, darken } from "@mui/material/styles";
import { useMaterialUIController } from "../../context";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";

import MDBox from "../../components/MDBox";
import MDTypography from "../../components/MDTypography";
 
function FlyoutMenu({
  parentKey,
  childrenRoutes,
  hoveredMenuKey,
  onCloseFlyout,
  onMouseEnter,
  onMouseLeave,
  anchorRect,
  sidenavRef,
  isMobile,
  level = 1,
}) {
  const isOpen = hoveredMenuKey === parentKey;
  const theme = useTheme();
  const location = useLocation();
  const [controller] = useMaterialUIController();
  const { darkMode, transparentSidenav, whiteSidenav, sidenavColor } = controller;

  // Measure the sidenav for positioning & height
  const sidenavRect =
    sidenavRef?.current?.getBoundingClientRect() ||
    { top: 0, height: window.innerHeight };

  // Hover state for nested menus
  const [childHoveredKey, setChildHoveredKey] = useState(null);
  const [childAnchorRect, setChildAnchorRect] = useState(null);
  const closeTimeout = useRef(null);

  const submenuHorizontalOffset = -1;
  const submenuWidth = 220;

  if (!isOpen || !childrenRoutes?.length) return null;

  // Desktop positioning
  const top = anchorRect ? anchorRect.top + window.scrollY : 0;
  let left = anchorRect
    ? anchorRect.right + window.scrollX + submenuHorizontalOffset
    : 0;
  if (left + submenuWidth > window.innerWidth && anchorRect) {
    left = anchorRect.left + window.scrollX - submenuWidth - submenuHorizontalOffset;
  }

  // Colors
  const background = transparentSidenav
    ? "transparent"
    : whiteSidenav
      ? theme.palette.background.paper
      : darkMode
        ? theme.palette.sidenav?.[sidenavColor] || theme.palette.background.default
        : theme.palette[sidenavColor]?.main || theme.palette.background.default;

  const textColor =
    transparentSidenav || (whiteSidenav && !darkMode)
      ? theme.palette.text.primary
      : whiteSidenav && darkMode
        ? theme.palette.text.secondary
        : "#fff";

  const baseSidenavColor =
    (darkMode
      ? theme.palette.sidenav?.[sidenavColor] || theme.palette.background.default
      : theme.palette[sidenavColor]?.main) || theme.palette.primary.main;

  const hoverBackground = darkMode
    ? darken(baseSidenavColor, 0.2)
    : lighten(baseSidenavColor, 0.2);

  // Nested hover handlers
  const handleChildMouseEnter = (key, rect) => {
    clearTimeout(closeTimeout.current);
    setChildHoveredKey(key);
    setChildAnchorRect(rect);
    onMouseEnter?.(parentKey);
  };
  const handleChildMouseLeave = () => {
    closeTimeout.current = setTimeout(() => {
      setChildHoveredKey(null);
      setChildAnchorRect(null);
    }, 150);
  };

  return createPortal(
    <ClickAwayListener onClickAway={onCloseFlyout}>
      <Paper
        elevation={6}
        sx={{
          // Fixed positioning either full-screen (mobile) or alongside the sidenav (desktop)
          position: "fixed",
          top: isMobile ? 0 : sidenavRect.top + window.scrollY - -15,
          left: isMobile ? 0 : left,
          width: isMobile ? "100%" : submenuWidth,
          height: isMobile ? "100%" : sidenavRect.height - 30,
          zIndex: isMobile ? 1400 : 1300 + level * 10,

          // Flex layout: header + scrollable body
          display: "flex",
          flexDirection: "column",

          // Backdrop, blur, gradient, border, shadow, radius...
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          background: "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
          border: "1px solid rgba(243, 143, 1, 0.6)",
          boxShadow: "inset 4px 4px 10px rgba(0,0,0,0.4), inset -4px -4px 10px rgba(255,255,255,0.1), 0 6px 15px rgba(0,0,0,0.3)",
          borderRadius: "12px",
          color: textColor,

          // Hide Paper’s own scrollbar
          "&::-webkit-scrollbar": { width: 0, height: 0 },
          scrollbarWidth: "none",
          scrollbarColor: "transparent transparent",
          "-ms-overflow-style": "none",
        }}
        onMouseEnter={() => onMouseEnter?.(parentKey)}
        onMouseLeave={() => {
          handleChildMouseLeave();
          onMouseLeave?.(parentKey);
        }}
      >
        {/* —— Mobile Close Button Header —— */}
        {isMobile && (
          <Box
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 10,
              display: "flex",
              justifyContent: "flex-end",
              p: 1,
              background,
              borderBottom: 1,
              borderColor: "divider",
              borderTopLeftRadius: "12px",
              borderTopRightRadius: "12px",
            }}
          >
            <IconButton size="small" onClick={onCloseFlyout} sx={{ color: textColor }}>
              &times;
            </IconButton>
          </Box>
        )}

        {/* —— Scrollable Menu Body —— */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            "&::-webkit-scrollbar": { width: 0 },
          }}
        >
          <List disablePadding>
            {childrenRoutes.map(routeItem => {
              const { key, name, route: to = "#", icon, children, sx: routeSx = {} } = routeItem;
              const isActive = location.pathname === to;
              const isChildHovered = childHoveredKey === key;
              const hasCustomSx = Object.keys(routeSx).length > 0;

              return (
                <ListItem
                  key={key}
                  disablePadding
                  sx={{
                    position: hasCustomSx ? "sticky" : "relative",
                    top: hasCustomSx ? 0 : undefined,
                    zIndex: hasCustomSx ? 1 : undefined,
                    ...( !hasCustomSx && { "&:hover": { backgroundColor: hoverBackground } } ),
                    bgcolor: isActive ? theme.palette.action.selected : "inherit",
                    ...(hasCustomSx && !isMobile && { 
                      borderTopLeftRadius: "12px",
                      borderTopRightRadius: "12px",
                      overflow: "hidden",
                    }),
                    ...routeSx,
                  }}
                  onMouseEnter={e => handleChildMouseEnter(key, e.currentTarget.getBoundingClientRect())}
                  onMouseLeave={handleChildMouseLeave}
                >
                  <NavLink
                    to={to}
                    style={{
                      width: "100%",
                      textDecoration: "none",
                      color: isActive ? theme.palette.primary.main : textColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 16px",
                      userSelect: "none",
                      cursor: "pointer",
                    }}
                  >
                    <MDBox display="flex" alignItems="center" flexGrow={1}>
                      {icon && <MDBox mr={1}>{icon}</MDBox>}
                      <MDTypography
                        variant="body2"
                        fontWeight="regular"
                        sx={{ color: isActive ? theme.palette.primary.main : textColor }}
                      >
                        {name}
                      </MDTypography>
                    </MDBox>
                    {children && <MDTypography variant="body2" sx={{ color: textColor }}>▶</MDTypography>}
                  </NavLink>

                  {children && isChildHovered && (
                    <FlyoutMenu
                      parentKey={key}
                      childrenRoutes={children}
                      hoveredMenuKey={childHoveredKey}
                      onCloseFlyout={onCloseFlyout}
                      onMouseEnter={() => handleChildMouseEnter(key, childAnchorRect)}
                      onMouseLeave={handleChildMouseLeave}
                      anchorRect={childAnchorRect}
                      sidenavRef={sidenavRef}
                      isMobile={isMobile}
                      level={level + 1}
                    />
                  )}
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Paper>
    </ClickAwayListener>,
    document.body
  );
}

FlyoutMenu.propTypes = {
  parentKey: PropTypes.string.isRequired,
  childrenRoutes: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      route: PropTypes.string,
      icon: PropTypes.node,
      children: PropTypes.array,
      sx: PropTypes.object,
    })
  ).isRequired,
  hoveredMenuKey: PropTypes.string,
  onCloseFlyout: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  anchorRect: PropTypes.object,
  sidenavRef: PropTypes.object,
  isMobile: PropTypes.bool,
  level: PropTypes.number,
};

export default FlyoutMenu;
