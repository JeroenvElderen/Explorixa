// src/components/CountryPage/CountryMap.jsx

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { motion } from "framer-motion";
import "leaflet/dist/leaflet.css";

export default function CountryMap({
  pins,
  onPinClick,
  mapCenter = [51, 10],
  zoom = 4,
}) {
  if (!pins.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 38 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, delay: 0.15 }}
      whileHover={{ boxShadow: "0 10px 34px 0 rgba(241,143,1,0.15)", scale: 1.01 }}
      style={{
        width: "100%",
        height: 420,
        borderRadius: 22,
        margin: "1.5rem 0",
        overflow: "hidden",
        border: "1.6px solid rgba(241,143,1,0.10)",
        background: "linear-gradient(120deg, rgba(255,255,255,0.21) 40%, rgba(241,143,1,0.08) 100%)",
        boxShadow: "0 2px 24px 0 rgba(241,143,1,0.07)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        transition: "box-shadow 0.28s cubic-bezier(.4,2.3,.3,1)"
      }}
    >
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {pins.map((pin, idx) => (
          <Marker
            key={pin.id}
            position={[pin.lat, pin.lng]}
            eventHandlers={{
              click: () => onPinClick(pin),
            }}
          >
            <Popup>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{pin.Name}</div>
              {/* Add more info if you want */}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </motion.div>
  );
}
