import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import logo from '../../assets/logo.png';
import './PageTransitionLoader.css';

const SHOW_DELAY = 170;
const MIN_VISIBLE = 560;
const EXIT_DURATION = 240;

const STATUS_MESSAGES = [
  'Initializing Secure Session...',
  'Loading Workspace...',
  'Preparing Dashboard...',
  'Syncing Threat Intelligence...',
  'Loading Security Modules...',
  'Validating Permissions...',
  'Establishing Encrypted Context...',
  'Preparing Scanner...',
  'Loading Reports...',
  'Optimizing Interface...',
];

function getRouteMessage(pathname) {
  if (pathname.startsWith('/dashboard')) return 'Preparing Dashboard...';
  if (pathname.startsWith('/scan')) return 'Preparing Scanner...';
  if (pathname.startsWith('/reports')) return 'Loading Reports...';
  if (pathname.startsWith('/settings')) return 'Validating Permissions...';
  if (pathname.startsWith('/login')) return 'Initializing Secure Session...';
  if (pathname.startsWith('/signup')) return 'Establishing Encrypted Context...';
  if (pathname.startsWith('/vulnerability')) return 'Syncing Threat Intelligence...';
  return STATUS_MESSAGES[Math.floor(Math.random() * STATUS_MESSAGES.length)];
}

function makeParticles() {
  return Array.from({ length: 16 }, (_, index) => ({
    id: index,
    left: `${8 + ((index * 37) % 84)}%`,
    top: `${10 + ((index * 29) % 78)}%`,
    delay: `${index * -130}ms`,
  }));
}

export default function PageTransitionLoader({ disabled = false }) {
  const location = useLocation();
  const [phase, setPhase] = useState('idle');
  const [message, setMessage] = useState(() => getRouteMessage(location.pathname));
  const lastLocationKey = useRef(location.key);
  const timers = useRef([]);
  const particles = useMemo(() => makeParticles(), []);

  useEffect(() => {
    return () => {
      timers.current.forEach(window.clearTimeout);
      timers.current = [];
    };
  }, []);

  useEffect(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];

    if (disabled) {
      lastLocationKey.current = location.key;
      return;
    }

    if (lastLocationKey.current === location.key) {
      return;
    }

    lastLocationKey.current = location.key;
    const nextMessage = getRouteMessage(location.pathname);

    const showTimer = window.setTimeout(() => {
      setMessage(nextMessage);
      setPhase('visible');

      const exitTimer = window.setTimeout(() => {
        setPhase('leaving');

        const idleTimer = window.setTimeout(() => {
          setPhase('idle');
        }, EXIT_DURATION);

        timers.current.push(idleTimer);
      }, MIN_VISIBLE);

      timers.current.push(exitTimer);
    }, SHOW_DELAY);

    timers.current.push(showTimer);
  }, [disabled, location.key, location.pathname]);

  useEffect(() => {
    if (phase === 'idle') return undefined;

    const interval = window.setInterval(() => {
      setMessage((current) => {
        const currentIndex = STATUS_MESSAGES.indexOf(current);
        const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % STATUS_MESSAGES.length : 0;
        return STATUS_MESSAGES[nextIndex];
      });
    }, 1450);

    return () => window.clearInterval(interval);
  }, [phase]);

  if (phase === 'idle') return null;

  return (
    <div className={`page-transition-loader ${phase === 'leaving' ? 'is-leaving' : ''}`} role="status" aria-live="polite" aria-atomic="true">
      <span className="sr-only">{message}</span>
      <div className="page-transition-loader__glow" aria-hidden="true" />
      <div className="page-transition-loader__vignette" aria-hidden="true" />
      <div className="page-transition-loader__particles" aria-hidden="true">
        {particles.map((particle) => (
          <span
            key={particle.id}
            style={{ left: particle.left, top: particle.top, animationDelay: particle.delay }}
          />
        ))}
      </div>

      <div className="page-transition-loader__content" aria-hidden="true">
        <div className="page-transition-loader__logo-wrap">
          <img src={logo} alt="" className="page-transition-loader__logo" />
          <span className="page-transition-loader__scan" />
        </div>

        <div className="page-transition-loader__nodes">
          <span />
          <span />
          <span />
          <i />
        </div>

        <p key={message} className="page-transition-loader__message">{message}</p>
      </div>
    </div>
  );
}
