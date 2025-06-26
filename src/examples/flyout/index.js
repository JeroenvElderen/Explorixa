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
  level = 1,
}) {
  const isOpen = hoveredMenuKey === parentKey;
  const theme = useTheme();
  const location = useLocation();
  const [controller] = useMaterialUIController();
  const { darkMode, transparentSidenav, whiteSidenav, sidenavColor } = controller;

  const [childHoveredKey, setChildHoveredKey] = useState(null);
  const [childAnchorRect, setChildAnchorRect] = useState(null);
  const closeTimeout = useRef(null);

  const submenuHorizontalOffset = -1; // <-- Changed from 8 to -1 to overlap menus and remove gap
  const submenuWidth = 220; // must match minWidth of Paper below

  if (!isOpen) return null;

  // Calculate the vertical position relative to viewport + scroll
  const top = anchorRect ? anchorRect.top + window.scrollY : 0;

  // Default submenu opens to the right of the anchorRect
  let left = anchorRect ? anchorRect.right + window.scrollX + submenuHorizontalOffset : 0;

  // Flip submenu to the left side if it would overflow viewport width
  const viewportWidth = window.innerWidth;
  if (left + submenuWidth > viewportWidth) {
    // Position submenu to the left of the parent menu item
    left = anchorRect
      ? anchorRect.left + window.scrollX - submenuHorizontalOffset - submenuWidth
      : 0;
  }

  // Background and text colors (same as before)
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

  const handleChildMouseEnter = (key, rect) => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setChildHoveredKey(key);
    setChildAnchorRect(rect);
    if (onMouseEnter) onMouseEnter(parentKey);
  };

  const handleChildMouseLeave = () => {
    closeTimeout.current = setTimeout(() => {
      setChildHoveredKey(null);
      setChildAnchorRect(null);
      closeTimeout.current = null;
    }, 150);
  };

  if (!childrenRoutes || !Array.isArray(childrenRoutes) || childrenRoutes.length === 0) return null;

  return createPortal(
    <ClickAwayListener onClickAway={onCloseFlyout}>
      <Paper
        elevation={6}
        sx={{
          background,
          color: textColor,
          borderRadius: theme.shape.borderRadius,
          boxShadow: theme.shadows[5],
          border: `1px solid ${theme.palette.divider}`,
          position: "absolute",
          top,
          left,
          minWidth: submenuWidth,
          zIndex: 1300 + level * 10, // higher zIndex for nested menus
          mt: 0.5,
          overflow: "hidden",
          userSelect: "none",
          maxHeight: "60vh",
          overflowY: "auto",
          userSelect: "none",
        }}
        onMouseEnter={() => {
          if (closeTimeout.current) {
            clearTimeout(closeTimeout.current);
            closeTimeout.current = null;
          }
          if (onMouseEnter) onMouseEnter(parentKey);
        }}
        onMouseLeave={() => {
          handleChildMouseLeave();
          if (onMouseLeave) onMouseLeave(parentKey);
        }}
      >
        <List disablePadding>
          {childrenRoutes.map(({ key, name, route = "#", icon, children }) => {
            const isActive = location.pathname === route;
            const isChildHovered = childHoveredKey === key;

            return (
              <ListItem
                key={key}
                disablePadding
                sx={{
                  position: "relative",
                  "&:hover": {
                    backgroundColor: hoverBackground,
                  },
                  bgcolor: isActive ? theme.palette.action.selected : "inherit",
                }}
                onMouseEnter={(e) =>
                  handleChildMouseEnter(key, e.currentTarget.getBoundingClientRect())
                }
                onMouseLeave={handleChildMouseLeave}
              >
                <NavLink
                  to={route}
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

                  {children && (
                    <MDTypography variant="body2" sx={{color: textColor }}>
                      ▶
                    </MDTypography>
                  )}
                </NavLink>

                {children && isChildHovered && (
                  <FlyoutMenu
                    parentKey={key}
                    childrenRoutes={children}
                    hoveredMenuKey={childHoveredKey}
                    onCloseFlyout={onCloseFlyout}
                    onMouseEnter={() => {
                      if (closeTimeout.current) {
                        clearTimeout(closeTimeout.current);
                        closeTimeout.current = null;
                      }
                      handleChildMouseEnter(key, childAnchorRect);
                    }}
                    onMouseLeave={handleChildMouseLeave}
                    anchorRect={childAnchorRect}
                    level={level + 1}
                  />
                )}
              </ListItem>
            );
          })}
        </List>
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
    })
  ).isRequired,
  hoveredMenuKey: PropTypes.string,
  onCloseFlyout: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  anchorRect: PropTypes.shape({
    top: PropTypes.number,
    right: PropTypes.number,
    left: PropTypes.number,
  }),
  level: PropTypes.number,
};

export default FlyoutMenu;
