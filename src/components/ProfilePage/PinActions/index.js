import React from "react";
import PropTypes from "prop-types";
import { IconButton } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FlagIcon from "@mui/icons-material/Flag";
import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";

const PinActions = ({
  isSaved,
  savedCount,
  onSave,
  isBeenThere,
  beenThereCount,
  onBeenThere,
  isWantToGo,
  wantToGoCount,
  onWantToGo,
}) => {
  return (
    <MDBox
      sx={{
        display: "flex",
        gap: 0.8,
        alignItems: "center",
        background: "rgba(255,255,255,0.08)",
        borderRadius: "12px",
        px: 1,
        py: 0.1,
        mt: 1,
      }}
    >
      {/* Been There */}
      <IconButton
        onClick={onBeenThere}
        size="small"
        sx={{
          color: "green",
          backgroundColor: isBeenThere ? "rgba(40,167,69,0.15)" : "transparent",
          "&:hover": { backgroundColor: "rgba(40,167,69,0.3)" },
        }}
      >
        {isBeenThere ? <FlagIcon fontSize="small" /> : <OutlinedFlagIcon fontSize="small" />}
      </IconButton>
      <MDTypography variant="button" sx={{ minWidth: 12 }}>
        {beenThereCount ?? 0}
      </MDTypography>

      {/* Want To Go */}
      <IconButton
        onClick={onWantToGo}
        size="small"
        sx={{
          color: "gold",
          backgroundColor: isWantToGo ? "rgba(255,215,0,0.12)" : "transparent",
          "&:hover": { backgroundColor: "rgba(255,215,0,0.22)" },
        }}
      >
        {isWantToGo ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
      </IconButton>
      <MDTypography variant="button" sx={{ minWidth: 12 }}>
        {wantToGoCount ?? 0}
      </MDTypography>

      {/* Saved */}
      <IconButton
        onClick={onSave}
        size="small"
        sx={{
          color: "error.main",
          backgroundColor: isSaved ? "rgba(241,143,1,0.12)" : "transparent",
          "&:hover": { backgroundColor: "rgba(241,143,1,0.22)" },
        }}
      >
        {isSaved ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
      </IconButton>
      <MDTypography variant="button" sx={{ minWidth: 12 }}>
        {savedCount ?? 0}
      </MDTypography>
    </MDBox>
  );
};

PinActions.propTypes = {
  isSaved: PropTypes.bool,
  savedCount: PropTypes.number,
  onSave: PropTypes.func,
  isBeenThere: PropTypes.bool,
  beenThereCount: PropTypes.number,
  onBeenThere: PropTypes.func,
  isWantToGo: PropTypes.bool,
  wantToGoCount: PropTypes.number,
  onWantToGo: PropTypes.func,
};

export default PinActions;
