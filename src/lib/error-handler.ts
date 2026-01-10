import { toast } from 'sonner';

/**
 * Error handling configuration options
 */
export interface ErrorHandlerOptions {
  /** Whether to show toast notification (default: true) */
  showToast?: boolean;
  /** Whether to log to console (default: true) */
  logToConsole?: boolean;
  /** Custom prefix for console logs (optional) */
  consolePrefix?: string;
  /** Custom fallback message if error doesn't have one */
  fallbackMessage?: string;
}

/**
 * Standard error response format
 */
export interface ErrorResponse {
  success: false;
  error: string;
}

/**
 * Centralized error handler utility
 *
 * Follows bulletproof-react pattern:
 * - Logs error to console for debugging
 * - Shows user-friendly toast notification
 * - Extracts error message with fallback
 * - Returns standardized error response
 *
 * @param error - The error to handle (Error object or unknown)
 * @param options - Configuration options for error handling
 * @returns Standardized error response object
 *
 * @example
 * ```ts
 * try {
 *   await someApiCall()
 * } catch (err) {
 *   return handleError(err, {
 *     consolePrefix: 'Error adding employer',
 *     fallbackMessage: 'Failed to add employer'
 *   })
 * }
 * ```
 */
export function handleError(
  error: unknown,
  options: ErrorHandlerOptions = {},
): ErrorResponse {
  const {
    showToast = true,
    logToConsole = true,
    consolePrefix,
    fallbackMessage = 'An error occurred',
  } = options;

  // Extract error message
  const message = error instanceof Error ? error.message : fallbackMessage;

  // Log to console for debugging
  if (logToConsole) {
    const logMessage = consolePrefix ? `${consolePrefix}:` : 'Error:';
    console.error(logMessage, error);
  }

  // Show user-friendly toast notification
  if (showToast) {
    toast.error(message);
  }

  // Return standardized error response
  return {
    success: false,
    error: message,
  };
}
