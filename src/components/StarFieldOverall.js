// src/components/StarField.jsx
import React, { useRef, useEffect } from "react";

export default function StarFieldOverall() {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const stars = [];

    for (let i = 0; i < 300; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.2 + 0.2,
        d: Math.random() * 0.05 + 0.01,
        alpha: Math.random(),
      });
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      stars.forEach((s) => {
        s.alpha += s.d;
        if (s.alpha <= 0 || s.alpha >= 1) s.d = -s.d;
        ctx.globalAlpha = s.alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 0,
        background: "#000",
      }}
    />
  );
}
