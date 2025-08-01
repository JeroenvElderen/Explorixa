// components/continent/RecentPinsGrid.js
import { Grid } from "@mui/material";
import PinCardWithTimeAgo from "./PinCardWithTimeAgo";
import { motion } from "framer-motion";

export default function RecentPinsGrid({ recentPins, onUpdated }) {
  return (
    <Grid container spacing={3}>
      {recentPins.map((pin, idx) => (
        <Grid item xs={12} sm={6} md={3} key={pin.id}>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 * idx, duration: 0.44, type: "spring" }}
            whileHover={{
              scale: 1.04,
              boxShadow: "0 6px 28px 0 rgba(241,143,1,0.13)",
            }}
            style={{ borderRadius: 18 }}
          >
            <PinCardWithTimeAgo pin={pin} idx={idx} onUpdated={onUpdated} />
          </motion.div>
        </Grid>
      ))}
    </Grid>
  );
}
