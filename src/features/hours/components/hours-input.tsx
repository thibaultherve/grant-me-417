import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { forwardRef, useEffect, useState } from "react";
import {
  validateHours,
  type HoursValidationResult,
} from "../utils/hours-validation";

interface HoursInputProps {
  value: string;
  onChange: (value: string, decimalValue: number) => void;
  onValidationChange?: (isValid: boolean, errorMessage: string | null) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  maxHours?: number;
  "data-testid"?: string;
}

export const HoursInput = forwardRef<HTMLInputElement, HoursInputProps>(
  (
    {
      value,
      onChange,
      onValidationChange,
      disabled = false,
      className,
      placeholder = "8:30 or 8.5",
      maxHours = 24,
      "data-testid": testId,
      ...props
    },
    ref
  ) => {
    const [validation, setValidation] = useState<HoursValidationResult>({
      isValid: true,
      decimalValue: 0,
      errorMessage: null,
      displayConversion: null,
      format: "decimal",
    });

    // Validate input whenever value changes
    useEffect(() => {
      const result = validateHours(value, maxHours);
      setValidation(result);

      // Notify parent about validation state
      onValidationChange?.(result.isValid, result.errorMessage);
    }, [value, maxHours, onValidationChange]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      // Validate the new value immediately
      const result = validateHours(newValue, maxHours);

      // Call onChange with the new value and its decimal representation
      onChange(newValue, result.decimalValue || 0);
    };

    const showError = !validation.isValid && value.trim() !== "";
    const showConversion =
      validation.isValid && validation.displayConversion && value.trim() !== "";

    return (
      <div className="space-y-1">
        <div className="relative">
          <Input
            ref={ref}
            value={value}
            onChange={handleInputChange}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(
              className,
              showError && "border-destructive focus-visible:ring-destructive",
              "text-center"
            )}
            data-testid={testId}
            {...props}
          />

          {/* Conversion display */}
          {showConversion && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-background px-1">
              = {validation.displayConversion}
            </div>
          )}
        </div>

        {/* Error message */}
        {showError && (
          <p className="text-xs text-destructive">{validation.errorMessage}</p>
        )}

        {/* Format hint */}
        {!showError && !showConversion && value.trim() === "" && (
          <p className="text-xs text-muted-foreground">
            Enter hours as hours:minutes (8:30) or decimal hours (8.5) (max{" "}
            {maxHours}h)
          </p>
        )}
      </div>
    );
  }
);

HoursInput.displayName = "HoursInput";
