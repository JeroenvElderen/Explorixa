import React, { useState } from "react";
import { Box, Stack, Avatar, Typography, Dialog } from "@mui/material";
import PostComposer from "./PostComposer";

export default function PostTrigger({ user, userId, accessToken }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Box
        sx={{
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          background:
            "linear-gradient(145deg, rgba(241,143,1,0.3) 0%, rgba(241,143,1,0) 100%)",
          border: "1px solid rgba(255,255,255,0.6)",
          boxShadow:
            "inset 4px 4px 10px rgba(241,143,1,0.4), inset -4px -4px 10px rgba(241,143,1,0.1), 0 6px 15px rgba(241,143,1,0.3)",
          borderRadius: "12px",
          px: 2,
          py: 1.5,
          cursor: "text",
          "&:hover": { borderColor: "#F18F01" },
        }}
        onClick={() => setOpen(true)}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <img
              src={user?.avatar}
              alt={user?.full_name || "User avatar"}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Box>
          <Typography color="#ccc">What's on your mind?</Typography>
        </Stack>
      </Box>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: {
            // match your frosted-orange card style:
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            background:
              "linear-gradient(145deg, rgba(241,143,1,0.3) 0%, rgba(241,143,1,0) 100%)",
            border: "1px solid rgba(255,255,255,0.6)",
            boxShadow:
              "inset 4px 4px 10px rgba(241,143,1,0.4), inset -4px -4px 10px rgba(241,143,1,0.1), 0 6px 15px rgba(241,143,1,0.3)",
            borderRadius: "12px",

            // Prevent any internal scrolling & hide scrollbars:
            overflow: "hidden",
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
          },
        }}
        BackdropProps={{
          style: { backgroundColor: "rgba(0,0,0,0.4)" },
        }}
      >
        <PostComposer
          user={user}
          userId={userId}
          accessToken={accessToken}
          onClose={() => setOpen(false)}
        />
      </Dialog>
    </>
  );
}
