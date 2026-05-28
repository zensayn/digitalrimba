"use client";

import { useEffect, useRef } from 'react';

export default function ParticlesBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const blueTemplates = [
      'absolute w-2 h-0.5 rounded-full opacity-80 rotate-12 bg-[#4176ED]',
      'absolute w-2.5 h-1 rounded-full opacity-60 -rotate-45 bg-[#4176ED]',
      'absolute w-1.5 h-0.5 rounded-full opacity-70 rotate-45 bg-[#4176ED]',
      'absolute w-2 h-0.5 rounded-full opacity-90 -rotate-12 bg-[#4176ED]',
      'absolute w-2 h-1 rounded-full opacity-50 rotate-90 bg-[#4176ED]',
      'absolute w-1.5 h-1.5 rounded-full opacity-60 bg-[#4176ED]'
    ];

    const TOTAL_PARTICLES = 120;
    const particleData: {
      el: HTMLDivElement;
      x: number;
      y: number;
      vx: number;
      vy: number;
      ease: number;
    }[] = [];

    let mouseX = -1000;
    let mouseY = -1000;
    let isMouseActive = false;
    let lastMoveTime = 0;
    const STILL_TIMEOUT = 1000;

    const MOUSE_REPEL_RADIUS = 14;
    const PARTICLE_SEPARATION = 4.5;
    const ATTRACTION_SPEED = 0.06;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 100;
      mouseY = (e.clientY / window.innerHeight) * 100;
      isMouseActive = true;
      lastMoveTime = Date.now();
    };

    const handleMouseLeave = () => {
      isMouseActive = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const createParticles = () => {
      for (let i = 0; i < TOTAL_PARTICLES; i++) {
        const randomTemplate = blueTemplates[Math.floor(Math.random() * blueTemplates.length)];
        const particle = document.createElement('div');
        particle.className = randomTemplate;
        container.appendChild(particle);

        particleData.push({
          el: particle,
          x: Math.random() * 100,
          y: Math.random() * 100,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          ease: 0.03 + Math.random() * 0.04
        });
      }
    };

    createParticles();

    const animateParticles = () => {
      const now = Date.now();
      const isCurrentlyAttracting = isMouseActive && (now - lastMoveTime < STILL_TIMEOUT);

      particleData.forEach((p, index) => {
        let currentFriction = 0.90;
        let sizeScale = 1;

        if (isCurrentlyAttracting) {
          const dx = p.x - mouseX;
          const dy = p.y - mouseY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          sizeScale = Math.max(0.3, Math.min(1.2, distance / 25));

          if (distance > MOUSE_REPEL_RADIUS) {
            p.vx -= (dx / distance) * ATTRACTION_SPEED;
            p.vy -= (dy / distance) * ATTRACTION_SPEED;
          }

          if (distance < MOUSE_REPEL_RADIUS) {
            const force = (MOUSE_REPEL_RADIUS - distance) / MOUSE_REPEL_RADIUS;
            p.vx += (dx / distance) * force * 0.8;
            p.vy += (dy / distance) * force * 0.8;
          }

          for (let j = index + 1; j < particleData.length; j++) {
            const p2 = particleData[j];
            const pdx = p.x - p2.x;
            const pdy = p.y - p2.y;
            const pDist = Math.sqrt(pdx * pdx + pdy * pdy);

            if (pDist < PARTICLE_SEPARATION) {
              const pForce = (PARTICLE_SEPARATION - pDist) / PARTICLE_SEPARATION;
              p.vx += (pdx / pDist) * pForce * 0.2;
              p.vy += (pdy / pDist) * pForce * 0.2;
              p2.vx -= (pdx / pDist) * pForce * 0.2;
              p2.vy -= (pdy / pDist) * pForce * 0.2;
            }
          }
        } else {
          currentFriction = 0.98;
          p.vx += (Math.random() - 0.5) * 0.03;
          p.vy += (Math.random() - 0.5) * 0.03;
          sizeScale = 1;

          if (p.x < -10) p.x = 110;
          if (p.x > 110) p.x = -10;
          if (p.y < -10) p.y = 110;
          if (p.y > 110) p.y = -10;
        }

        p.vx *= currentFriction;
        p.vy *= currentFriction;
        p.x += p.vx;
        p.y += p.vy;

        p.el.style.left = `${p.x}%`;
        p.el.style.top = `${p.y}%`;

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const finalScale = sizeScale + (speed * 1.2);

        p.el.style.transform = `translate(-50%, -50%) rotate(${p.vx * 400}deg) scale(${finalScale})`;
      });

      animationFrameId = requestAnimationFrame(animateParticles);
    };

    animateParticles();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0" aria-hidden="true" />;
}
