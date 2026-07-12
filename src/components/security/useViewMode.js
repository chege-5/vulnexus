import { useEffect, useState } from 'react';

export default function useViewMode(storageKey) {
  const [viewMode, setViewMode] = useState(() => {
    try {
      return window.localStorage.getItem(storageKey) || 'executive';
    } catch {
      return 'executive';
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, viewMode);
    } catch {
      // View preference is non-critical.
    }
  }, [storageKey, viewMode]);

  return [viewMode, setViewMode];
}
