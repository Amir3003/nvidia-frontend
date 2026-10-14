import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  glowColor: string;
  phase: number;
  phaseSpeed: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export const AmbientBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -1000,
    y: -1000,
    active: false,
  });
  const shockwavesRef = useRef<Shockwave[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const handleClick = (e: MouseEvent) => {
      shockwavesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 4,
        maxRadius: 180,
        alpha: 0.8,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick);

    // Particle Palette: Vivid Emerald (#10B981), Cyan (#06B6D4), Electric Indigo (#6366F1), Soft Amber (#F59E0B)
    const palette = [
      { fill: 'rgba(16, 185, 129, 0.95)', glow: 'rgba(16, 185, 129, 0.35)' },
      { fill: 'rgba(6, 182, 212, 0.95)', glow: 'rgba(6, 182, 212, 0.35)' },
      { fill: 'rgba(99, 102, 241, 0.95)', glow: 'rgba(99, 102, 241, 0.35)' },
      { fill: 'rgba(20, 184, 166, 0.90)', glow: 'rgba(20, 184, 166, 0.30)' },
      { fill: 'rgba(245, 158, 11, 0.85)', glow: 'rgba(245, 158, 11, 0.25)' },
    ];

    const particleCount = 48;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const pColor = palette[Math.floor(Math.random() * palette.length)];
      const speed = 0.4 + Math.random() * 0.75;
      const angle = Math.random() * Math.PI * 2;
      const baseRadius = 2.4 + Math.random() * 2.8;

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: baseRadius,
        baseRadius,
        color: pColor.fill,
        glowColor: pColor.glow,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.02 + Math.random() * 0.02,
      });
    }

    let waveTime = 0;

    const render = () => {
      // 1. Base Deep Cosmic Canvas Fill (#0B101E)
      ctx.fillStyle = '#0B101E';
      ctx.fillRect(0, 0, width, height);

      // 2. Smooth animated cosmic ambient color waves (Emerald, Indigo, Cyan)
      waveTime += 0.005;
      const wave1X = width * 0.25 + Math.cos(waveTime) * 140;
      const wave1Y = height * 0.3 + Math.sin(waveTime * 0.8) * 100;
      const grad1 = ctx.createRadialGradient(wave1X, wave1Y, 10, wave1X, wave1Y, width * 0.5);
      grad1.addColorStop(0, 'rgba(16, 185, 129, 0.14)');
      grad1.addColorStop(1, 'rgba(11, 16, 30, 0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const wave2X = width * 0.75 + Math.sin(waveTime * 0.9) * 150;
      const wave2Y = height * 0.65 + Math.cos(waveTime * 0.7) * 120;
      const grad2 = ctx.createRadialGradient(wave2X, wave2Y, 10, wave2X, wave2Y, width * 0.55);
      grad2.addColorStop(0, 'rgba(99, 102, 241, 0.14)');
      grad2.addColorStop(1, 'rgba(11, 16, 30, 0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      const wave3X = width * 0.5 + Math.cos(waveTime * 1.1) * 160;
      const wave3Y = height * 0.15 + Math.sin(waveTime * 1.2) * 80;
      const grad3 = ctx.createRadialGradient(wave3X, wave3Y, 10, wave3X, wave3Y, width * 0.45);
      grad3.addColorStop(0, 'rgba(6, 182, 212, 0.12)');
      grad3.addColorStop(1, 'rgba(11, 16, 30, 0)');
      ctx.fillStyle = grad3;
      ctx.fillRect(0, 0, width, height);

      // 3. Shockwave ripples on click
      for (let s = shockwavesRef.current.length - 1; s >= 0; s--) {
        const sw = shockwavesRef.current[s];
        sw.radius += 5.5;
        sw.alpha *= 0.94;

        ctx.strokeStyle = `rgba(16, 185, 129, ${sw.alpha})`;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Repel particles slightly
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const dx = p.x - sw.x;
          const dy = p.y - sw.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 0 && Math.abs(dist - sw.radius) < 35) {
            const force = (1 - Math.abs(dist - sw.radius) / 35) * 1.8;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        if (sw.radius > sw.maxRadius || sw.alpha < 0.02) {
          shockwavesRef.current.splice(s, 1);
        }
      }

      // 4. Draw dynamic constellation lines between nearby nodes (< 180px)
      const maxDistance = 180;
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.38;
            ctx.strokeStyle = `rgba(14, 165, 233, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // 5. Connect particles to mouse cursor if within 220px
      if (mouseRef.current.active) {
        const mouseX = mouseRef.current.x;
        const mouseY = mouseRef.current.y;

        // Subtle soft cursor ripple glow
        const mouseGlow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 110);
        mouseGlow.addColorStop(0, 'rgba(16, 185, 129, 0.22)');
        mouseGlow.addColorStop(0.5, 'rgba(6, 182, 212, 0.10)');
        mouseGlow.addColorStop(1, 'rgba(11, 16, 30, 0)');
        ctx.fillStyle = mouseGlow;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 110, 0, Math.PI * 2);
        ctx.fill();

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const mdx = mouseX - p.x;
          const mdy = mouseY - p.y;
          const mDist = Math.hypot(mdx, mdy);

          if (mDist < 220) {
            // Gentle gravitational pull toward cursor
            const force = (1 - mDist / 220) * 0.16;
            p.vx += (mdx / mDist) * force;
            p.vy += (mdy / mDist) * force;

            // Constellation line to cursor
            const mAlpha = (1 - mDist / 220) * 0.55;
            ctx.strokeStyle = `rgba(16, 185, 129, ${mAlpha})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();
          }
        }
      }

      // 6. Update and render particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Velocity friction cap to keep speeds elegant
        const currentSpeed = Math.hypot(p.vx, p.vy);
        if (currentSpeed > 1.6) {
          p.vx = (p.vx / currentSpeed) * 1.6;
          p.vy = (p.vy / currentSpeed) * 1.6;
        } else if (currentSpeed < 0.4) {
          p.vx = (p.vx / (currentSpeed || 1)) * 0.4;
          p.vy = (p.vy / (currentSpeed || 1)) * 0.4;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Screen boundary rebound
        if (p.x < 0) {
          p.x = 0;
          p.vx *= -1;
        } else if (p.x > width) {
          p.x = width;
          p.vx *= -1;
        }
        if (p.y < 0) {
          p.y = 0;
          p.vy *= -1;
        } else if (p.y > height) {
          p.y = height;
          p.vy *= -1;
        }

        // Pulse radius
        p.phase += p.phaseSpeed;
        p.radius = p.baseRadius + Math.sin(p.phase) * 0.8;

        // Draw outer luminous aura
        const auraRadius = p.radius * 4;
        const auraGrad = ctx.createRadialGradient(p.x, p.y, p.radius * 0.4, p.x, p.y, auraRadius);
        auraGrad.addColorStop(0, p.glowColor);
        auraGrad.addColorStop(1, 'rgba(11, 16, 30, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, auraRadius, 0, Math.PI * 2);
        ctx.fill();

        // Draw solid particle core
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 select-none block"
    />
  );
};

export default AmbientBackground;
