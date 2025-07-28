import React from "react";
import { Box } from "@mui/material";
import PostTrigger from "./PostTrigger";

export default function CreatePostSection({ profile, accessToken, userId }) {
  return (
    <Box>
      <PostTrigger
        user={{ avatar: profile.avatar_url, full_name: profile.full_name }}
        userId={userId}
        accessToken={accessToken}
      />
    </Box>
  );
}
