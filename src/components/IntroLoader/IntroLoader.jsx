import { useEffect, useMemo } from 'react';
import logo from '../../assets/logo.png';
import './IntroLoader.css';

const INTRO_DURATION = 4100;
const REDUCED_DURATION = 650;
const WORD = 'VulNexus';

const particlePalette = ['#6fb7ff', '#f8fbff', '#d9b75f', '#d94747'];

function makeParticles(count) {
  return Array.from({ length: count }, (_, index) => {
    const column = index % 12;
    const row = Math.floor(index / 12);
    const angle = ((index * 37) % 360) * (Math.PI / 180);
    const drift = Math.cos(angle) * (18 + (index % 7) * 7);
    const fall = 118 + row * 18 + (index % 5) * 10;

    return {
      id: index,
      color: particlePalette[index % particlePalette.length],
      x: `${drift.toFixed(2)}px`,
      y: `${fall}px`,
      size: `${1.5 + (index % 3) * 0.75}px`,
      delay: `${(index % 16) * 24}ms`,
      duration: `${720 + (index % 6) * 55}ms`,
      left: `${9 + column * 7.4 + (row % 2) * 1.5}%`,
      top: `${16 + ((index * 11) % 58)}%`,
    };
  });
}

function makeBackgroundParticles() {
  return Array.from({ length: 22 }, (_, index) => ({
    id: index,
    left: `${4 + ((index * 43) % 92)}%`,
    top: `${5 + ((index * 29) % 88)}%`,
    opacity: `${0.08 + (index % 4) * 0.035}`,
  }));
}

function makeCracks() {
  return Array.from({ length: 18 }, (_, index) => ({
    id: index,
    left: `${10 + ((index * 17) % 78)}%`,
    top: `${15 + ((index * 23) % 64)}%`,
    width: `${12 + (index % 5) * 7}px`,
    rotate: `${-76 + ((index * 31) % 152)}deg`,
    delay: `${index * 18}ms`,
  }));
}

export default function IntroLoader({ onComplete }) {
  const particles = useMemo(() => makeParticles(72), []);
  const backgroundParticles = useMemo(() => makeBackgroundParticles(), []);
  const cracks = useMemo(() => makeCracks(), []);

  useEffect(() => {
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const timeout = window.setTimeout(onComplete, reducedMotion ? REDUCED_DURATION : INTRO_DURATION);

    return () => window.clearTimeout(timeout);
  }, [onComplete]);

  return (
    <div className="intro-loader" role="status" aria-live="polite" aria-label="Opening VulNexus" aria-atomic="true">
      <span className="sr-only">Opening VulNexus</span>
      <div className="intro-loader__glow" aria-hidden="true" />
      <div className="intro-loader__field" aria-hidden="true">
        {backgroundParticles.map((particle) => (
          <span
            key={particle.id}
            style={{
              '--i': particle.id,
              '--particle-opacity': particle.opacity,
              left: particle.left,
              top: particle.top,
            }}
          />
        ))}
      </div>

      <div className="intro-loader__lockup" aria-hidden="true">
        <div className="intro-loader__logo-shell">
          <img src={logo} alt="" className="intro-loader__logo" />
          <span className="intro-loader__logo-light" />
        </div>

        <div className="intro-loader__word">
          <span className="intro-loader__type">{WORD}</span>
          <span className="intro-loader__cursor">█</span>
        </div>

        <div className="intro-loader__fractures">
          {cracks.map((crack) => (
            <span
              key={crack.id}
              style={{
                '--i': crack.id,
                '--crack-width': crack.width,
                '--crack-rotate': crack.rotate,
                '--crack-delay': crack.delay,
                left: crack.left,
                top: crack.top,
              }}
            />
          ))}
        </div>

        <div className="intro-loader__collapse">
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
