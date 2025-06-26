// src/theme/shared/getHoverBackground.js
export default function getHoverBackground(theme, controller) {
    const { whiteSidenav, transparentSidenav, darkMode } = controller;
  
    if (transparentSidenav) {
      return theme.palette.action.hover;
    }
  
    if (whiteSidenav) {
      return theme.palette.grey[200];
    }
  
    return darkMode ? theme.palette.grey[800] : theme.palette.grey[700];
  }
  