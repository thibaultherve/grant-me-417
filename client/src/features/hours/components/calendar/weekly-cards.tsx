import type { WeekData, VisaPeriod } from '../../types/weekly';
import { WeekCard } from './week-card';

interface WeeklyCardsProps {
  weeks: WeekData[];
  visas: VisaPeriod[];
  isExpanded: (weekStart: string) => boolean;
  toggleWeek: (weekStart: string) => void;
  year: number;
  month: number;
}

/**
 * Mobile weekly hours view. Vertical stack of WeekCard components.
 */
export function WeeklyCards({
  weeks,
  visas,
  isExpanded,
  toggleWeek,
  year,
  month,
}: WeeklyCardsProps) {
  return (
    <div className="space-y-3">
      {weeks.map((week) => (
        <WeekCard
          key={week.weekStart}
          week={week}
          visas={visas}
          isExpanded={isExpanded(week.weekStart)}
          onToggle={() => toggleWeek(week.weekStart)}
          year={year}
          month={month}
        />
      ))}
    </div>
  );
}
