// src/components/CountryPage/CountryMap.jsx

import React from "react";
// You can use react-leaflet, google-maps-react, or your preferred library.
// Here, I'll use react-leaflet as a placeholder.

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function CountryMap({ pins, onPinClick, mapCenter = [51, 10], zoom = 5 }) {
  // `pins` should have [{ id, Name, lat, lng }]
  // `onPinClick(pin)` triggers navigation
  if (!pins.length) return null;

  return (
    <div style={{ width: "100%", height: "400px", borderRadius: 12, margin: "1rem 0" }}>
      <MapContainer center={mapCenter} zoom={zoom} style={{ width: "100%", height: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {pins.map((pin) => (
          <Marker
            key={pin.id}
            position={[pin.lat, pin.lng]}
            eventHandlers={{
              click: () => onPinClick(pin),
            }}
          >
            <Popup>{pin.Name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
