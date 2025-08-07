// src/components/pinpage/PinSidebar/index.jsx
import { Grid } from "@mui/material";
import PinMapCard from "../../PinMapCard";
import PinDetailsCard from "../PinDetailsCard";

export default function PinSidebar({ pin }) {
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
