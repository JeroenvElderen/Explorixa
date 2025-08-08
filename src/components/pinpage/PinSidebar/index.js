// src/components/pinpage/PinSidebar/index.jsx
import { Box, Grid } from "@mui/material";
import PinMapCard from "../../PinMapCard";
import PinDetailsCard from "../PinDetailsCard";

export default function PinSidebar({ pin, isMobile }) {
  if (isMobile) {
    return (
      <>
        <Box mb={2}>
          <PinMapCard pin={pin} isMobile={isMobile} />
        </Box>
        <Box>
          <PinDetailsCard pin={pin} isMobile={isMobile} />
        </Box>
      </>
    );
  }

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <PinMapCard pin={pin} />
      </Grid>
      <Grid item>
        <PinDetailsCard pin={pin} />
      </Grid>
    </Grid>
  );
}
