import type { PostcodeBadgeData } from '@regranted/shared';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

import { ZoneBadge, ZONE_FLAGS } from '@/components/shared/zone-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { paths } from '@/config/paths';
import { cn } from '@/lib/utils';

interface SuburbListCardProps {
  postcode: string;
  suburbs: { id: number; suburbName: string }[];
  selectedSuburbId?: string;
  eligibilityFlags: PostcodeBadgeData | null;
}

export function SuburbListCard({
  postcode,
  suburbs,
  selectedSuburbId,
  eligibilityFlags,
}: SuburbListCardProps) {
  const activeZones = eligibilityFlags
    ? ZONE_FLAGS.filter(({ flag }) => eligibilityFlags[flag]).map(
        ({ zone }) => zone,
      )
    : [];

  return (
    <Card className="py-0 gap-0 flex flex-col">
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            {activeZones.map((zone) => (
              <ZoneBadge key={zone} zone={zone} size="sm" />
            ))}
          </div>
          <span className="text-xs text-muted-foreground font-normal">
            {suburbs.length} suburb{suburbs.length !== 1 ? 's' : ''}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 overflow-y-auto max-h-80">
        {suburbs.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No suburbs found.
          </p>
        ) : (
          <ul>
            {suburbs.map((suburb) => {
              const isActive = String(suburb.id) === selectedSuburbId;
              return (
                <li key={suburb.id}>
                  <Link
                    to={paths.app.tools.directory.postcode.suburb.getHref(
                      postcode,
                      String(suburb.id),
                    )}
                    className={cn(
                      'flex items-center justify-between px-4 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted',
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {suburb.suburbName}
                      {isActive && (
                        <span className="text-[10px] font-medium opacity-80">
                          Current
                        </span>
                      )}
                    </span>
                    <ChevronRight
                      className={cn(
                        'w-3.5 h-3.5 shrink-0',
                        isActive
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground',
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
