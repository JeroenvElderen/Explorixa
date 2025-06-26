export default function getSidenavTextColor(theme, { transparentSidenav, whiteSidenav, darkMode }) {
    if (transparentSidenav || (whiteSidenav && !darkMode)) return theme.palette.text.primary;
    if (whiteSidenav && darkMode) return theme.palette.text.secondary;
    return "#fff";
  }
  