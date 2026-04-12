import type { Employer } from '@regranted/shared';
import { formatDistanceToNow } from 'date-fns';
import {
  Ban,
  Building2,
  CalendarDays,
  Factory,
  Globe,
  MapPin,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { EligibilityStatusBadge } from '@/components/shared/eligibility-status-badge';
import { IndustryChip } from '@/components/shared/industry-chip';
import { PostcodeLinkBadge } from '@/components/shared/postcode-link-badge';
import {
  ZONE_FLAGS,
  ZoneBadge,
  type ZoneKey,
} from '@/components/shared/zone-badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';
import { cn } from '@/lib/utils';

interface EmployerCardProps {
  employer: Employer;
  onDelete: (id: string) => void;
}

export function EmployerCard({ employer, onDelete }: EmployerCardProps) {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const zones: ZoneKey[] = employer.suburb.postcodeData
    ? ZONE_FLAGS.filter(
        ({ flag }) => employer.suburb.postcodeData?.[flag] === true,
      ).map(({ zone }) => zone)
    : [];

  if (employer.industry === 'critical_covid19_work') {
    zones.push('anywhere');
  }

  const eligibilityStatus = employer.isEligible ? 'eligible' : 'not-eligible';

  return (
    <>
      <div className="flex rounded-lg border border-border shadow-sm overflow-hidden bg-card">
        {/* Accent strip */}
        <div
          className={cn(
            'w-0.75 md:w-1 self-stretch shrink-0 rounded-l-lg',
            employer.isEligible ? 'bg-success' : 'bg-destructive',
          )}
        />

        {/* Card content */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 md:px-5 md:py-4 md:border-b md:border-border">
            <div className="flex items-center gap-2 min-w-0">
              <Building2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary shrink-0" />
              <span className="text-[15px] md:text-base font-semibold text-foreground truncate">
                {employer.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-3">
              <EligibilityStatusBadge
                status={eligibilityStatus}
                className="px-0 py-0"
              />
              <span className="text-[11px] font-light text-muted-foreground opacity-40">
                |
              </span>
              <span
                className={
                  employer.eligibilityMode === 'automatic'
                    ? 'text-[9px] font-normal text-indigo-500 opacity-80'
                    : 'text-[9px] font-normal text-muted-foreground opacity-60'
                }
              >
                {employer.eligibilityMode === 'automatic' ? 'auto' : 'manual'}
              </span>
            </div>
          </div>

          {/* Info Section */}
          <div className="flex flex-col gap-3 md:gap-3.5 px-4 pb-4 pt-3 md:p-5">
            {/* Location */}
            <div className="flex items-center gap-2.5">
              <MapPin className="h-3.25 w-3.25 md:h-3.5 md:w-3.5 text-muted-foreground shrink-0" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.8px] text-muted-foreground w-16.25 md:w-17.5 shrink-0">
                Location
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[13px] font-medium text-foreground">
                  {employer.suburb.suburbName}
                </span>
                <PostcodeLinkBadge
                  postcode={employer.suburb.postcode}
                  stateCode={employer.suburb.stateCode}
                  size="sm"
                />
              </div>
            </div>

            {/* Industry */}
            <div className="flex items-center gap-2.5">
              <Factory className="h-3.25 w-3.25 md:h-3.5 md:w-3.5 text-muted-foreground shrink-0" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.8px] text-muted-foreground w-16.25 md:w-17.5 shrink-0">
                Industry
              </span>
              <IndustryChip industry={employer.industry} className="px-0" />
            </div>

            {/* Zones — always rendered */}
            <div className="flex items-center gap-2.5">
              <Globe className="h-3.25 w-3.25 md:h-3.5 md:w-3.5 text-muted-foreground shrink-0" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.8px] text-muted-foreground w-16.25 md:w-17.5 shrink-0">
                Zones
              </span>
              {zones.length === 0 ? (
                <div className="w-5 h-5 rounded bg-disabled flex items-center justify-center shadow-sm">
                  <Ban className="h-3.25 w-3.25 text-white" />
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  {zones.map((zone) => (
                    <ZoneBadge key={zone} zone={zone} size="sm" />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 md:px-5 md:py-3.5 bg-muted border-t border-border mt-auto">
            {/* Date hint */}
            <div className="flex items-center gap-1.25 md:gap-1.5">
              <CalendarDays className="h-3.25 w-3.25 md:h-3.5 md:w-3.5 text-muted-foreground" />
              <span className="text-[11px] md:text-xs font-normal text-muted-foreground">
                Added{' '}
                {formatDistanceToNow(new Date(employer.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {/* Mobile: icon-only */}
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                onClick={() =>
                  navigate(paths.app.employers.edit.getHref(employer.id))
                }
              >
                <Pencil className="h-3.25 w-3.25" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="md:hidden"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-3.25 w-3.25" />
              </Button>

              {/* Desktop: labeled */}
              <Button
                variant="outline"
                size="sm"
                className="hidden md:inline-flex"
                onClick={() =>
                  navigate(paths.app.employers.edit.getHref(employer.id))
                }
              >
                <Pencil className="h-3.25 w-3.25" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="hidden md:inline-flex"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-3.25 w-3.25" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{employer.name}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(employer.id);
                setIsDeleteDialogOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
