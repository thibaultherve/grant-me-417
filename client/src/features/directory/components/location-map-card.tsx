import { AUSTRALIAN_STATE_NAMES } from '@regranted/shared';
import { Map } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LocationMapCardProps {
  postcode: string;
  stateCode: string;
  selectedSuburbName?: string;
}

export function LocationMapCard({
  postcode,
  stateCode,
  selectedSuburbName,
}: LocationMapCardProps) {
  const stateName =
    (AUSTRALIAN_STATE_NAMES as Record<string, string>)[stateCode] ?? stateCode;

  return (
    <Card className="py-0 gap-0 flex flex-col">
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Map className="w-4 h-4 text-primary" />
          Location
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {/* Placeholder — Leaflet map will be added in Phase 10 */}
        <div className="flex items-center justify-center h-52 bg-muted/30 text-sm text-muted-foreground">
          Map loading...
        </div>

        {/* Label */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-t text-xs text-muted-foreground">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
          <span>
            {postcode} — {selectedSuburbName ?? `Postcode area, ${stateName}`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
