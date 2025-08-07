// src/components/PinImageCarousel.js
import React, { useState } from "react";
import PropTypes from "prop-types";
import Slider from "react-slick";
import { useTheme, useMediaQuery, Box } from "@mui/material";
import MDBox from "../../MDBox";
import MDTypography from "../../MDTypography";
import PinInteractionPanel from "components/PinInteractionPanel";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function PinImageCarousel({ images, pin, onUpdated = () => {} }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [current, setCurrent] = useState(0);

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    adaptiveHeight: true,
    arrows: !isMobile, // hide arrows on mobile
    beforeChange: (_, next) => {
      setCurrent(next);
    },
    responsive: [
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <MDBox
      sx={{
        position: "relative",
        width: isMobile ? "100vw" : "100%",
        left: isMobile ? "50%" : "0",
        transform: isMobile ? "translateX(-50%)" : "none",
        my: isMobile ? 0 : 3,
        px: isMobile ? 0 : 2,
      }}
    >
      <Slider {...settings}>
        {images.map((src, i) => (
          <MDBox
            key={i}
            component="img"
            src={src}
            alt={`slide ${i + 1}`}
            width="100%"
            maxHeight="350px"
            borderRadius="lg"
            sx={{ objectFit: "cover", position: "relative" }}
          />
        ))}
      </Slider>

      {/* Mobile indicator at bottom center */}
      {isMobile && images.length > 0 && (
        <Box
          sx={{
            position: "absolute",
            bottom: 15,
            left: "50%",
            transform: "translateX(-50%)",
            bgcolor: "rgba(0,0,0,0.6)",
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MDTypography variant="caption" color="white">
            {current + 1}/{images.length}
          </MDTypography>
        </Box>
      )}

      {/* Mobile-only interaction panel in top-right with spacing */}
      {isMobile && pin && (
        <Box
          sx={{
            position: "absolute",
            left: 12,
            bottom: 18,
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            pointerEvents: "auto",
          }}
        >
          <PinInteractionPanel
            pin={pin}
            onUpdated={onUpdated}
          />
        </Box>
      )}
    </MDBox>
  );
}

PinImageCarousel.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  pin: PropTypes.object,
  onUpdated: PropTypes.func,
};

PinImageCarousel.defaultProps = {
  pin: null,
  onUpdated: () => {},
};
