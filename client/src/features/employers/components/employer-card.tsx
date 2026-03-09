import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

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
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { paths } from '@/config/paths';

import type { Employer, PostcodeBadgeData } from '@get-granted/shared';

import { EligibilityStatusBadge } from './eligibility-status-badge';
import { IndustryChip } from './industry-chip';
import { ZoneBadge, type ZoneKey } from './zone-badge';

const STATE_CONFIG: Record<string, { bg: string; fg: string }> = {
  ACT: { bg: 'bg-state-act', fg: 'text-white' },
  NSW: { bg: 'bg-state-nsw', fg: 'text-state-nsw-fg' },
  NT: { bg: 'bg-state-nt', fg: 'text-white' },
  QLD: { bg: 'bg-state-qld', fg: 'text-white' },
  SA: { bg: 'bg-state-sa', fg: 'text-white' },
  TAS: { bg: 'bg-state-tas', fg: 'text-white' },
  VIC: { bg: 'bg-state-vic', fg: 'text-white' },
  WA: { bg: 'bg-state-wa', fg: 'text-state-wa-fg' },
};

const ZONE_FLAGS: { flag: keyof PostcodeBadgeData; zone: ZoneKey }[] = [
  { flag: 'isNorthernAustralia', zone: 'northern' },
  { flag: 'isRemoteVeryRemote', zone: 'remote' },
  { flag: 'isRegionalAustralia', zone: 'regional' },
  { flag: 'isBushfireDeclared', zone: 'bushfire' },
  { flag: 'isNaturalDisasterDeclared', zone: 'weather' },
];

interface EmployerCardProps {
  employer: Employer;
  onDelete: (id: string) => void;
}

export function EmployerCard({ employer, onDelete }: EmployerCardProps) {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const stateConfig =
    STATE_CONFIG[employer.suburb.stateCode] ?? {
      bg: 'bg-muted',
      fg: 'text-muted-foreground',
    };

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
      <Card className="flex flex-col shadow-sm gap-0 py-0">
        {/* Card Header */}
        <CardHeader className="flex flex-row items-center justify-between px-5 py-4 space-y-0 border-b border-border">
          <span className="text-base font-semibold text-foreground truncate">
            {employer.name}
          </span>
          <div className="flex items-center gap-1.5 shrink-0 ml-3">
            <EligibilityStatusBadge status={eligibilityStatus} className="px-0 py-0" />
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
        </CardHeader>

        {/* Info Section */}
        <CardContent className="flex flex-col gap-3.5 p-5">
          {/* Location */}
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-medium text-muted-foreground tracking-[0.5px] uppercase w-[70px] shrink-0">
              Location
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[13px] font-medium text-foreground">
                {employer.suburb.suburbName}
              </span>
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${stateConfig.bg} ${stateConfig.fg}`}
              >
                {employer.suburb.stateCode}
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded border border-border text-[10px] font-medium text-muted-foreground">
                {employer.suburb.postcode}
              </span>
            </div>
          </div>

          {/* Industry */}
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-medium text-muted-foreground tracking-[0.5px] uppercase w-[70px] shrink-0">
              Industry
            </span>
            <IndustryChip industry={employer.industry} className="px-0" />
          </div>

          {/* Zones */}
          {zones.length > 0 && (
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-medium text-muted-foreground tracking-[0.5px] uppercase w-[70px] shrink-0">
                Zones
              </span>
              <div className="flex items-center gap-1">
                {zones.map((zone) => (
                  <ZoneBadge key={zone} zone={zone} size="sm" />
                ))}
              </div>
            </div>
          )}
        </CardContent>

        {/* Card Actions */}
        <CardFooter className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border mt-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate(paths.app.employers.edit.getHref(employer.id))
            }
          >
            <Pencil className="w-3.5 h-3.5 mr-1.5" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Delete
          </Button>
        </CardFooter>
      </Card>

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
