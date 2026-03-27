import { useCallback, useState } from 'react';

const STORAGE_KEY = 'regranted:hours-expansion';

function readPersistedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as string[];
      return new Set(parsed);
    }
  } catch {
    // Ignore corrupted data
  }
  return new Set<string>();
}

function persistIds(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Manages card expansion state with localStorage persistence.
 *
 * On first visit (nothing persisted), expands the first employer in the list.
 * On subsequent visits, restores the persisted expansion state.
 *
 * @param employerIds - Ordered list of employer IDs (by createdAt DESC)
 */
export function useExpansionState(employerIds: string[]) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const persisted = readPersistedIds();

    // If we have persisted state, filter to only existing employer IDs
    if (persisted.size > 0) {
      const validIds = new Set(
        [...persisted].filter((id) => employerIds.includes(id)),
      );
      // If all persisted IDs were removed, default to first employer
      if (validIds.size === 0 && employerIds.length > 0) {
        const defaultSet = new Set([employerIds[0]]);
        persistIds(defaultSet);
        return defaultSet;
      }
      return validIds;
    }

    // First visit: expand the first employer (most recently created)
    if (employerIds.length > 0) {
      const defaultSet = new Set([employerIds[0]]);
      persistIds(defaultSet);
      return defaultSet;
    }

    return new Set<string>();
  });

  const toggle = useCallback((employerId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(employerId)) {
        next.delete(employerId);
      } else {
        next.add(employerId);
      }
      persistIds(next);
      return next;
    });
  }, []);

  const isExpanded = useCallback(
    (employerId: string) => expandedIds.has(employerId),
    [expandedIds],
  );

  return { expandedIds, toggle, isExpanded };
}
