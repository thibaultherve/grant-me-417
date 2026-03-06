import { useCallback, useEffect, useState } from 'react';

const SIDEBAR_STORAGE_KEY = 'sidebar-collapsed';

export function useSidebar() {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      return stored === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isCollapsed));
    } catch {
      // ignore
    }
  }, [isCollapsed]);

  const toggle = useCallback(() => setIsCollapsed((prev) => !prev), []);
  const collapse = useCallback(() => setIsCollapsed(true), []);
  const expand = useCallback(() => setIsCollapsed(false), []);

  return { isCollapsed, toggle, collapse, expand };
}
