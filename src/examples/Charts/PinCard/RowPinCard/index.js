import React from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import DOMPurify from "dompurify";
import MDBox from "../../../../components/MDBox";
import MDTypography from "../../../../components/MDTypography";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";

const GlassCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "stretch",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  background:
    "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
  border: "1px solid rgba(243, 143, 1, 0.6)",
  boxShadow:
    "inset 4px 4px 10px rgba(0,0,0,0.4), inset -4px -4px 10px rgba(255,255,255,0.1), 0 6px 15px rgba(0,0,0,0.3)",
  borderRadius: 12,
  overflow: "hidden",
}));

const Content = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
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

export default function RowPinCard({
  title,
  description,
  category,
  imageurl,
  imagealt,
  date,
  isBookmarked,
  onBookmarkToggle,
  imageHeight = 120,
}) {
  return (
    <GlassCard >
      {/* Left side: text */}
      <Content>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{ mb: 1.5, lineHeight: 1.4 }}
          component="div"
        >
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(description),
            }}
          />
        </Typography>
        <Divider sx={{ my: 1 }} />
          <MDBox display="flex" alignItems="center">
            <MDTypography variant="button" color="text" lineHeight={1} sx={{ mt: 0.15, mr: 0.5 }}>
              <Icon>schedule</Icon>
            </MDTypography>
            <MDTypography variant="button" color="text" fontWeight="light">
              {date}
            </MDTypography>
          </MDBox>
      </Content>

      {/* Right side: image + bookmark */}
      <ImageWrapper
        height={imageHeight}
        sx={{ backgroundImage: `url(${imageurl})` }}
        aria-label={imagealt || title}
      >
        <IconButton
          onClick={onBookmarkToggle}
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            bgcolor: "rgba(0,0,0,0.3)",
            color: "common.white",
            "&:hover": { bgcolor: "rgba(0,0,0,0.5)" },
          }}
        >
          {isBookmarked ? (
            <BookmarkIcon fontSize="small" />
          ) : (
            <BookmarkBorderIcon fontSize="small" />
          )}
        </IconButton>
      </ImageWrapper>
    </GlassCard>
  );
}

RowPinCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  category: PropTypes.string,
  imageurl: PropTypes.string,
  imagealt: PropTypes.string,
  isBookmarked: PropTypes.bool,
  onBookmarkToggle: PropTypes.func,
  imageHeight: PropTypes.number, // in px
};

RowPinCard.defaultProps = {
  description: "",
  category: "",
  imageurl: "",
  imagealt: "",
  isBookmarked: false,
  onBookmarkToggle: () => {},
  imageHeight: 120,
};
