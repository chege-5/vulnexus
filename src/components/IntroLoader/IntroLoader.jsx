import { useEffect, useMemo } from 'react';
import logo from '../../assets/logo.png';
import './IntroLoader.css';

const INTRO_DURATION = 4200;
const REDUCED_DURATION = 700;
const WORD = 'VulNexus';

const particlePalette = ['#7DB4E2', '#F8FBFF', '#D9B75F', '#EF4444'];

function makeParticles(count) {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    const radius = 24 + (index % 9) * 6;
    const drift = Math.sin(angle) * radius;
    const fall = 110 + (index % 8) * 18;

    return {
      id: index,
      color: particlePalette[index % particlePalette.length],
      x: `${drift.toFixed(2)}px`,
      y: `${fall}px`,
      size: `${2 + (index % 3)}px`,
      delay: `${(index % 14) * 32}ms`,
      duration: `${780 + (index % 7) * 45}ms`,
      left: `${12 + ((index * 17) % 76)}%`,
      top: `${32 + ((index * 11) % 26)}%`,
    };
  });
}

function makeBackgroundParticles() {
  return Array.from({ length: 18 }, (_, index) => ({
    id: index,
    left: `${(index * 47) % 100}%`,
    top: `${(index * 31) % 100}%`,
  }));
}

function makeCracks() {
  return Array.from({ length: 14 }, (_, index) => ({
    id: index,
    left: `${16 + ((index * 13) % 68)}%`,
    top: `${22 + ((index * 19) % 48)}%`,
    width: `${18 + (index % 4) * 9}px`,
    rotate: `${(index * 23) - 80}deg`,
  }));
}

export default function IntroLoader({ onComplete }) {
  const particles = useMemo(() => makeParticles(54), []);
  const backgroundParticles = useMemo(() => makeBackgroundParticles(), []);
  const cracks = useMemo(() => makeCracks(), []);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timeout = window.setTimeout(onComplete, reducedMotion ? REDUCED_DURATION : INTRO_DURATION);

    return () => window.clearTimeout(timeout);
  }, [onComplete]);

  return (
    <div className="intro-loader" role="status" aria-live="polite" aria-label="Opening VulNexus">
      <div className="intro-glow" aria-hidden="true" />
      <div className="intro-particles-bg" aria-hidden="true">
        {backgroundParticles.map((particle) => (
          <span key={particle.id} style={{ '--i': particle.id, left: particle.left, top: particle.top }} />
        ))}
      </div>

      <div className="intro-mark">
        <div className="intro-logo-wrap">
          <img src={logo} alt="" className="intro-logo" aria-hidden="true" />
          <div className="intro-logo-glint" aria-hidden="true" />
        </div>

        <div className="intro-word" aria-hidden="true">
          <span className="intro-type">{WORD}</span>
          <span className="intro-cursor">█</span>
        </div>

        <div className="intro-cracks" aria-hidden="true">
          {cracks.map((crack) => (
            <span
              key={crack.id}
              style={{
                '--i': crack.id,
                '--crack-width': crack.width,
                '--crack-rotate': crack.rotate,
                left: crack.left,
                top: crack.top,
              }}
            />
          ))}
        </div>

        <div className="intro-collapse-particles" aria-hidden="true">
          {particles.map((particle) => (
            <span
              key={particle.id}
              style={{
                '--particle-color': particle.color,
                '--particle-x': particle.x,
                '--particle-y': particle.y,
                '--particle-size': particle.size,
                '--particle-delay': particle.delay,
                '--particle-duration': particle.duration,
                left: particle.left,
                top: particle.top,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
