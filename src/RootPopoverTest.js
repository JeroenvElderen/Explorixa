import React, { useState } from "react";
import Popover from "@mui/material/Popover";

// This is a totally independent debug popover, always rendered at the absolute root.
export default function RootPopoverTest() {
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <div style={{ position: "fixed", top: 20, left: 20, zIndex: 10000 }}>
      <button
        style={{
          padding: "10px 20px",
          fontWeight: "bold",
          borderRadius: 8,
          border: "2px solid #333",
          background: "#fff",
          cursor: "pointer",
        }}
        onClick={e => setAnchorEl(e.currentTarget)}
      >
        OPEN TEST POPOVER
      </button>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        PaperProps={{ sx: { background: "#fff", zIndex: 99999 } }}
        disablePortal={false}
        container={typeof window !== "undefined" ? document.body : undefined}
      >
        <div style={{ padding: 40, background: "#fff", fontSize: 24 }}>
          ROOT TEST POPOVER
        </div>
      </Popover>
    </div>
  );
}
