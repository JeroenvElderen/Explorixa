import React, { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";

import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";

import MDBox from "../../../components/MDBox";
import MDTypography from "../../../components/MDTypography";

function PinCard({ color = "info", title, description = "", date = "", imageurl = "", imagealt = "", truncateDescription = true, height = "12.5rem" }) {
  const contentRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState("4.5em"); // default truncated height
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!contentRef.current) return;

    if (truncateDescription) {
      // Start closing (truncate)
      setIsTransitioning(true);
      setMaxHeight("4.5em"); // limit to about 3 lines (adjust if needed)
    } else {
      // Start expanding
      setIsTransitioning(true);
      setMaxHeight(`${contentRef.current.scrollHeight}px`);
    }
  }, [truncateDescription]);

  const handleTransitionEnd = () => {
    if (!truncateDescription) {
      // Remove maxHeight restriction after expanding for natural flow
      setMaxHeight("none");
    }
    setIsTransitioning(false);
  };

  return (
    <Card sx={{ height: "100%" }}>
      <MDBox padding="1rem">
        {/* Image container replacing the chart line */}
        <MDBox
          borderRadius="lg"
          coloredShadow={color}
          py={2}
          pr={0.5}
          mt={-5}
          height={height}
          sx={{
            backgroundImage: `url(${imageurl})`,
            backgroundColor: "transparent",
            backgroundBlendMode: "normal",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
          component={"div"}
          aria-label={imagealt || title}
        >
          {!imageurl && (
            <MDTypography
              color="text"
              variant="button"
              textAlign="center"
              sx={{ lineHeight: height }}
            >
              No image available
            </MDTypography>
          )}
        </MDBox>

        <MDBox pt={3} pb={1} px={1}>
          <MDTypography variant="h6" textTransform="capitalize">
            {title || "Untitled" }
          </MDTypography>

          {/* Description with animated truncation */}
          <MDTypography
            component="div"
            variant="button"
            color="text"
            fontWeight="light"
            ref={contentRef}
            onTransitionEnd={handleTransitionEnd}
            sx={{
              maxHeight,
              overflow: "hidden",
              transition: "max-height 0.5s ease",
              display: "-webkit-box",
              WebkitLineClamp: truncateDescription ? 3 : "unset",
              WebkitBoxOrient: "vertical",
              textOverflow: "ellipsis",
              whiteSpace: "normal",
            }}
          >
            {description}
          </MDTypography>

          <Divider sx={{ my: 1 }} />
          <MDBox display="flex" alignItems="center">
            <MDTypography variant="button" color="text" lineHeight={1} sx={{ mt: 0.15, mr: 0.5 }}>
              <Icon>schedule</Icon>
            </MDTypography>
            <MDTypography variant="button" color="text" fontWeight="light">
              {date}
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );
}

PinCard.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "dark",
  ]),
  title: PropTypes.string,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  date: PropTypes.string,
  imageurl: PropTypes.string,
  imagealt: PropTypes.string,
  truncateDescription: PropTypes.bool,
  height: PropTypes.string,
};

export default PinCard;
