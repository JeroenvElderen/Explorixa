// src/components/RecentPins.jsx
import React, { useState, useEffect } from "react";
import ProfilesList from "../examples/Lists/ProfilesList" // adjust import
const STORAGE_KEY = "savedPins";

export default function RecentPins() {
  const [pins, setPins] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      setPins(stored);
    } catch {
      setPins([]);
    }
  }, []);

  // Map your pin objects to the shape ProfilesList expects:
  const profiles = pins.map((pin) => ({
    image: pin.imageurl,
    name: pin.title,
    description: pin.description.length > 100
      ? `${pin.description.slice(0, 100)}…`
      : pin.description,
    action: {
      type: "internal",
      route: `/Destinations/${pin.title.replace(/\s+/g, "_")}`,
      label: "Read More",
      color: "info",
    },
  }));

  return <ProfilesList title="Saved Pins" profiles={profiles} />;
}
