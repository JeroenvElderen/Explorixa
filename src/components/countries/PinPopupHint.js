// src/components/CountryPage/PinPopupHint.jsx

import React from "react";
import { Tooltip } from "@mui/material";

export default function PinPopupHint({ children }) {
  return (
    <Tooltip title="Click to see all pins for this country!" arrow>
      <span>{children}</span>
    </Tooltip>
  );
}
