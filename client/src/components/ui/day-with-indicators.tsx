interface DayIndicator {
  color: string; // hex color (e.g. '#10b981')
}

interface DayWithIndicatorsProps {
  indicators: DayIndicator[];
  children: React.ReactNode; // day number rendered by react-day-picker
}

/**
 * Generic day cell renderer that wraps a day number with optional colored
 * underline indicator bars. Designed to be reusable across features (visa
 * calendar, hours calendar, etc.).
 */
export function DayWithIndicators({
  indicators,
  children,
}: DayWithIndicatorsProps) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      {children}
      {indicators.length > 0 && (
        <div className="flex items-center gap-px">
          {indicators.map((indicator, i) => (
            <span
              key={i}
              className="rounded-full"
              style={{
                width: 16,
                height: 3,
                backgroundColor: indicator.color,
                display: 'block',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
