// src/components/pinpage/PinMediaSection/index.jsx
import { Box } from "@mui/material";
import PinImageCarousel from "../PinImageCarousel";
import PinInteractionPanel from "../../PinInteractionPanel";
import PinMapCard from "../../PinMapCard";

export default function PinMediaSection({ images, pin, isMobile, setPin }) {
  if (isMobile) {
    return (
      <Box sx={{ position: "relative", width: "100vw", left: "50%", transform: "translateX(-50%)" }}>
        <PinImageCarousel images={images} />
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            display: "flex",
            gap: 1,
            bgcolor: "rgba(0,0,0,0.3)",
            p: 0.5,
            borderRadius: 2,
          }}
        >
          <PinInteractionPanel pin={pin} onUpdated={updated => setPin(prev => ({ ...prev, ...updated }))} />
        </Box>
        <Box sx={{ mb: 4 }}>
          <PinMapCard pin={pin} />
        </Box>
      </Box>
    );
  } else {
    return <PinImageCarousel images={images} />;
  }
}
