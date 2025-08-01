import { Grid } from "@mui/material";
import PinCardWithTimeAgo from "./PinCardWithTimeAgo";

export default function RecentPinsGrid({ recentPins, onUpdated }) {
  return (
    <Grid container spacing={3}>
      {recentPins.map((pin, idx) => (
        <Grid item xs={12} sm={6} md={3} key={pin.id}>
          <PinCardWithTimeAgo pin={pin} idx={idx} onUpdated={onUpdated} />
        </Grid>
      ))}
    </Grid>
  );
}
