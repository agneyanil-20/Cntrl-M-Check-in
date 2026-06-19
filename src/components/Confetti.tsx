import React from 'react';
import { motion } from 'motion/react';

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  delay: number;
}

interface ConfettiProps {
  active: boolean;
}

const COLORS = ['#EAFF00', '#22c55e', '#3b82f6', '#f43f5e', '#a855f7', '#ff7b00'];

export default function Confetti({ active }: ConfettiProps) {
  if (!active) return null;

  // Generate 40 random colorful particles shooting upwards and outwards
  const particles: ConfettiParticle[] = Array.from({ length: 45 }).map((_, i) => {
    const angle = (Math.random() * 120 + 30) * (Math.PI / 180); // 30 to 150 degrees
    const velocity = Math.random() * 250 + 150; // Pixels per second
    const x = Math.cos(angle) * velocity;
    const y = -Math.sin(angle) * velocity - 100; // Shooting upwards

    return {
      id: i,
      x,
      y,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 8 + 6,
      rotation: Math.random() * 360,
      delay: Math.random() * 0.15,
    };
  });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            x: '50%',
            y: '80%',
            scale: 0.1,
            opacity: 1,
            rotate: 0,
          }}
          animate={{
            x: `calc(50% + ${p.x}px)`,
            y: `calc(80% + ${p.y}px)`,
            scale: [1, 1.2, 0.4],
            opacity: [1, 1, 0],
            rotate: p.rotation + (Math.random() > 0.5 ? 360 : -360),
          }}
          transition={{
            duration: 1.6,
            delay: p.delay,
            ease: "easeOut",
          }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.4 ? '4px' : '50%',
            border: '1.5px solid #000',
          }}
        />
      ))}
    </div>
  );
}
