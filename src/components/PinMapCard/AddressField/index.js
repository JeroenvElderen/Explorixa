// AddressField.jsx
import React from "react";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CopyableField from "../CopyableField";

export function AddressField({ pinName, address }) {
  // build your copy‐string here…
  const full = address.includes(pinName) ? address : `${pinName}, ${address}`;
  return <CopyableField icon={LocationOnIcon} label={pinName} value={full} />;
}

