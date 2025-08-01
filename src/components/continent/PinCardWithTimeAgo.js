// components/continent/PinCardWithTimeAgo.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PinCard from "examples/Charts/PinCard";
import { motion } from "framer-motion";

function timeAgo(date) {
  if (!date) return "";
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  if (diffMs < 0) return "Just now";
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

export default function PinCardWithTimeAgo({ pin, idx, onUpdated }) {
  const [timeSincePost, setTimeSincePost] = useState(() => timeAgo(pin.created_at));
  const navigate = useNavigate();

  useEffect(() => {
    const iv = setInterval(() => setTimeSincePost(timeAgo(pin.created_at)), 60000);
    return () => clearInterval(iv);
  }, [pin.created_at]);

  const handleCardClick = (e) => {
    if (e.target.closest(".pin-interaction-panel")) return;
    const continentSlug = encodeURIComponent(pin.continent || pin.Continent || "unknown-continent");
    const countrySlug = encodeURIComponent(pin.countryName || pin.Country || "unknown-country");
    const pinSlug = encodeURIComponent((pin.Name || pin.id || "unknown-pin").replace(/\s+/g, "_"));
    const route = `/Destinations/${continentSlug}/${countrySlug}/${pinSlug}`;
    navigate(route, { state: { pin } });
  };

  return (
    <motion.div whileHover={{ scale: 1.03 }}>
      <PinCard
        pin={pin}
        onUpdated={onUpdated}
        color={idx === 0 ? "info" : idx === 1 ? "success" : "dark"}
        title={pin.Name || "Untitled"}
        imageurl={pin["Main Image"]}
        imagealt={pin.Name}
        height="150px"
        truncateDescription={false}
        onCardClick={handleCardClick}
        timeAgoLabel={timeSincePost}
      />
    </motion.div>
  );
}
