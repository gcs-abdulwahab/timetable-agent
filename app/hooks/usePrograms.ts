import { useEffect, useState } from 'react';
import type { Program } from '../types/Program';

export function usePrograms() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/programs')
      .then(res => res.json())
      .then(data => setPrograms(data))
      .finally(() => setLoading(false));
  }, []);

  return { programs, loading };
}
