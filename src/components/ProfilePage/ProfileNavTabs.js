// src/components/ProfileNavTabs.jsx
import React from 'react';
import { Box, Menu, MenuItem, Typography, Link } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MDTypography from 'components/MDTypography';

const navStyles = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 2,
  padding: '12px 24px',
  backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      background: 'linear-gradient(145deg, rgba(241, 143, 1, 0.3) 0%, rgba(241,143,1,0) 100%)',
      border: '1px solid rgba(255,255,255,0.6)',
      boxShadow: 'inset 4px 4px 10px rgba(241,143,1,0.4), inset -4px -4px 10px rgba(241,143,1,0.1), 0 6px 15px rgba(241,143,1,0.3)',
      borderRadius: '12px',
      mb: 4,
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

export default function ProfileNavTabs({ items, onSelect }) {
  const [active, setActive] = React.useState(items[0]?.key || '');
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (key) => {
    if (key === 'more') {
      setAnchorEl(anchorEl ? null : document.getElementById('nav-more'));
    } else {
      setActive(key);
      onSelect(key);
      setAnchorEl(null);
    }
  };

  const handleClose = () => setAnchorEl(null);

  return (
    <Box sx={navStyles}>
      {items.map(({ key, label }) =>
        key !== 'more' ? (
          <Link
            key={key}
            component="button"
            onClick={() => handleClick(key)}
            sx={linkStyles(active === key)}
          >
            <MDTypography variant="button">{label}</MDTypography>
          </Link>
        ) : (
          <React.Fragment key={key}>
            <Box
              id="nav-more"
              component="button"
              onClick={() => handleClick(key)}
              sx={{ display: 'flex', alignItems: 'center', ...linkStyles(active === key) }}
            >
              <MDTypography variant="button">{label}</MDTypography>
              <ExpandMoreIcon fontSize="small" sx={{ ml: 0.5 }} />
            </Box>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
              {items.find(i => i.key === 'more').children?.map(child => (
                <MenuItem
                  key={child.key}
                  selected={active === child.key}
                  onClick={() => handleClick(child.key)}
                >
                  {child.label}
                </MenuItem>
              ))}
            </Menu>
          </React.Fragment>
        )
      )}
    </Box>
  );
}

/**
 * Usage Example:
 *
 * const navItems = [
 *   { key: 'posts', label: 'Posts' },
 *   { key: 'about', label: 'About' },
 *   { key: 'reels', label: 'Reels' },
 *   { key: 'photos', label: 'Photos' },
 *   { key: 'groups', label: 'Groups' },
 *   { key: 'events', label: 'Events' },
 *   { key: 'more', label: 'More', children: [
 *       { key: 'videos', label: 'Videos' },
 *       { key: 'links', label: 'Links' },
 *     ]
 *   },
 * ];
 *
 * function handleTabSelect(key) {
 *   // hide/show content based on key
 * }
 *
 * <ProfileNavTabs items={navItems} onSelect={handleTabSelect} />
 */
