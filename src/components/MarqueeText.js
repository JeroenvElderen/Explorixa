import React, { useRef, useEffect, useState } from "react";

export default function MarqueeText({ children, duration = 18 }) {
  const spanRef = useRef();
  const containerRef = useRef();
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [textWidth, setTextWidth] = useState(0);

  useEffect(() => {
    if (spanRef.current && containerRef.current) {
      setTextWidth(spanRef.current.offsetWidth);
      setShouldAnimate(spanRef.current.offsetWidth > containerRef.current.offsetWidth);
    }
  }, [children]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        overflow: "hidden",
        whiteSpace: "nowrap",
        position: "relative",
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "inline-block",
          whiteSpace: "nowrap",
          minWidth: shouldAnimate ? `${textWidth * 2}px` : undefined,
          animation: shouldAnimate
            ? `marquee-seamless ${duration}s linear infinite`
            : undefined,
        }}
      >
        <span ref={spanRef} style={{ display: "inline-block", paddingRight: 5 }}>
          {children}
        </span>
        {shouldAnimate && (
          <span style={{ display: "inline-block", paddingRight: 5 }}>
            {children}
          </span>
        )}
      </div>
      <style>
        {`
          @keyframes marquee-seamless {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}
      </style>
    </div>
  );
}
