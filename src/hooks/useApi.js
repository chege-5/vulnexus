import { useState, useEffect, useCallback, useRef } from 'react';

/* Fetch data with loading, error, and retry */
export function useApi(apiFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const controllerRef = useRef(null);

  const fetchData = useCallback(async () => {
    // Abort any in-flight request before starting a new one
    if (controllerRef.current) controllerRef.current.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn(controller.signal);
      if (!controller.signal.aborted) setData(result);
    } catch (err) {
      if (!controller.signal.aborted && err.name !== 'AbortError') {
        setError(err.message || 'An error occurred');
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    fetchData();
    // Abort on unmount so state is never set on an unmounted component
    return () => { if (controllerRef.current) controllerRef.current.abort(); };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/* Animated counter */
export function useAnimatedCounter(end, duration = 1500) {
  const [count, setCount] = useState(0);
  const frameRef = useRef();

  useEffect(() => {
    if (end === null || end === undefined) return;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.round(eased * end));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [end, duration]);

  return count;
}

/* Typing text effect — natural variable speed */
export function useTypingEffect(text, speed = 48) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const timeoutRef = useRef();

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;

    const type = () => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
        // Punctuation gets a longer pause; spaces get a tiny pause; normal chars vary slightly
        const ch = text[i - 1];
        const variance = (Math.random() - 0.5) * speed * 0.6;
        const delay = /[.,!?;:]/.test(ch)
          ? speed * 4 + variance
          : ch === ' '
          ? speed * 0.6
          : speed + variance;
        timeoutRef.current = setTimeout(type, Math.max(delay, 10));
      } else {
        setDone(true);
      }
    };

    timeoutRef.current = setTimeout(type, speed);
    return () => clearTimeout(timeoutRef.current);
  }, [text, speed]);

  return { displayed, done };
}

/* Intersection observer for scroll animations */
export function useInView(options = {}) {
  const ref = useRef();
  const [inView, setInView] = useState(false);

  // Extract primitives so the dep array is stable even if caller passes an inline object
  const threshold = options.threshold ?? 0.1;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}

/* Debounce hook */
export function useDebounce(value, ms = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return debounced;
}
