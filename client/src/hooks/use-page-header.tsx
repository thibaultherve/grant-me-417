import { createContext, useContext, useLayoutEffect, useRef, useState } from 'react';

import type { ReactNode } from 'react';

interface PageHeaderContextValue {
  action: ReactNode;
  description: string | null;
  setAction: (action: ReactNode) => void;
  setDescription: (description: string | null) => void;
}

const PageHeaderContext = createContext<PageHeaderContextValue>({
  action: null,
  description: null,
  setAction: () => {},
  setDescription: () => {},
});

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [action, setAction] = useState<ReactNode>(null);
  const [description, setDescription] = useState<string | null>(null);
  return (
    <PageHeaderContext.Provider value={{ action, description, setAction, setDescription }}>
      {children}
    </PageHeaderContext.Provider>
  );
}

interface PageHeaderOptions {
  action?: () => ReactNode;
  description?: string;
}

/**
 * Hook for routes to inject an action and/or description into the layout header.
 * Render functions are captured in refs to avoid stale closures.
 */
export function usePageHeader({ action, description }: PageHeaderOptions) {
  const { setAction, setDescription } = useContext(PageHeaderContext);

  const actionRef = useRef(action);
  actionRef.current = action;

  useLayoutEffect(() => {
    setAction(actionRef.current ? actionRef.current() : null);
    setDescription(description ?? null);
    return () => {
      setAction(null);
      setDescription(null);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setAction, setDescription]);
}

export function usePageHeaderSlot(): { action: ReactNode; description: string | null } {
  const { action, description } = useContext(PageHeaderContext);
  return { action, description };
}
