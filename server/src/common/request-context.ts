import { AsyncLocalStorage } from 'async_hooks';

interface RequestStore {
  correlationId: string;
}

export const requestContext = new AsyncLocalStorage<RequestStore>();

export function getCorrelationId(): string {
  return requestContext.getStore()?.correlationId ?? 'no-context';
}
