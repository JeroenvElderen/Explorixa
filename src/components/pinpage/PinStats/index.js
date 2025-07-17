// src/components/PinStats.js
import React from "react";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import { useTheme, useMediaQuery } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import FlagIcon from "@mui/icons-material/Flag";
import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import MDTypography from "../../MDTypography";

export function PinStats({ beenThere, wantToGo, savedCount, onToggleBeen, onToggleWant, onToggleSave, isBeen, isWant, isSaved, iconOnly = false }) {
    
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const actions = [
    {
      icon: isBeen ? <FlagIcon sx={{ color: "green" }} /> : <OutlinedFlagIcon sx={{ color: "green" }} />,
      count: beenThere,
      label: "Been here",
      onClick: onToggleBeen,
    },
    {
      icon: isWant ? <StarIcon sx={{ color: "gold" }} /> : <StarBorderIcon sx={{ color: "gold" }} />,
      count: wantToGo,
      label: "Want to go",
      onClick: onToggleWant,
    },
    {
      icon: isSaved ? <FavoriteIcon /> : <FavoriteBorderIcon />,
      count: savedCount,
      label: "Saved",
      onClick: onToggleSave,
    },
  ];

  return (
    <Grid 
        container 
        spacing={2} 
        direction="row"
        wrap="nowrap"
        justifyContent={isMobile ? "space-between" : "flex-end" }
        sx={{ width: iconOnly ? "auto" : "100%" }}
        >
      {actions.map((action, i) => (
        <Grid key={i} item textAlign="center">
          <IconButton
            size="large"
            onClick={action.onClick}
            sx={action.label === "Saved" ? { color: "error.main" } : undefined}
          >
            {action.icon}
          </IconButton>
          {!iconOnly && (
            <>
          <MDTypography variant="h5">{action.count}</MDTypography>
          <MDTypography variant="caption">{action.label}</MDTypography>
          </>
          )}
        </Grid>
      ))}
    </Grid>
  );
}

PinStats.propTypes = {
  beenThere:    PropTypes.number.isRequired,
  wantToGo:     PropTypes.number.isRequired,
  savedCount:   PropTypes.number.isRequired,
  onToggleBeen: PropTypes.func.isRequired,
  onToggleWant: PropTypes.func.isRequired,
  onToggleSave: PropTypes.func.isRequired,
  isBeen:       PropTypes.bool.isRequired,
  isWant:       PropTypes.bool.isRequired,
  isSaved:      PropTypes.bool.isRequired,
};
