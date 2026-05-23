import { useEffect, useState } from 'react';

export function usePortrait() {
  const [portrait, setPortrait] = useState(false);
  useEffect(() => {
    const check = () => {
      const isPortrait = window.innerHeight > window.innerWidth && window.innerWidth < 950;
      setPortrait(isPortrait);
    };
    check();
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);
  return portrait;
}
