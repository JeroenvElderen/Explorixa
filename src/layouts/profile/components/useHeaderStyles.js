// src/layouts/profile/components/useHeaderStyles.js
import { useTheme, useMediaQuery } from "@mui/material";
import { cardBase, avatarBase } from "./Header.styles";

export default function useHeaderStyles() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return {
    isMobile,
    card: { 
        ...cardBase,
        ...(isMobile && {
            mx: 0,
            position: "relative",
            width: "calc(100vw - 20px)",
            left: "50%",
            transform: "translateX(-50%)",
        }) 
    },
    avatar: {
      ...avatarBase,
      ...(isMobile && { width: 80, height: 80 }),
    },
    tabsOrientation: isMobile ? "vertical" : "horizontal",

    // Tweak: use transform to center the 100vw bar
    backgroundBox: isMobile
      ? {
          width: "100vw",
          position: "relative",
          left: "50%",
          transform: "translateX(-50%)",
          borderRadius: 0,
          marginTop: `-${theme.spacing(3)}`,
        }
      : {},
      contentPadding: isMobile ? theme.spacing(1.25) : theme.spacing(2),
  };
}
