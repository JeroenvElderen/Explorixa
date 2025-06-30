// CountryMarker.jsx
import React from 'react';
import './CountryMarker.css';  // Move all your inline styles over here

export default function CountryMarker({ iso, colorRgb, onClick }) {
  const strong = `rgba(${colorRgb},0.85)`;
  const soft   = `rgba(${colorRgb},0.7)`;

  return (
    <div className="marker-container" onClick={onClick}>
      <div
        className="marker-bubble"
        style={{
          background: `linear-gradient(145deg, ${strong} 0%, ${soft} 100%)`,
        }}
      >
        {iso}
      </div>
      <div
        className="marker-tail"
        style={{ borderTopColor: strong }}
      />
    </div>
  );
}
