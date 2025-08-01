import React, { useEffect, useRef } from 'react';
import RowPinCard from 'examples/Charts/PinCard/RowPinCard';

export default function PinCarousel({ features, selectedPinId, onSelect }) {
  const containerRef = useRef(null);
  const selectedRef = useRef(null);

  useEffect(() => {
    if (selectedRef.current && containerRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [selectedPinId]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        overflowX: 'auto',
        padding: '4px 0',
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-x',
        display: 'flex',
      }}
    >
      <div style={{ display: 'flex', gap: 10, padding: '0 4px' }}>
        {features.map(f => {
          const props = f.properties || {};
          const isSelected = props.pinId === selectedPinId;
          return (
            <div
              key={props.pinId}
              ref={isSelected ? selectedRef : null}
              style={{
                flex: '0 0 auto',
                transform: isSelected ? 'scale(1.02)' : 'none',
                transition: 'transform .2s',
                cursor: 'pointer',
                minWidth: 260,
              }}
              onClick={() => onSelect(f)}
            >
              <RowPinCard
                title={props.title}
                description={props.description}
                imageurl={props.imageurl}
                imagealt={props.title}
                compact={true}
                pin={f}
                onClick={() => onSelect(f)}
                style={{
                  border: isSelected ? '2px solid #f18f01' : undefined,
                  background:
                    'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
