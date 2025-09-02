import { useEffect, useState } from 'react';
import type { Degree } from '../types/Degree';

export function useDegrees() {
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/degrees')
      .then(res => res.json())
      .then(data => setDegrees(data))
      .finally(() => setLoading(false));
  }, []);

  return { degrees, loading };
}
