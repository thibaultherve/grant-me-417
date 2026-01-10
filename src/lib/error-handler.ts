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

/**
 * Silent error handler - only logs to console, no toast
 * Useful for background operations or validation checks
 *
 * @param error - The error to handle
 * @param consolePrefix - Optional prefix for console log
 *
 * @example
 * ```ts
 * try {
 *   await checkSomething()
 * } catch (err) {
 *   handleSilentError(err, 'Background check failed')
 * }
 * ```
 */
export function handleSilentError(
  error: unknown,
  consolePrefix?: string,
): void {
  handleError(error, {
    showToast: false,
    logToConsole: true,
    consolePrefix,
  });
}

/**
 * Extract error message from unknown error type
 * Utility for components that need just the message string
 *
 * @param error - The error to extract message from
 * @param fallback - Fallback message if extraction fails
 * @returns Error message string
 *
 * @example
 * ```ts
 * const errorMsg = getErrorMessage(err, 'Operation failed')
 * setError(errorMsg)
 * ```
 */
export function getErrorMessage(
  error: unknown,
  fallback: string = 'An error occurred',
): string {
  return error instanceof Error ? error.message : fallback;
}
