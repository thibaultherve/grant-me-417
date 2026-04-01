import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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

  const value = useMemo(
    () => ({
      action,
      description,
      setAction,
      setDescription,
    }),
    [action, description, setAction, setDescription],
  );

  return (
    <PageHeaderContext.Provider value={value}>
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
  }, [setAction, setDescription, description]);
}

export function usePageHeaderSlot(): {
  action: ReactNode;
  description: string | null;
} {
  const { action, description } = useContext(PageHeaderContext);
  return { action, description };
}
