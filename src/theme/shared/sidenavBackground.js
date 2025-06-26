// src/theme/shared/sidenavBackground.js
export default function getSidenavBackground(theme, { transparentSidenav, whiteSidenav, darkMode }) {
    const { palette, functions } = theme;
    const { transparent, gradients, white, background } = palette;
    const { linearGradient } = functions;
  
    if (transparentSidenav) return transparent.main;
    if (whiteSidenav) return white.main;
  
    return darkMode
      ? background.sidenav
      : linearGradient(gradients.dark.main, gradients.dark.state);
  }
  