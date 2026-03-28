import { useEffect } from 'react';

export function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void,
): void {
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        handler();
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [ref, handler]);
}
