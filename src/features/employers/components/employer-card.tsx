import {
  Building2,
  MapPin,
  CheckCircle,
  XCircle,
  Trash2,
  Edit,
  MoreVertical,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { paths } from '@/config/paths';
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
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import type { Employer } from '../types';

import { PostcodeBadges } from './postcode-badges';

interface EmployerCardProps {
  employer: Employer;
  onDelete: (id: string) => void;
}

const industryLabels: Record<string, string> = {
  plant_and_animal_cultivation: 'Plant & Animal Cultivation',
  fishing_and_pearling: 'Fishing & Pearling',
  tree_farming_and_felling: 'Tree Farming & Felling',
  mining: 'Mining',
  construction: 'Construction',
  hospitality_and_tourism: 'Hospitality & Tourism',
  bushfire_recovery_work: 'Bushfire Recovery',
  critical_covid19_work: 'Critical COVID-19 Work',
  other: 'Other',
};

export function EmployerCard({
  employer,
  onDelete,
}: EmployerCardProps) {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Format suburb display: "SUBURB, POSTCODE STATE"
  const locationDisplay = `${employer.suburb.suburb_name}, ${employer.suburb.postcode} ${employer.suburb.state_code}`;

  return (
    <Card className="shadow-sm">
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
              <Building2 className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm truncate">
                  {employer.name}
                </h3>
                {employer.is_eligible ? (
                  <CheckCircle className="w-3.5 h-3.5 text-success flex-shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="truncate">
                  {industryLabels[employer.industry] || employer.industry}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{locationDisplay}</span>
                  {employer.suburb.postcodeData && (
                    <PostcodeBadges
                      postcode={employer.suburb.postcodeData}
                      size="sm"
                      className="ml-0.5 gap-1"
                    />
                  )}
                </span>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 flex-shrink-0"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(paths.app.employers.edit.getHref(employer.id))}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{employer.name}"? This action
              cannot be undone.
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
    </Card>
  );
}
