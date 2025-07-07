import React, { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import DOMPurify from "dompurify";
import IconButton from "@mui/material/IconButton";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FlagIcon from "@mui/icons-material/Flag";
import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

import MDBox from "../../../components/MDBox";
import MDTypography from "../../../components/MDTypography";

function PinCard({
  color = "info",
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
  isSaved,
  savedCount,
  onSave,
  isBeenThere,
  onBeenThere,
  beenThereCount,
  isWantToGo,
  onWantToGo,
  wantToGoCount,
}) {
  const contentRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState("4.5em");
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  return (
    <div>
      <Card sx={{
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
      }}>
        <MDBox padding="1rem">
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
              {title || "Untitled"}
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
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description) }}
              />
            </MDTypography>

            <Divider sx={{ my: 1 }} />
            <MDBox display="flex" alignItems="center">
              <MDTypography
                variant="button"
                color="text"
                lineHeight={1}
                sx={{ mt: 0.15, mr: 0.5 }}
              >
                <Icon>schedule</Icon>
              </MDTypography>
              <MDTypography variant="button" color="text" fontWeight="light">
                {date}
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>

        {/* Icons row (absolute, bottom right) */}
        <MDBox
          sx={{
            position: 'absolute',
            bottom: 14,
            right: 12,
            display: 'flex',
            gap: 1.2,
            alignItems: 'center',
            background: "rgba(255,255,255,0.08)",
            borderRadius: "20px",
            px: 1,
            py: 0.2,
          }}
        >
          {/* Been There: Green Flag */}
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
          <MDTypography variant="button" sx={{ minWidth: 12 }}>{beenThereCount ?? 0}</MDTypography>

          {/* Want To Go: Gold Star */}
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
          <MDTypography variant="button" sx={{ minWidth: 12 }}>{wantToGoCount ?? 0}</MDTypography>

          {/* Saved: Heart */}
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
    : <FavoriteBorderIcon fontSize="small" />
  }
</IconButton>
<MDTypography variant="button" sx={{ minWidth: 12 }}>{savedCount ?? 0}</MDTypography>
        </MDBox>
      </Card>
      {link && (
        <Link
          to={link}
          onClick={onLinkClick}
          style={{
            display: 'block',
            marginTop: '16px',
            padding: '12px 0',
            textAlign: 'center',
            background: 'linear-gradient(195deg, rgb(241,143,1), rgba(241,143,1,0.5))',
            color: '#fff',
            borderRadius: '12px',
            boxShadow: '0 2px 4px -1px rgb(241 143 1 / 20%), 0 4px 5px 0 rgb(241 143 1 / 14%), 0 1px 10px 0 rgb(241 143 1 / 12%)',
            textDecoration: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            letterSpacing: '0.15px',
          }}
        >
          {linkLabel || `Go to ${title}`}
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
  isSaved: PropTypes.bool,
  onSave: PropTypes.func,
  // Add new props:
  isBeenThere: PropTypes.bool,
  onBeenThere: PropTypes.func,
  beenThereCount: PropTypes.number,
  isWantToGo: PropTypes.bool,
  onWantToGo: PropTypes.func,
  wantToGoCount: PropTypes.number,
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
  isSaved: false,
  onSave: () => {},
  // New defaults:
  isBeenThere: false,
  onBeenThere: () => {},
  beenThereCount: 0,
  isWantToGo: false,
  onWantToGo: () => {},
  wantToGoCount: 0,
};

export default PinCard;
