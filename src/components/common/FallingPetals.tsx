'use client';

import React, { useEffect, useRef } from 'react';

interface Props {
  type?: 'petals' | 'hearts' | 'sparkles';
  count?: number;
}

function FallingPetalsComponent({ type = 'petals', count = 12 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let lastTime = performance.now();
    let isVisibleOnScreen = true;

    // Mobile detection for particle budget
    const isMobileDevice = window.innerWidth < 768;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // IntersectionObserver to pause loop when canvas is off-screen
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          isVisibleOnScreen = entries[0]?.isIntersecting ?? true;
        },
        { threshold: 0.05 }
      );
      observer.observe(canvas);
    }

    // Particle items
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
      color: string;
    }

    const colors =
      type === 'hearts'
        ? ['#ff758c', '#ff7eb3', '#f78ca0']
        : ['#f8b4b4', '#fbcfe8', '#fecdd3', '#fda4af'];

    // On mobile, cap particles strictly to 6-7 to save GPU & battery
    const maxAllowed = isMobileDevice ? 6 : 12;
    const actualCount = Math.min(count, maxAllowed);

    const particles: Particle[] = Array.from({ length: actualCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * (isMobileDevice ? 6 : 8) + 5,
      speedX: Math.random() * 1.0 - 0.5,
      speedY: Math.random() * 0.8 + 0.5,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 1.2,
      opacity: Math.random() * 0.35 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const drawPetal = (p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;

      ctx.fillStyle = p.color;
      ctx.beginPath();
      // Organic petal shape
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-p.size / 2, -p.size / 2, -p.size, p.size / 3, 0, p.size);
      ctx.bezierCurveTo(p.size, p.size / 3, p.size / 2, -p.size / 2, 0, 0);
      ctx.fill();
      ctx.restore();
    };

    const render = (currentTime: number) => {
      // Pause completely if tab is hidden or canvas is scrolled off-screen
      if (document.hidden || !isVisibleOnScreen) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      // Throttle to max ~30-33 FPS on mobile to eliminate GPU jank and thermal throttle
      const delta = currentTime - lastTime;
      const targetInterval = isMobileDevice ? 33 : 28;
      if (delta < targetInterval) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      lastTime = currentTime - (delta % targetInterval);

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        // Wrap around
        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x > width + 20) p.x = -20;
        if (p.x < -20) p.x = width + 20;

        drawPetal(p);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (observer) observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [type, count]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-20 h-full w-full"
      style={{ mixBlendMode: 'screen', willChange: 'transform' }}
    />
  );
}

export default React.memo(FallingPetalsComponent);
