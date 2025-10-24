import { supabase } from './supabase'
import { handleSilentError } from './error-handler'

/**
 * Custom API Error class with status code
 * Extends native Error to include Supabase error codes
 */
class ApiError extends Error {
  status: string

  constructor(message: string, status: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

/**
 * Global error interceptor for API calls
 * Follows bulletproof-react pattern: centralized error handling
 *
 * Handles:
 * - Logging errors to console
 * - Special handling for auth errors (PGRST301)
 * - Throwing ApiError with proper status codes
 *
 * Note: Toast notifications are handled at the hook level for better UX control
 */
function handleApiError(error: unknown, operation: string): never {
  // Log silently (no toast at API layer)
  handleSilentError(error, `API ${operation}`)

  // Extract error details from Supabase error
  if (error && typeof error === 'object' && 'message' in error && 'code' in error) {
    const message = (error as { message: string }).message
    const code = (error as { code: string }).code
    throw new ApiError(message, code)
  }

  // Fallback for unknown errors
  throw new ApiError('An unexpected error occurred', 'UNKNOWN')
}

/**
 * Centralized API client using Supabase
 * All methods use the error interceptor for consistent error handling
 */
export const api = {
  /**
   * GET request - Fetch all records from table
   */
  get: async (endpoint: string) => {
    const { data, error } = await supabase
      .from(endpoint)
      .select('*')

    if (error) handleApiError(error, `GET ${endpoint}`)
    return { data }
  },

  /**
   * POST request - Insert new record into table
   */
  post: async (endpoint: string, body: Record<string, unknown>) => {
    const { data, error } = await supabase
      .from(endpoint)
      .insert(body)
      .select()
      .single()

    if (error) handleApiError(error, `POST ${endpoint}`)
    return { data }
  },

  /**
   * PATCH request - Update existing record in table
   */
  patch: async (endpoint: string, id: string, body: Record<string, unknown>) => {
    const { data, error } = await supabase
      .from(endpoint)
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) handleApiError(error, `PATCH ${endpoint}/${id}`)
    return { data }
  },

  /**
   * DELETE request - Remove record from table
   */
  delete: async (endpoint: string, id: string) => {
    const { error } = await supabase
      .from(endpoint)
      .delete()
      .eq('id', id)

    if (error) handleApiError(error, `DELETE ${endpoint}/${id}`)
    return { success: true }
  },
}