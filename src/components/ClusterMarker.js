import React from 'react';

/**
 * ClusterMarker
 * Renders a circular cluster marker with point count.
 * Props:
 * - count: number of points in the cluster
 * - colorRgb: base color as "R,G,B"
 * - onClick: click handler
 */
export default function ClusterMarker({ count, colorRgb, onClick }) {
  const strong = `rgba(${colorRgb},0.85)`;
  const soft = `rgba(${colorRgb},0.7)`;

  return (
    <div
      onClick={onClick}
      style={{
        background: `linear-gradient(145deg, ${strong} 0%, ${soft} 100%)`,
        border: '1px solid rgba(255,255,255,0.4)',
        boxShadow: `inset 0 0 10px rgba(255,255,255,0.4), 0 0 12px ${soft}`,
        backdropFilter: 'blur(12px)',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 'bold',
        cursor: 'pointer',
      }}
    >
      {count}
    </div>
  );
}
