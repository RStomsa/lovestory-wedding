'use client';

import React, { useEffect, useRef } from 'react';
import { FallingEffectType } from './studioTypes';

interface Props {
  enabled: boolean;
  type: FallingEffectType;
  width: number;
  height: number;
}

export default function StudioFallingOverlay({ enabled, type, width, height }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let isHidden = false;
    let lastDrawTime = 0;
    const frameInterval = 1000 / 30; // Max 30 FPS per AGENTS.md rule

    const handleVisibilityChange = () => {
      isHidden = document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Particle icons/types
    const getChars = () => {
      switch (type) {
        case 'snow':
          return ['❄', '❅', '❆'];
        case 'hearts':
          return ['❤️', '💖', '💕'];
        case 'petals':
          return ['🌸', '🌺', '🌷'];
        case 'stars':
          return ['⭐', '✨', '🌟'];
        case 'confetti':
          return ['🎉', '🎊', '✨'];
        case 'butterfly':
          return ['🦋'];
        case 'heart-snow':
          return ['❤️', '❄️'];
        default:
          return ['❄'];
      }
    };

    const chars = getChars();
    const particleCount = 18;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      char: chars[Math.floor(Math.random() * chars.length)],
      size: Math.random() * 12 + 12,
      speedX: (Math.random() - 0.5) * 0.8,
      speedY: Math.random() * 1.5 + 0.8,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 2,
      opacity: Math.random() * 0.5 + 0.4,
    }));

    const render = (time: number) => {
      animId = requestAnimationFrame(render);
      if (isHidden || time - lastDrawTime < frameInterval) return;
      lastDrawTime = time;

      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.font = `${p.size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.char, 0, 0);
        ctx.restore();
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, type, width, height]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none z-40"
    />
  );
}
