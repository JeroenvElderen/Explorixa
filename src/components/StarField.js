import React, { useRef, useEffect } from "react";

export default function StarField({ backgroundUrl, bgRef, animate = true }) {
  const canvasRef = useRef();
  const animationRef = useRef();

  // Star and shooting star creators (same logic as before)
  function createStar(w, h, layer) {
    const colors = [
      "rgba(255,255,255,0.95)",
      "rgba(200,220,255,0.88)",
      "rgba(255,240,200,0.85)",
      "rgba(170,220,255,0.7)"
    ];
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * (layer === 1 ? 1.8 : 1.1) + 0.4,
      d: (Math.random() - 0.5) * (0.07 + layer * 0.04),
      alpha: Math.random() * 0.9 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
      twinkle: Math.random() > 0.7,
      layer,
    };
  }

  function createShootingStar(w, h) {
    return {
      x: Math.random() * w,
      y: Math.random() * (h / 2),
      length: Math.random() * 80 + 120,
      speed: Math.random() * 14 + 12,
      size: Math.random() * 1.2 + 0.8,
      alpha: 1,
      life: 0,
      maxLife: Math.random() * 12 + 8,
      angle: Math.PI / 3 + (Math.random() - 0.5) * 0.5, // Diagonal
    };
  }

  useEffect(() => {
    if (backgroundUrl || !animate) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    let w = (canvas.width = window.innerWidth * dpr);
    let h = (canvas.height = window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const baseCount = reduceMotion ? 80 : 180;
    const stars = [
      ...Array(baseCount).fill(0).map(() => createStar(w, h, 1)), // Near
      ...Array(Math.floor(baseCount * 0.9)).fill(0).map(() => createStar(w, h, 2)), // Far
    ];
    let shootingStars = [];

    function drawStar(s) {
      ctx.save();
      ctx.globalAlpha = s.alpha;

      if (s.layer === 1) {
        let grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3 * dpr);
        grad.addColorStop(0, s.color);
        grad.addColorStop(0.8, "rgba(255,255,255,0.1)");
        grad.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 3 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * dpr, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = s.layer === 1 ? 10 * dpr : 0;
      ctx.fill();
      ctx.restore();
    }

    function drawShootingStar(s) {
      ctx.save();
      ctx.globalAlpha = s.alpha;
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = s.size * dpr;
      ctx.shadowBlur = 16 * dpr;
      ctx.shadowColor = "#fff";
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(
        s.x - Math.cos(s.angle) * s.length,
        s.y - Math.sin(s.angle) * s.length
      );
      ctx.stroke();
      ctx.restore();
    }

    function animateFrame() {
      // Modern, elegant gradient sky
      let sky = ctx.createRadialGradient(
        w / 2, h * 0.55, h * 0.02,
        w / 2, h * 0.6, h * 0.7
      );
      sky.addColorStop(0, "#161925");
      sky.addColorStop(0.7, "#171b28");
      sky.addColorStop(1, "#0a0a13");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      stars
        .filter((s) => s.layer === 2)
        .forEach((s) => {
          drawStar(s);
          if (s.twinkle && Math.random() > 0.92) s.alpha = Math.random() * 0.8 + 0.2;
        });
      stars
        .filter((s) => s.layer === 1)
        .forEach((s) => {
          drawStar(s);
          if (s.twinkle && Math.random() > 0.82) s.alpha = Math.random() * 0.6 + 0.5;
        });

      // Move stars for drift
      stars.forEach((s) => {
        s.x += s.d * s.layer * 0.5 * dpr;
        if (s.x < 0) s.x = w;
        if (s.x > w) s.x = 0;
      });

      // Shooting stars
      shootingStars.forEach((s) => {
        drawShootingStar(s);
        s.x += Math.cos(s.angle) * s.speed * dpr;
        s.y += Math.sin(s.angle) * s.speed * dpr;
        s.life++;
        s.alpha -= 0.03;
      });
      shootingStars = shootingStars.filter((s) => s.life < s.maxLife && s.alpha > 0);

      if (!reduceMotion && Math.random() > 0.992 && shootingStars.length < 1) {
        shootingStars.push(createShootingStar(w, h));
      }

      animationRef.current = requestAnimationFrame(animateFrame);
    }

    animateFrame();

    const onResize = () => {
      w = canvas.width = window.innerWidth * dpr;
      h = canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [backgroundUrl, animate]);

  // If a backgroundUrl is provided, render that instead of the canvas
  return backgroundUrl ? (
    <div
      ref={bgRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: -1,
        width: "100vw",
        height: "100vh",
        backgroundImage: `url(${backgroundUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "brightness(0.7)",
      }}
    />
  ) : (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: -1,
        width: "100vw",
        height: "100vh",
        background: "transparent",
        transition: "background 1.5s",
        pointerEvents: "none",
      }}
    />
  );
}
