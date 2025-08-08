// src/components/pinpage/PinMainCard/index.jsx
import { Card, CardContent, CardActions, Grid } from "@mui/material";
import PinHeader from "../PinHeader";
import PinAuthorInfo from "../PinAuthorInfo";
import PinStats from "../PinStats";

export default function PinMainCard({ pin, currentUserId, setPin, isMobile }) {
  return (
    <Card
      sx={{
        mt: isMobile ? -3 : 3,
        mb: 3,
        width: isMobile ? "98vw" : "100%",
        left: isMobile ? "50%" : 0,
        transform: isMobile ? "translateX(-50%)" : "none",
        position: "relative",
        overflow: "hidden",
        backdropFilter: "blur(20px)",
        background: "linear-gradient(145deg, rgba(241,143,1,0.3) 0%, rgba(241,143,1,0) 100%)",
        border: "1px solid rgba(255,255,255,0.6)",
        boxShadow: "0 6px 15px rgba(241,143,1,0.3)",
        borderRadius: "18px",
      }}
    >
      <CardContent>
        <PinHeader pin={pin} onUpdated={updated => setPin(prev => ({ ...prev, ...updated }))} />
      </CardContent>
      <CardActions sx={{ px: 3, py: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <PinAuthorInfo pin={pin} currentUserId={currentUserId} />
          </Grid>
          {!isMobile && (
            <Grid item xs>
              <PinStats pin={pin} />
            </Grid>
          )}
        </Grid>
      </CardActions>
    </Card>
  );
}
