import { CalendarDays, Pencil, Plane, Timer, TrendingUp, Trash2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

import type { Visa } from '@regranted/shared';
import { computeVisaTimeline, formatCreatedAgo } from '../utils/visa-helpers';
import { OrdinalBadge } from './ordinal-badge';
import { VisaProgressBar } from './visa-progress-bar';

interface VisaCardProps {
  visa: Visa;
  onDelete?: (id: string) => void;
  onEdit?: (visa: Visa) => void;
  hideActions?: boolean;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function VisaCard({ visa, onDelete, onEdit, hideActions = false }: VisaCardProps) {
  const { isExpired, percent: timelinePercent, label: timelineLabel } = computeVisaTimeline(visa.arrivalDate, visa.expiryDate);

  // Progress calculations
  const progressPercent = Math.min((visa.eligibleDays / visa.daysRequired) * 100, 100);
  const progressComplete = progressPercent >= 100;
  const progressLabel = `${visa.eligibleDays} / ${visa.daysRequired} days`;

  const createdAgo = formatCreatedAgo(visa.createdAt);

  const accentClass = isExpired ? 'bg-[#9CA3AF]' : 'bg-primary';

  const timelineVariant = isExpired ? 'timeline-expired' : 'timeline-active';
  const progressVariant = isExpired
    ? 'progress-expired'
    : progressComplete
      ? 'progress-complete'
      : 'progress-active';

  return (
    <div className="flex rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Accent strip */}
      <div className={`w-1 shrink-0 ${accentClass}`} />

      {/* Card content */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Plane className="w-4 h-4 text-muted-foreground shrink-0" />
          <OrdinalBadge visaType={visa.visaType} />
          <span className="font-bold text-sm text-foreground flex-1">WHV 417</span>
          {/* Status badge */}
          {isExpired ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-danger-light text-danger-dark text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-danger-dark shrink-0" />
              Expired
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-accent text-primary text-xs font-semibold">
              Active
            </span>
          )}
        </div>

        {/* Info rows */}
        <div className="flex flex-col gap-2 px-4 py-3">
          {/* Arrival */}
          <div className="flex items-center gap-2">
            <Plane className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide w-20 shrink-0">
              Arrival
            </span>
            <span className="text-sm text-foreground whitespace-nowrap">{formatDate(visa.arrivalDate)}</span>
          </div>

          {/* Departure */}
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide w-20 shrink-0">
              Departure
            </span>
            <span className="text-sm text-foreground whitespace-nowrap">{formatDate(visa.expiryDate)}</span>
          </div>

          {/* Timeline */}
          <div className="flex items-center gap-2">
            <Timer className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide w-20 shrink-0">
              Timeline
            </span>
            <span className={`text-sm whitespace-nowrap ${isExpired ? 'text-destructive' : 'text-foreground'}`}>
              {timelineLabel}
            </span>
            <VisaProgressBar percent={timelinePercent} variant={timelineVariant} className="w-16 md:w-30" />
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide w-20 shrink-0">
              Progress
            </span>
            <span className="text-sm text-foreground whitespace-nowrap">{progressLabel}</span>
            <VisaProgressBar percent={progressPercent} variant={progressVariant} className="w-16 md:w-30" />
          </div>
        </div>

        {/* Footer */}
        {!hideActions && <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-muted/40 border-t border-border">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="w-3.5 h-3.5 shrink-0" />
            <span>Created {createdAgo}</span>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => onEdit(visa)}
              >
                <Pencil className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Edit</span>
              </Button>
            )}

            {onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-1.5">
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Delete</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Visa</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this WHV 417 visa? All associated work entries
                      will remain, but visa tracking data will be lost. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(visa.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>}
      </div>
    </div>
  );
}
