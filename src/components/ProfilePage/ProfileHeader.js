// Updated 2. ProfileHeader.jsx with nav tabs attached to bottom edge of the card
import React from "react";
import {
  Card,
  CardContent,
  Box,
  Avatar,
  CircularProgress,
  Link,
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import FollowButton from "components/pinpage/FollowButton";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import SettingsIcon from "@mui/icons-material/Settings";
import { useTheme, useMediaQuery, IconButton, Button } from "@mui/material";
import { Settings } from "@mui/icons-material";

const navStyles = {
  display: "flex",
  alignItems: "flex-start",
  gap: 2,
  pt: 2,
  px: 3,
  mt: 2,
  mb: 0.5,
};

const linkStyles = (active) => ({
  position: "relative",
  padding: "8px 0",
  cursor: "pointer",
  color: active ? "#F18F01" : "#fff",
  fontWeight: active ? 600 : 400,
  textDecoration: "none",
  "&:after": active
    ? {
        content: "''",
        position: "absolute",
        bottom: -4,
        left: 0,
        width: "100%",
        height: 3,
        backgroundColor: "#F18F01",
        borderRadius: 2,
      }
    : {},
});

export default function ProfileHeader({
  followerCount,
  profile,
  loading,
  items = [],
  onSelect,
  onEditClick,
  isOwner,
  editing,
}) {
  const [active, setActive] = React.useState(items[0]?.key || "");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClick = (key) => {
    setActive(key);
    onSelect?.(key);
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <MDBox textAlign="center" mt={6}>
            <CircularProgress />
          </MDBox>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent>
          <MDBox textAlign="center" mt={6}>
            <MDTypography variant="h5">User not found.</MDTypography>
          </MDBox>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        background:
          "linear-gradient(145deg, rgba(241,143,1,0.3) 0%, rgba(241,143,1,0) 100%)",
        border: "1px solid rgba(255,255,255,0.6)",
        boxShadow:
          "inset 4px 4px 10px rgba(241,143,1,0.), inset -4px -4px 10px rgba(241,143,1,0.1), 0 6px 15px rgba(241,143,1,0.3)",
        borderRadius: "12px",
        p: 0,
      }}
    >
      <CardContent sx={{ p: 3, pb: 0 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <img
              src={profile.avatar_url || "https://www.gravatar.com/avatar/?d=mp&s=150"} 
              alt={profile.full_name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </Box>

          <Box>
            <MDTypography variant="h5">
              @{profile.Username || profile.full_name || "Unknown User"}
            </MDTypography>
            <MDTypography variant="body2" color="white">
              {followerCount} {followerCount === 1 ? "follower" : "followers"}
            </MDTypography>
          </Box>
          <FollowButton authorId={profile.user_id} />
        </Box>
        {/* Edit Button (top-right) */}
        {isOwner &&
          (isMobile ? (
            <IconButton
              onClick={onEditClick}
              sx={{ position: "absolute", top: 8, right: 8 }}
            >
              {editing ? <CloseIcon /> : <SettingsIcon />}
            </IconButton>
          ) : (
            <Button
              onClick={onEditClick}
              variant="outlined"
              size="small"
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                textTransform: "none",
              }}
              startIcon={editing ? <CloseIcon /> : <EditIcon />}
            >
              {editing ? "Cancel Edit" : "Edit Profile"}
            </Button>
          ))}
      </CardContent>

      {items.length > 0 && (
        <Box sx={navStyles}>
          {items.map(({ key, label }) => (
            <Link
              key={key}
              component="button"
              onClick={() => handleClick(key)}
              sx={linkStyles(active === key)}
            >
              <MDTypography variant="button">{label}</MDTypography>
            </Link>
          ))}
        </Box>
      )}
    </Card>
  );
}
