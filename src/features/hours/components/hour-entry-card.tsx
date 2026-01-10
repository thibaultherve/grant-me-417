import {
  Calendar,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Edit,
  Trash2,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import type { HourEntryWithEmployer } from '../types';

interface HourEntryCardProps {
  entry: HourEntryWithEmployer;
  onDelete: (entry: HourEntryWithEmployer) => void;
}

export const HourEntryCard = ({ entry, onDelete }: HourEntryCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatHours = (hours: number) => {
    return `${hours.toFixed(2)}h`;
  };

  const getIndustryLabel = (industry: string) => {
    const labels: Record<string, string> = {
      plant_and_animal_cultivation: 'Agriculture',
      fishing_and_pearling: 'Fishing',
      tree_farming_and_felling: 'Forestry',
      mining: 'Mining',
      construction: 'Construction',
      hospitality_and_tourism: 'Hospitality',
      bushfire_recovery_work: 'Bushfire Recovery',
      critical_covid19_work: 'COVID-19 Work',
      other: 'Other',
    };
    return labels[industry] || industry;
  };

  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">
              {formatDate(entry.work_date)}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(entry)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{entry.employer_name}</span>
          </div>

          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {getIndustryLabel(entry.industry)}
            </Badge>
            {entry.is_eligible ? (
              <Badge
                variant="default"
                className="bg-success/10 text-success border border-success/20"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Eligible
              </Badge>
            ) : (
              <Badge
                variant="destructive"
                className="bg-destructive/10 text-destructive border border-destructive/20"
              >
                <XCircle className="h-3 w-3 mr-1" />
                Not Eligible
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-lg font-bold">
              {formatHours(entry.hours)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
