import React, { useEffect, useRef } from 'react';

export const AstraGalaxyCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particles for Galaxy Spiral
    const particleCount = 1200;
    const particles = [];
    const arms = 4;
    const armWidth = 0.5;

    for (let i = 0; i < particleCount; i++) {
      const radius = Math.pow(Math.random(), 1.8) * (Math.min(width, height) * 0.38);
      const armIndex = i % arms;
      const angleOffset = (armIndex * (2 * Math.PI)) / arms;
      const spiralAngle = radius * 0.015;
      const scatter = (Math.random() - 0.5) * armWidth * (1 + radius * 0.005);
      
      const angle = angleOffset + spiralAngle + scatter;
      
      // Colors: blue, cyan, white, orange/gold
      const colorRoll = Math.random();
      let color;
      if (colorRoll < 0.45) color = 'rgba(56, 189, 248, '; // cyan
      else if (colorRoll < 0.75) color = 'rgba(147, 197, 253, '; // light blue
      else if (colorRoll < 0.90) color = 'rgba(255, 255, 255, '; // white
      else color = 'rgba(251, 146, 60, '; // gold/orange

      particles.push({
        radius,
        angle,
        speed: (0.0005 + (1 / (radius + 20)) * 0.08) * (Math.random() > 0.5 ? 1 : 1.1),
        size: Math.random() * 2.2 + 0.6,
        alpha: Math.random() * 0.8 + 0.2,
        color
      });
    }

    // Twinkling stars in deep space
    const starCount = 300;
    const stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.7 + 0.1,
        twinkleSpeed: Math.random() * 0.02 + 0.005
      });
    }

    let globalRotation = 0;
    let mouseX = width / 2;
    let mouseY = height / 2;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.fillStyle = '#05070e';
      ctx.fillRect(0, 0, width, height);

      // Deep space nebula glow
      const cx = width / 2 + (mouseX - width / 2) * 0.03;
      const cy = height / 2 + (mouseY - height / 2) * 0.03;

      const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, Math.min(width, height) * 0.5);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
      grad.addColorStop(0.3, 'rgba(124, 58, 237, 0.15)');
      grad.addColorStop(0.7, 'rgba(15, 23, 42, 0.4)');
      grad.addColorStop(1, 'rgba(5, 7, 14, 1)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw background stars
      stars.forEach(star => {
        star.alpha += Math.sin(Date.now() * star.twinkleSpeed) * 0.01;
        star.alpha = Math.max(0.1, Math.min(0.8, star.alpha));
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Galaxy Spiral
      globalRotation += 0.0015;

      particles.forEach(p => {
        p.angle += p.speed;
        const currentAngle = p.angle + globalRotation;
        const x = cx + Math.cos(currentAngle) * p.radius;
        const y = cy + Math.sin(currentAngle) * p.radius;

        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Extra glow for brighter stars
        if (p.size > 1.8) {
          ctx.fillStyle = `${p.color}${p.alpha * 0.3})`;
          ctx.beginPath();
          ctx.arc(x, y, p.size * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Galaxy Center Bright Core
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 45);
      coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      coreGrad.addColorStop(0.3, 'rgba(186, 230, 253, 0.7)');
      coreGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.3)');
      coreGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 45, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
};
