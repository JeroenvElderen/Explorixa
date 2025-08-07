import React, { useState, useEffect } from "react";
import { Avatar, Typography, Stack, Box, Popover } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Link as MuiLink } from "@mui/material";
import FollowButton from "../FollowButton";
import { supabase } from "../../../SupabaseClient";

export default function PinAuthorInfo({ pin, currentUserId }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isOnline, setIsOnline] = useState(false);

  // Auth check
  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsOnline(!!user);
    };
    checkSession();
    // Listen for auth state change
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsOnline(!!session?.user);
    });
    return () => listener?.subscription?.unsubscribe?.();
  }, []);

  if (!pin.addedBy) return null;
  const username = pin.addedBy.username || "Unknown User";
  const profileUrl = `/profile/${pin.addedBy.userId}`;

  const handlePopoverOpen = (event) => setAnchorEl(event.currentTarget);
  const handlePopoverClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

  return (
    <Stack direction="row" alignItems="center" gap={2}>
      {/* Fancy Avatar Ring with Popover */}
      <Box
        sx={{
          position: "relative",
          width: 56,
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "conic-gradient(from 180deg at 50% 50%, #ff9f43 0%, #f1c40f 100%)",
          borderRadius: "50%",
          boxShadow: "0 2px 12px 0 rgba(241,143,1,0.3)",
          transition: "box-shadow 0.3s, transform 0.2s",
          "&:hover": {
            boxShadow: "0 6px 24px 0 rgba(241,143,1,0.6)",
            transform: "scale(1.05)",
            cursor: "pointer",
          },
        }}
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
        aria-owns={open ? "profile-popover" : undefined}
        aria-haspopup="true"
      >
        <Avatar
          src={pin.addedBy.avatarUrl}
          alt={username}
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: "2px solid white",
            boxShadow: "0 0 0 2px rgba(241,143,1,0.13)",
            background: "rgba(255,255,255,0.10)",
            "& img": { objectFit: "cover", width: "100%", height: "100%" },
            transition: "box-shadow 0.2s",
          }}
        />
        {/* Online/offline status dot */}
        <Box
          sx={{
            position: "absolute",
            bottom: 6,
            right: 6,
            width: 12,
            height: 12,
            background: isOnline
              ? "linear-gradient(145deg, #3fe86c 60%, #43f1c4 100%)"
              : "linear-gradient(145deg, #f44559 70%, #fd5444 100%)",
            border: "2px solid white",
            borderRadius: "50%",
            boxShadow: isOnline
              ? "0 0 8px #3fe86c77"
              : "0 0 8px #fd544477",
            zIndex: 2,
            transition: "background 0.25s, box-shadow 0.25s",
          }}
        />
        {/* Popover for mini-profile */}
        <Popover
          id="profile-popover"
          open={open}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                px: 2,
                py: 1.5,
                borderRadius: 2,
                bgcolor: "background.paper",
                boxShadow: 6,
                minWidth: 180,
                pointerEvents: "auto",
                border: "1px solid #eee4",
              },
            },
          }}
          disableRestoreFocus
        >
          <Stack alignItems="center" spacing={0.5}>
            <Avatar
              src={pin.addedBy.avatarUrl}
              alt={username}
              sx={{
                width: 40,
                height: 40,
                mb: 0.5,
                border: "2px solid #f1b01a33",
                "& img": { objectFit: "cover", width: "100%", height: "100%" },
              }}
            />
            <Typography variant="subtitle1" fontWeight={600} color="text.primary">
              {username}
            </Typography>
            {pin.addedBy.full_name && (
              <Typography variant="caption" color="text.secondary">
                {pin.addedBy.full_name}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary" textAlign="center">
              {pin.addedBy.bio || "Explorer on Explorixa"}
            </Typography>
          </Stack>
        </Popover>
      </Box>
      {/* Name + FollowButton */}
      <Stack spacing={0.5}>
        <Typography variant="body2" sx={{ color: "white !important" }}>
          Added by{" "}
          {pin.addedBy.userId && pin.addedBy.userId !== currentUserId ? (
            <MuiLink
              component={RouterLink}
              to={profileUrl}
              underline="none"
              sx={{ color: "white" }}
            >
              <strong>{username}</strong>
            </MuiLink>
          ) : (
            <strong style={{ color: "white" }}>{username}</strong>
          )}
        </Typography>
        <FollowButton authorId={pin.addedBy.userId} />
      </Stack>
    </Stack>
  );
}
