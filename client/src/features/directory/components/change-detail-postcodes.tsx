import type { ChangeDetailResponse } from '@regranted/shared';
import { Layers } from 'lucide-react';

import { PostcodeLinkBadge } from '@/components/shared/postcode-link-badge';
import { STATE_CONFIG } from '@/components/shared/postcode-link-badge';
import { ZoneBadge, type ZoneKey } from '@/components/shared/zone-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import {
  groupIntoConsecutiveColumns,
  groupPostcodesByState,
} from '../utils/postcode-column-helpers';

type ChangeGroup = ChangeDetailResponse['changes'][number];

interface ChangeDetailPostcodesProps {
  changes: ChangeDetailResponse['changes'];
}

export function ChangeDetailPostcodes({ changes }: ChangeDetailPostcodesProps) {
  return (
    <Card className="py-0 gap-0">
      <CardHeader className="px-5 py-3 border-b">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Layers className="w-4 h-4 text-primary" />
          Details
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {changes.map((change, i) => (
          <ZoneSection
            key={`${change.zone}-${change.action}`}
            change={change}
            showDivider={i > 0}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function ZoneSection({
  change,
  showDivider,
}: {
  change: ChangeGroup;
  showDivider: boolean;
}) {
  const groupedByState = groupPostcodesByState(change.postcodes);
  const stateEntries = Object.entries(groupedByState).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  return (
    <>
      {showDivider && <div className="border-t border-border" />}

      <div className="space-y-3">
        {/* Zone header */}
        <div className="flex items-center gap-2">
          <ZoneBadge zone={change.zone as ZoneKey} size="sm" />
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
              change.action === 'Added'
                ? 'bg-success-light text-success'
                : 'bg-danger-light text-danger',
            )}
          >
            {change.action}
          </span>
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {change.postcodes.length} postcodes
          </span>
        </div>

        {/* State sub-sections */}
        <div className="space-y-3">
          {stateEntries.map(([stateCode, postcodes], si) => (
            <StateSubSection
              key={stateCode}
              stateCode={stateCode}
              postcodes={postcodes}
              showDivider={si > 0}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function StateSubSection({
  stateCode,
  postcodes,
  showDivider,
}: {
  stateCode: string;
  postcodes: string[];
  showDivider: boolean;
}) {
  const columns = groupIntoConsecutiveColumns(postcodes);
  const config = STATE_CONFIG[stateCode] ?? {
    bg: 'bg-muted',
    fg: 'text-muted-foreground',
  };

  return (
    <>
      {showDivider && <div className="border-t border-border-light" />}

      <div className="space-y-2">
        {/* State header */}
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none',
              config.bg,
              config.fg,
            )}
          >
            {stateCode}
          </span>
          <span className="text-[11px] text-muted-foreground">
            ({postcodes.length} postcodes)
          </span>
        </div>

        {/* Postcodes grid — columns of consecutive badges */}
        <div className="flex flex-wrap gap-2">
          {columns.map((column) => (
            <div key={column[0]} className="flex flex-col gap-1">
              {column.map((postcode) => (
                <PostcodeLinkBadge
                  key={postcode}
                  postcode={postcode}
                  stateCode={stateCode}
                  size="sm"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
