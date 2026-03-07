import { useEffect } from 'react';
import './BackgroundFX.css';

const PARTICLES = [
  { x: '8%', y: '16%', size: 5, duration: 28, delay: 0 },
  { x: '18%', y: '72%', size: 3, duration: 34, delay: 5 },
  { x: '28%', y: '26%', size: 4, duration: 30, delay: 9 },
  { x: '38%', y: '82%', size: 2, duration: 26, delay: 3 },
  { x: '46%', y: '18%', size: 6, duration: 40, delay: 6 },
  { x: '58%', y: '66%', size: 3, duration: 24, delay: 10 },
  { x: '68%', y: '24%', size: 4, duration: 32, delay: 2 },
  { x: '74%', y: '78%', size: 5, duration: 36, delay: 8 },
  { x: '84%', y: '44%', size: 3, duration: 29, delay: 4 },
  { x: '92%', y: '20%', size: 2, duration: 33, delay: 11 },
];

export default function BackgroundFX() {
  useEffect(() => {
    const root = document.documentElement;
    const handleMove = (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      root.style.setProperty('--pointer-x', x.toFixed(3));
      root.style.setProperty('--pointer-y', y.toFixed(3));
    };

    root.style.setProperty('--pointer-x', '0');
    root.style.setProperty('--pointer-y', '0');
    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  return (
    <div className="background-fx" aria-hidden="true">
      <div className="background-light background-light-primary" />
      <div className="background-light background-light-secondary" />
      <div className="background-light background-light-tertiary" />
      <div className="background-grid" />
      <div className="background-beam background-beam-left" />
      <div className="background-beam background-beam-right" />
      <div className="background-particles">
        {PARTICLES.map((particle, index) => (
          <span
            key={index}
            className="background-particle"
            style={{
              '--x': particle.x,
              '--y': particle.y,
              '--size': `${particle.size}px`,
              '--duration': `${particle.duration}s`,
              '--delay': `${particle.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}