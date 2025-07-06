import React from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import DOMPurify from "dompurify";
import MDBox from "../../../../components/MDBox";
import MDTypography from "../../../../components/MDTypography";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";



const GlassCard = styled(Card)(({ theme }) => ({
    position: "relative",
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

function flattenQuillHTML(html) {
    return html
        .replace(/<br\s*\/?>/gi, ' ')       // Replace <br> tags with space
        .replace(/\n/g, ' ')                // Replace newlines with space
        .replace(/<\/?p[^>]*>/gi, ' ')      // Replace <p> and </p> with space
        .replace(/\s+/g, ' ')               // Collapse multiple spaces
        .trim();
}

export default function RowPinCard({
    title,
    description,
    category,
    imageurl,
    imagealt,
    date,
    imageHeight = 120,
    onSave,
    isSaved,
}) {
    return (
        <GlassCard >
            {/* Left side: text */}
            <Content>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        mt: -2.5,
                        flex: 1, // take up all vertical space
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        {title}
                    </Typography>
                </Box>
                <Divider sx={{ my: 1, mt: -1 }} />
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
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        textOverflow: "ellipsis",
                    }}
                    dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(flattenQuillHTML(description))
                    }}
                />
            </Content>

            {/* Right side: image + bookmark */}
            <ImageWrapper
  height={imageHeight}
  sx={{
    backgroundImage: imageurl ? `url(${imageurl})` : 'none',
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: imageurl ? "transparent" : "#222", // fallback bg
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
            {/* Heart icon at bottom-right, always red */}
            <IconButton
                onClick={(e) => {
                    e.stopPropagation();
                    onSave(e);
                }}
                size="small"
                sx={{
                    position: 'absolute',
                    bottom: 4,
                    right: 4,
                    p: 0,                            // remove extra padding
                    minWidth: 0,
                    minHeight: 0,
                    width: 24,                       // match icon or just above
                    height: 24,
                    color: 'error.main',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.5)' },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {isSaved
                    ? <FavoriteIcon sx={{ fontSize: 28 }} />
                    : <FavoriteBorderIcon sx={{ fontSize: 28 }} />
                }
            </IconButton>
        </GlassCard>
    );
}

RowPinCard.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    category: PropTypes.string,
    imageurl: PropTypes.string,
    imagealt: PropTypes.string,
    onSave: PropTypes.func,
    isSaved: PropTypes.bool,
    imageHeight: PropTypes.number, // in px
};

RowPinCard.defaultProps = {
    description: "",
    category: "",
    imageurl: "",
    imagealt: "",
    onSave: () => { },        // ← no-op function, not a PropTypes validator
    isSaved: false,          // ← actual boolean
    imageHeight: 120,
};
