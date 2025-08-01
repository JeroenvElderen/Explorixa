import React, { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import MDBox from "../../../components/MDBox";
import MDTypography from "../../../components/MDTypography";
import DOMPurify from "dompurify";
import PinInteractionPanel from "components/PinInteractionPanel";
import Box from "@mui/material/Box";
import { Link } from "react-router-dom";

function PinCard({
  color = "info",
  pin,
  title,
  description = "",
  date = "",
  imageurl = "",
  imagealt = "",
  truncateDescription = true,
  height = "12.5rem",
  link,
  linkLabel,
  onLinkClick,
  onCardClick, // <-- New for main card click
  onUpdated = () => {},
  timeAgoLabel, // Optional
}) {
  const contentRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState("4.5em");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const resolvedTitle = pin?.Name || title || "Untitled";
  const resolvedDescription = pin?.Information || description || "";
  const resolvedDate = pin
    ? pin.created_at
      ? new Date(pin.created_at).toLocaleDateString()
      : ""
    : date;
  const resolvedImage = pin ? pin["Main Image"] : imageurl;
  const resolvedAlt = pin?.Name || imagealt;

  useEffect(() => {
    if (!contentRef.current) return;
    if (truncateDescription) {
      setIsTransitioning(true);
      setMaxHeight("4.5em");
    } else {
      setIsTransitioning(true);
      setMaxHeight(`${contentRef.current.scrollHeight}px`);
    }
  }, [truncateDescription]);

  const handleTransitionEnd = () => {
    if (!truncateDescription) {
      setMaxHeight("none");
    }
    setIsTransitioning(false);
  };

  // Prevent card click if bottom button is clicked!
  const handleCardClick = (e) => {
    // If the click was inside the link/button, do nothing
    if (e.target.closest(".pin-bottom-link-button")) return;
    if (onCardClick) onCardClick(e);
  };

  return (
    <div
      style={{ cursor: onCardClick ? "pointer" : "default" }}
      onClick={onCardClick ? handleCardClick : undefined}
      tabIndex={onCardClick ? 0 : undefined}
      role={onCardClick ? "button" : undefined}
      onKeyDown={
        onCardClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") handleCardClick(e);
            }
          : undefined
      }
    >
      <Card
        sx={{
          position: "relative",
          mb: 2,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
          border: "1px solid rgba(243, 143, 1, 0.6)",
          boxShadow:
            "inset 4px 4px 10px rgba(0,0,0,0.4), inset -4px -4px 10px rgba(255,255,255,0.1), 0 6px 15px rgba(0,0,0,0.3)",
          borderRadius: "12px",
        }}
      >
        <MDBox padding="1rem">
          <MDBox
            borderRadius="lg"
            coloredShadow={color}
            py={2}
            pr={0.5}
            mt={-5}
            height={height}
            sx={{
              backgroundImage: `url(${resolvedImage})`,
              backgroundColor: "transparent",
              backgroundBlendMode: "normal",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
            component={"div"}
            aria-label={resolvedAlt || resolvedTitle}
          >
            {!resolvedImage && (
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
            <MDTypography variant="h6" textTransform="capitalize" align="center">
              {resolvedTitle}
            </MDTypography>

            <MDTypography
              component="div"
              variant="button"
              color="text"
              fontWeight="light"
              sx={{
                maxHeight: truncateDescription ? "4.5em" : "150px",
                overflowY: truncateDescription ? "hidden" : "auto",
                transition: "max-height 0.5s ease",
                whiteSpace: "normal",
                pr: 1,
                "& ul": { listStyle: "disc", marginLeft: "1.5rem", paddingLeft: "1rem" },
                "& ol": { listStyle: "decimal", marginLeft: "1.5rem", paddingLeft: "1rem" },
                "& li": { marginBottom: "0.25rem" },
              }}
              onTransitionEnd={handleTransitionEnd}
            >
              <div
                ref={contentRef}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(resolvedDescription) }}
              />
            </MDTypography>

            <Divider sx={{ my: 1 }} />

            <MDBox display="flex" alignItems="center" justifyContent="center">
              {timeAgoLabel && (
                <MDTypography
                  variant="caption"
                  color="text"
                  fontWeight="regular"
                  sx={{ mr: 1 }}
                >
                  {timeAgoLabel}
                </MDTypography>
              )}
              <MDTypography
                variant="button"
                color="text"
                fontWeight="light"
              >
                {resolvedDate}
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>

        {pin && (
          <Box
            mt={1}
            px={1}
            display="flex"
            justifyContent="center"
            className="pin-interaction-panel"
          >
            <PinInteractionPanel
              pin={pin}
              onUpdated={updated => {
                onUpdated(updated);
              }}
              compact={false}
            />
          </Box>
        )}
      </Card>
      {/* --- Keep your orange button for desktop! --- */}
      {link && (
        <Link
          to={link}
          onClick={onLinkClick}
          className="pin-bottom-link-button"
          style={{
            display: "block",
            marginTop: "16px",
            padding: "12px 0",
            textAlign: "center",
            background: "linear-gradient(195deg, rgb(241,143,1), rgba(241,143,1,0.5))",
            color: "#fff",
            borderRadius: "12px",
            boxShadow:
              "0 2px 4px -1px rgb(241 143 1 / 20%), 0 4px 5px 0 rgb(241 143 1 / 14%), 0 1px 10px 0 rgb(241 143 1 / 12%)",
            textDecoration: "none",
            cursor: "pointer",
            fontWeight: 600,
            letterSpacing: "0.15px",
          }}
        >
          {linkLabel || `Go to ${resolvedTitle}`}
        </Link>
      )}
    </div>
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
  pin: PropTypes.object,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  date: PropTypes.string,
  imageurl: PropTypes.string,
  imagealt: PropTypes.string,
  truncateDescription: PropTypes.bool,
  height: PropTypes.string,
  link: PropTypes.string,
  linkLabel: PropTypes.string,
  onLinkClick: PropTypes.func,
  onCardClick: PropTypes.func,
  onUpdated: PropTypes.func,
  timeAgoLabel: PropTypes.string,
};

PinCard.defaultProps = {
  color: "info",
  title: "",
  description: "",
  date: "",
  imageurl: "",
  imagealt: "",
  truncateDescription: true,
  height: "12.5rem",
  link: null,
  linkLabel: null,
  onLinkClick: () => {},
  onCardClick: null,
  onUpdated: () => {},
  timeAgoLabel: null,
};

export default PinCard;
