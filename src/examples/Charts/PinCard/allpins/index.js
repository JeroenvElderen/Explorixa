import React from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import PinInteractionPanel from "components/PinInteractionPanel";

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

export default function AllPinCard({
  pin,
  title,
  description,
  imageurl,
  imagealt,
  date,
  imageHeight = 160,
  children, // for action slot
}) {
  return (
    <GlassCard>
      <Content>
        <Typography variant="h6" sx={{ mt: 0, mb: 0.4, fontWeight: 700 }}>
          {title}
        </Typography>

        <Divider sx={{ my: 0.4 }} />

        <Box
          sx={{
            flex: 1,
            color: "white !important",
            fontSize: "12px",
            overflow: "hidden",
            minHeight: "2.7em",
            maxHeight: "2.7em",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            textOverflow: "ellipsis",
            lineHeight: 1.35,
            mb: 0.5,
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            components={{
              p: ({ node, ...props }) => (
                <Typography
                  component="p"
                  variant="body2"
                  sx={{
                    color: "white !important",
                    fontSize: "12px",
                    m: 0,
                    lineHeight: 1.35,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    whiteSpace: "normal",
                  }}
                  {...props}
                />
              ),
            }}
          >
            {description || ""}
          </ReactMarkdown>
        </Box>

             {pin && (
          <Box mt={1}>
            <PinInteractionPanel pin={pin} />
          </Box>
        )}
        <Typography
          variant="caption"
          sx={{ color: "white !important", position: "absolute", bottom: 8, left: 180 }}
        >
          {date}
        </Typography>

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

AllPinCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  imageurl: PropTypes.string,
  imagealt: PropTypes.string,
  date: PropTypes.string,
  imageHeight: PropTypes.number,
  children: PropTypes.node,
};

AllPinCard.defaultProps = {
  description: "",
  imageurl: "",
  imagealt: "",
  date: "",
  imageHeight: 160,
  children: null,
};
