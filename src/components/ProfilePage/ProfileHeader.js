// Updated 2. ProfileHeader.jsx with nav tabs attached to bottom edge of the card
import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Avatar,
  CircularProgress,
  Link,
} from '@mui/material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import FollowButton from 'components/pinpage/FollowButton';

const navStyles = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 2,
  pt: 2,
  px: 3,
  mt: 2,
  mb: 0.5,
};

const linkStyles = (active) => ({
  position: 'relative',
  padding: '8px 0',
  cursor: 'pointer',
  color: active ? '#F18F01' : '#fff',
  fontWeight: active ? 600 : 400,
  textDecoration: 'none',
  '&:after': active
    ? {
        content: "''",
        position: 'absolute',
        bottom: -4,
        left: 0,
        width: '100%',
        height: 3,
        backgroundColor: '#F18F01',
        borderRadius: 2,
      }
    : {},
});

export default function ProfileHeader({ profile, loading, items = [], onSelect }) {
  const [active, setActive] = React.useState(items[0]?.key || '');

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
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        background: 'linear-gradient(145deg, rgba(241, 143, 1, 0.3) 0%, rgba(241,143,1,0) 100%)',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow:
          'inset 4px 4px 10px rgba(241,143,1,0.4), inset -4px -4px 10px rgba(241,143,1,0.1), 0 6px 15px rgba(241,143,1,0.3)',
        borderRadius: '12px',
        p: 0,
        mb: 3,
      }}
    >
      <CardContent sx={{ p: 3, pb: 0 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar src={profile.avatar_url} sx={{ width: 80, height: 80 }} />
          <Box>
            <MDTypography variant="h5">
              @{profile.Username || profile.full_name || 'Unknown User'}
            </MDTypography>
          </Box>
          <FollowButton authorId={profile.user_id} />
        </Box>
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
