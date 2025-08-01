import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import MDBox from "../../../../components/MDBox";
import MDTypography from "../../../../components/MDTypography";
import React from "react";

// Helper for formatting large numbers
function formatNumber(num) {
  if (num == null) return "…";
  const abs = Math.abs(num);
  if (abs >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
  if (abs >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (abs >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toLocaleString();
}

function ComplexStatisticsCard({
  color = "info",
  title,
  count,
  percentage = { color: "success", amount: "", label: "" },
  icon,
  description = "",
  formatCount = false,
}) {
  return (
    <MDBox sx={{ position: "relative", width: "100%", height: 100, mb: 1.5 }}>
      {/* Floating Icon */}
      <MDBox
        variant="gradient"
        bgColor={color}
        color={color === "light" ? "dark" : "white"}
        coloredShadow={color}
        borderRadius="xl"
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{
          position: "absolute",
          left: 16,
          top: -24,
          width: { xs: "3.2rem", sm: "3.4rem" },
          height: { xs: "3.2rem", sm: "3.4rem" },
          minWidth: { xs: "3.2rem", sm: "3.4rem" },
          minHeight: { xs: "3.2rem", sm: "3.4rem" },
          zIndex: 2,
          boxShadow: "0 2px 8px 0 rgba(0,0,0,0.20)",
        }}
      >
        {typeof icon === "string" ? (
          <Icon sx={{ fontSize: { xs: 30, sm: 34 } }}>{icon}</Icon>
        ) : (
          React.isValidElement(icon)
            ? React.cloneElement(icon, {
                style: { width: 30, height: 30, minWidth: 30, minHeight: 30, ...icon.props.style }
              })
            : icon
        )}
      </MDBox>
      {/* Card */}
      <Card
        sx={{
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
          border: "1px solid rgba(243, 143, 1, 0.6)",
          boxShadow:
            "inset 4px 4px 10px rgba(0,0,0,0.4), inset -4px -4px 10px rgba(255,255,255,0.1), 0 6px 15px rgba(0,0,0,0.3)",
          borderRadius: "12px",
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start", // Make sure content is at top
          pt: 0, // Slightly less padding top, adjust as you like
          pl: 2,
          pr: 2,
          pb: 1,
          position: "relative",
          zIndex: 1,
          overflow: "hidden",
        }}
      >
        {/* Card Content: Text at top */}
        <MDBox textAlign="right" lineHeight={1.25}>
          <MDTypography
            variant="button"
            fontWeight="light"
            color="text"
            sx={{ fontSize: { xs: 12, sm: 14 } }}
          >
            {title}
          </MDTypography>
          <MDTypography variant="h4" sx={{ fontSize: { xs: 20, sm: 24 } }}>
            {formatCount && typeof count === "number" ? formatNumber(count) : count}
          </MDTypography>
          {description && (
            <MDTypography variant="button" color="text" fontWeight="regular">
              {description}
            </MDTypography>
          )}
        </MDBox>
        <Divider sx={{ my: 0.5, mt: "auto" }} />
        <MDBox width="100%" minWidth={0}>
  <MDTypography
    component="p"
    variant="button"
    color="text"
    display="flex"
    alignItems="center"
    sx={{ fontSize: { xs: 12, sm: 14 }, width: "100%", minWidth: 0 }}
  >
    <MDBox width="100%" minWidth={0} sx={{ flexGrow: 1, flexShrink: 1 }}>
      <MDTypography
        component="span"
        variant="button"
        fontWeight="bold"
        color={percentage.color}
        sx={{ fontSize: { xs: 12, sm: 14 }, width: "100%", minWidth: 0 }}
      >
        {percentage.amount}
      </MDTypography>
    </MDBox>
    {percentage.label && (
      <span style={{ whiteSpace: "nowrap", marginLeft: 4 }}>
        {percentage.label}
      </span>
    )}
  </MDTypography>
</MDBox>

      </Card>
    </MDBox>
  );
}

ComplexStatisticsCard.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "light",
    "dark",
  ]),
  title: PropTypes.string.isRequired,
  count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  percentage: PropTypes.shape({
    color: PropTypes.oneOf([
      "primary",
      "secondary",
      "info",
      "success",
      "warning",
      "error",
      "dark",
      "white",
    ]),
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string,
  }),
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  description: PropTypes.string,
  formatCount: PropTypes.bool,
};

export default ComplexStatisticsCard;
