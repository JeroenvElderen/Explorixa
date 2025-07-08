// src/examples/Lists/ProfilesList.jsx
import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import MDBox from "../../../components/MDBox";
import MDTypography from "../../../components/MDTypography";
import MDAvatar from "../../../components/MDAvatar";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

/**
 * Generic list component showing items with avatar, text, and actions.
 * Now vertically scrollable and each item highlights on hover.
 */
function ProfilesList({ title, profiles = [], shadow = true }) {
  const items = Array.isArray(profiles) ? profiles : [];

  return (
    <Card
      sx={{
        position: "relative",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        background: "linear-gradient(145deg, rgba(241,143,1,0.3) 0%, rgba(241,143,1,0) 100%)",
        border: "1px solid rgba(255, 255, 255, 0.6)",
        boxShadow:
          "inset 4px 4px 10px rgba(241,143,1,0.4), inset -4px -4px 10px rgba(241,143,1,0.1), 0 6px 15px rgba(241,143,1,0.3)",
        borderRadius: "12px",
        overflow: "hidden",
        maxHeight: "400px",
        overflowY: "auto",
        '&::-webkit-scrollbar': { display: 'none' },
        p: 2,
      }}
    >
      <MDBox pt={2} px={2}>
        <MDTypography variant="h6" fontWeight="medium" textTransform="capitalize">
          {title}
        </MDTypography>
      </MDBox>
      <MDBox p={2} component="ul" sx={{ p: 0, m: 0, display: 'flex', flexDirection: 'column' }}>
        {items.map((item) => {
          const Wrapper = item.action?.type === "internal" ? Link : "a";
          const wrapperProps =
            item.action?.type === "internal"
              ? { to: item.action.route }
              : { href: item.action.route, target: "_blank", rel: "noreferrer" };

          return (
            <MDBox
              key={item.name}
              component="li"
              display="flex"
              alignItems="center"
              py={1}
              mb={1}
              sx={{
                borderRadius: '50px',
                transition: 'background-color 0.2s',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.2)' },
              }}
            >
              <MDBox
                component={Wrapper}
                {...wrapperProps}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  textDecoration: "none",
                  color: "inherit",
                  width: "100%",
                }}
              >
                <MDBox mr={2}>
                  <MDAvatar
                    src={item.image}
                    alt={item.name}
                    shadow="md"
                    sx={{
                      left: 15,
                      width: 40,
                      height: 40,
                      '& .MuiAvatar-img': { objectFit: 'cover', width: '100%', height: '100%' },
                    }}
                  />
                </MDBox>
                <MDBox display="flex" flexDirection="column" alignItems="flex-start" justifyContent="center">
                  <MDTypography variant="button" fontWeight="medium" sx={{ ml: '10px' }}>
                    {item.name}
                  </MDTypography>
                  <MDTypography variant="caption" color="text" sx={{ ml: '10px'}}>
                    {item.description}
                  </MDTypography>
                </MDBox>
              </MDBox>

              {typeof item.onRemove === 'function' && (
                <MDBox ml="auto">
                  <IconButton onClick={item.onRemove} size="small" sx={{ right: 20 }}>
                    <CloseIcon color="error" />
                  </IconButton>
                </MDBox>
              )}
            </MDBox>
          );
        })}
      </MDBox>
    </Card>
  );
}

ProfilesList.propTypes = {
  title: PropTypes.string.isRequired,
  profiles: PropTypes.arrayOf(
    PropTypes.shape({
      image: PropTypes.string,
      name: PropTypes.string,
      description: PropTypes.string,
      action: PropTypes.shape({
        type: PropTypes.string,
        route: PropTypes.string,
        label: PropTypes.string,
        color: PropTypes.string,
      }),
      onRemove: PropTypes.func,
    })
  ),
  shadow: PropTypes.bool,
};

ProfilesList.defaultProps = {
  profiles: [],
  shadow: true,
};

export default ProfilesList;
