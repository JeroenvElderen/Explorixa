import React from "react";
import { Button, Stack, Paper } from "@mui/material";
import { motion } from "framer-motion";

export default function NavigationButtons({
  continent,
  onBack,
  onNextCountry,
  onPrevCountry,
  disableNext,
  disablePrev,
  currentCountry,
  countriesList,
  navigate,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.52, delay: 0.15 }}
      style={{
        width: "100%",
        borderRadius: 18,
        backdropFilter: "blur(10px)",
        background: "linear-gradient(90deg,rgba(255,255,255,0.13),rgba(241,143,1,0.04) 100%)",
        boxShadow: "0 4px 20px 0 rgba(241,143,1,0.07)",
        padding: "0.75rem 1.25rem",
        marginBottom: 16,
      }}
    >
      <Stack direction="row" spacing={2}>
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button
            variant="outlined"
            onClick={onBack}
            sx={{
              borderColor: "rgba(243,143,1,0.6)",
              color: "white",
              background: "rgba(255,255,255,0.07)",
              "&:hover": {
                background: "rgba(243,143,1,0.10)",
                borderColor: "#F18F01",
                color: "#F18F01",
                boxShadow: "0 0 0 2px #f18f0133",
              },
              fontWeight: 500,
              letterSpacing: 0.2,
              px: 2,
            }}
            disabled={!continent}
          >
            ← Back to {continent || "continent"}
          </Button>
        </motion.div>
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button
            variant="outlined"
            onClick={onPrevCountry}
            disabled={disablePrev}
            sx={{
              borderColor: "rgba(243,143,1,0.6)",
              color: disablePrev ? "#bbb" : "#fff",
              fontWeight: 600,
              background: disablePrev
                ? "rgba(255,255,255,0.04)"
                : "rgba(243,143,1,0.07)",
              "&:hover": !disablePrev && {
                background: "rgba(243,143,1,0.13)",
                borderColor: "#F18F01",
                color: "#F18F01",
                boxShadow: "0 0 0 2px #f18f0133",
              },
              px: 2,
            }}
          >
            ← Previous Country
          </Button>
        </motion.div>
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button
            variant="outlined"
            onClick={onNextCountry}
            disabled={disableNext}
            sx={{
              borderColor: "rgba(243,143,1,0.6)",
              color: disableNext ? "#bbb" : "#fff",
              fontWeight: 600,
              background: disableNext
                ? "rgba(255,255,255,0.04)"
                : "rgba(243,143,1,0.07)",
              "&:hover": !disableNext && {
                background: "rgba(243,143,1,0.13)",
                borderColor: "#F18F01",
                color: "#F18F01",
                boxShadow: "0 0 0 2px #f18f0133",
              },
              px: 2,
            }}
          >
            Next Country →
          </Button>
        </motion.div>
      </Stack>
    </motion.div>
  );
}
