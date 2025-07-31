import React from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ReactMarkdown from "react-markdown";

const GlassCard = styled(Card)(() => ({
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

export default function RowPinCard({
  title,
  description,
  imageurl,
  imagealt,
  imageHeight = 160,
  isExpanded = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  children, // for action slot
}) {
  return (
    <GlassCard onClick={onClick} sx={{ cursor: "pointer" }}>
      <Content>
        <Typography variant="h6" sx={{ mt: 0, mb: 0.4, fontWeight: 700 }}>
          {title}
        </Typography>

        <Divider sx={{ my: 0.4 }} />

        <Box sx={{ flex: 1 }}>
          <ReactMarkdown
            children={description || ""}
            components={{
              p: ({ node, ...props }) => (
                <Typography
                  component="p"
                  variant="body2"
                  sx={{
                    fontSize: "12px",
                    color: "white",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    textOverflow: "ellipsis",
                    mt: 0.2,
                  }}
                  {...props}
                />
              ),
            }}
          />
        </Box>

        {children && <Box mt={1}>{children}</Box>}
      </Content>

      <ImageWrapper
        height={`${imageHeight}px`}
        sx={{
          backgroundImage: imageurl ? `url(${imageurl})` : "none",
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
              color: "white",
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

RowPinCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  imageurl: PropTypes.string,
  imagealt: PropTypes.string,
  imageHeight: PropTypes.number,
  isExpanded: PropTypes.bool,
  onClick: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  children: PropTypes.node,
};

RowPinCard.defaultProps = {
  description: "",
  imageurl: "",
  imagealt: "",
  imageHeight: 160,
  isExpanded: false,
  onClick: () => {},
  onMouseEnter: () => {},
  onMouseLeave: () => {},
  children: null,
};
