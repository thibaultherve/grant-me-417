/**
 * Hours validation utilities for both decimal and hours:minutes formats
 */

// Regex patterns
const DECIMAL_HOURS_PATTERN = /^(\d{1,3}(?:\.\d{1,2})?)$/; // Support up to 168h
const TIME_FORMAT_PATTERN = /^(\d{1,3}):([0-5]?\d)$/; // Support up to 167:59

export interface HoursValidationResult {
  isValid: boolean;
  decimalValue: number | null;
  errorMessage: string | null;
  displayConversion: string | null;
  format: 'decimal' | 'time' | 'invalid';
}

/**
 * Convert hours:minutes format to decimal hours
 * Example: "8:30" → 8.5
 */
export const timeToDecimal = (hours: number, minutes: number): number => {
  return hours + minutes / 60;
};

/**
 * Convert decimal hours to hours:minutes format
 * Example: 8.5 → "8:30"
 */
export const decimalToTime = (decimal: number): string => {
  const hours = Math.floor(decimal);
  const minutes = Math.round((decimal - hours) * 60);
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Validate and parse hours input (supports both decimal and time formats)
 */
export const validateHours = (
  input: string,
  maxHours: number = 24,
): HoursValidationResult => {
  // Empty input
  if (!input.trim()) {
    return {
      isValid: true,
      decimalValue: 0,
      errorMessage: null,
      displayConversion: null,
      format: 'decimal',
    };
  }

  const trimmedInput = input.trim();

  // Try decimal format first (e.g., "8.5", "10.25")
  const decimalMatch = trimmedInput.match(DECIMAL_HOURS_PATTERN);
  if (decimalMatch) {
    const value = parseFloat(decimalMatch[1]);

    // Validate range (0-24 hours)
    if (value < 0) {
      return {
        isValid: false,
        decimalValue: null,
        errorMessage: 'Hours cannot be negative',
        displayConversion: null,
        format: 'invalid',
      };
    }

    if (value > maxHours) {
      return {
        isValid: false,
        decimalValue: null,
        errorMessage: `Maximum ${maxHours} hours allowed`,
        displayConversion: null,
        format: 'invalid',
      };
    }

    return {
      isValid: true,
      decimalValue: value,
      errorMessage: null,
      displayConversion: null, // No conversion display for decimal format
      format: 'decimal',
    };
  }

  // Try time format (e.g., "8:30", "08:30")
  const timeMatch = trimmedInput.match(TIME_FORMAT_PATTERN);
  if (timeMatch) {
    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);

    // Minutes are already validated by regex (0-59)
    const decimalValue = timeToDecimal(hours, minutes);

    // Validate that the total decimal value doesn't exceed maxHours
    if (decimalValue > maxHours) {
      return {
        isValid: false,
        decimalValue: null,
        errorMessage: `Maximum ${maxHours} hours allowed`,
        displayConversion: null,
        format: 'invalid',
      };
    }

    return {
      isValid: true,
      decimalValue,
      errorMessage: null,
      displayConversion: `${decimalValue}h`, // Show conversion for time format
      format: 'time',
    };
  }

  // Invalid format
  return {
    isValid: false,
    decimalValue: null,
    errorMessage: 'Use format "8:30" or "8.5"',
    displayConversion: null,
    format: 'invalid',
  };
};

/**
 * Format decimal hours for display
 * Removes unnecessary trailing zeros
 */
export const formatDecimalHours = (decimal: number): string => {
  return decimal % 1 === 0
    ? decimal.toString()
    : decimal.toFixed(2).replace(/\.?0+$/, '');
};

/**
 * Check if input is a valid hours format without full validation
 * Used for real-time validation feedback
 */
export const isValidHoursFormat = (input: string): boolean => {
  if (!input.trim()) return true;
  const trimmed = input.trim();
  return (
    DECIMAL_HOURS_PATTERN.test(trimmed) || TIME_FORMAT_PATTERN.test(trimmed)
  );
};
