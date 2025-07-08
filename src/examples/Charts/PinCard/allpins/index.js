import React from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import DOMPurify from "dompurify";
import Divider from "@mui/material/Divider";
import FlagIcon from "@mui/icons-material/Flag";
import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

const GlassCard = styled(Card)(({ theme }) => ({
  position: "relative",
  display: "flex",
  flexDirection: "row",
  height: "135px",
  alignItems: "stretch",
  backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        background:
          "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
        border: "1px solid rgba(243, 143, 1, 0.6)",
        boxShadow:
          "inset 4px 4px 10px rgba(0,0,0,0.4), inset -4px -4px 10px rgba(255,255,255,0.1), 0 6px 15px rgba(0,0,0,0.3)",
        borderRadius: "12px",
  overflow: "hidden",
}));

const Content = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: `${theme.spacing(1.2)} ${theme.spacing(2)}`,
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  position: "relative",
}));


const ImageWrapper = styled(Box)(({ height = 120 }) => ({
  position: "relative",
  width: 120,
  height,
  flexShrink: 0,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
}));

function flattenQuillHTML(html) {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/\n/g, ' ')
    .replace(/<\/?p[^>]*>/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function AllPinCard({
  title,
  description,
  category,
  imageurl,
  imagealt,
  date,
  imageHeight = 160,
  // --- NEW: all toggles/counters/handlers
  isSaved,
  savedCount,
  onSave,
  isBeenThere,
  beenThereCount,
  onBeenThere,
  isWantToGo,
  wantToGoCount,
  onWantToGo,
}) {
  return (
    <GlassCard>
      {/* Left: text */}
      <Content>
       
          <Typography variant="h6" sx={{ mt: 0, mb: 0.4, fontWeight: 700 }}>
            {title}
          </Typography>
        
        <Divider sx={{ my: 0.4 }}/>
        <Box
          sx={{
            fontSize: "12px !important",
            color: "white !important",
            '& *': {
              fontSize: "12px !important",
              color: 'white !important'
            },
            overflow: 'hidden',
            whiteSpace: "normal",
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            textOverflow: "ellipsis",
            mt: 0.2,
          }}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(flattenQuillHTML(description))
          }}
        />

        {/* --- ICONS ROW: moved here for flex bottom align --- */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mt: 2,
            position: 'absolute',
            bottom: 8,
            left: 8,
            bgcolor: "rgba(255,255,255,0.08)",
            borderRadius: "20px",
            px: 1,
            py: 0.3,
            zIndex: 1
          }}
        >
          {/* Been There */}
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              if (onBeenThere) onBeenThere(e);
            }}
            size="small"
            sx={{
              color: "green",
              backgroundColor: isBeenThere ? "rgba(40,167,69,0.15)" : "transparent",
              '&:hover': { backgroundColor: "rgba(40,167,69,0.3)" },
            }}
          >
            {isBeenThere
              ? <FlagIcon fontSize="small" />
              : <OutlinedFlagIcon fontSize="small" />}
          </IconButton>
          <Typography variant="button" sx={{ minWidth: 12, color: "white !important" }}>{beenThereCount ?? 0}</Typography>

          {/* Want To Go */}
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              if (onWantToGo) onWantToGo(e);
            }}
            size="small"
            sx={{
              color: "gold",
              backgroundColor: isWantToGo ? "rgba(255,215,0,0.12)" : "transparent",
              '&:hover': { backgroundColor: "rgba(255,215,0,0.22)" },
            }}
          >
            {isWantToGo
              ? <StarIcon fontSize="small" />
              : <StarBorderIcon fontSize="small" />}
          </IconButton>
          <Typography variant="button" sx={{ minWidth: 12, color: "white !important" }}>{wantToGoCount ?? 0}</Typography>

          {/* Saved */}
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              if (onSave) onSave(e);
            }}
            size="small"
            sx={{
              color: 'error.main',
              backgroundColor: isSaved ? "rgba(241,143,1,0.12)" : "transparent",
              '&:hover': { backgroundColor: 'rgba(241,143,1,0.22)' },
            }}
          >
            {isSaved
              ? <FavoriteIcon fontSize="small" />
              : <FavoriteBorderIcon fontSize="small" />}
          </IconButton>
          <Typography variant="button" sx={{ minWidth: 12, color: "white !important" }}>{savedCount ?? 0}</Typography>
        </Box>
      </Content>

      {/* Right: image */}
      <ImageWrapper
        height="160px"
        sx={{
          backgroundImage: imageurl ? `url(${imageurl})` : 'none',
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: imageurl ? "transparent" : "#222",
        }}
        aria-label={imagealt || title}
      >
        {!imageurl && (
          <Typography
            sx={{
              color: "white !important",
              fontSize: "13px",
              textAlign: "center",
              opacity: 0.7,
              px: 1,
            }}
          >
            No image found
          </Typography>
        )}
      </ImageWrapper>
    </GlassCard>
  );
}

// Add all prop types!
AllPinCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  category: PropTypes.string,
  imageurl: PropTypes.string,
  imagealt: PropTypes.string,
  imageHeight: PropTypes.number,
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

AllPinCard.defaultProps = {
  description: "",
  category: "",
  imageurl: "",
  imagealt: "",
  imageHeight: 160,
  isSaved: false,
  savedCount: 0,
  onSave: () => {},
  isBeenThere: false,
  beenThereCount: 0,
  onBeenThere: () => {},
  isWantToGo: false,
  wantToGoCount: 0,
  onWantToGo: () => {},
};
