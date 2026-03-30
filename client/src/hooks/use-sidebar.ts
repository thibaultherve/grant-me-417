import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'sidebar-collapsed';
const AUTO_COLLAPSE_BREAKPOINT = 1280;

// ── Module-level shared state ──────────────────────────────────────────────
let listeners: Array<() => void> = [];

// User's explicit preference (persisted in localStorage)
let manuallyCollapsed: boolean = (() => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
})();

// Current visual state (derived from preference + viewport)
let isCollapsed: boolean = manuallyCollapsed;

// ── Helpers ────────────────────────────────────────────────────────────────
function notify() {
  listeners.forEach((l) => l());
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, String(manuallyCollapsed));
  } catch {
    // ignore
  }
}

// ── Viewport-based auto-collapse via matchMedia ────────────────────────────
if (typeof window !== 'undefined') {
  const mq = window.matchMedia(`(max-width: ${AUTO_COLLAPSE_BREAKPOINT - 1}px)`);

  // Set initial state based on viewport
  if (mq.matches && !isCollapsed) {
    isCollapsed = true;
  }

  mq.addEventListener('change', (e) => {
    if (e.matches && !isCollapsed) {
      // Viewport became small → auto-collapse
      isCollapsed = true;
      notify();
    } else if (!e.matches && isCollapsed && !manuallyCollapsed) {
      // Viewport became large → auto-expand (only if user didn't manually collapse)
      isCollapsed = false;
      notify();
    }
  });
}

// ── External store API ─────────────────────────────────────────────────────
function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot() {
  return isCollapsed;
}

function getServerSnapshot() {
  return false;
}

// ── Actions ────────────────────────────────────────────────────────────────
function toggle() {
  isCollapsed = !isCollapsed;
  manuallyCollapsed = isCollapsed;
  persist();
  notify();
}

function collapse() {
  isCollapsed = true;
  manuallyCollapsed = true;
  persist();
  notify();
}

function expand() {
  isCollapsed = false;
  manuallyCollapsed = false;
  persist();
  notify();
}

// ── Hook ───────────────────────────────────────────────────────────────────
export function useSidebar() {
  const collapsed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return { isCollapsed: collapsed, toggle, collapse, expand };
}
