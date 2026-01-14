import { Building2, Edit, Factory, MapPin, Trash2 } from 'lucide-react';
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
import { Card, CardContent } from '@/components/ui/card';
import { paths } from '@/config/paths';

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

export function EmployerCard({ employer, onDelete }: EmployerCardProps) {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Format suburb display: "SUBURB, POSTCODE STATE"
  const locationDisplay = `${employer.suburb.suburb_name}, ${employer.suburb.postcode} ${employer.suburb.state_code}`;

  return (
    <Card className="shadow-sm">
      <CardContent>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 bg-primary/10 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
              <Building2 className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm truncate">
                  {employer.name}
                </h3>
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    employer.is_eligible ? 'bg-success' : 'bg-muted-foreground/40'
                  }`}
                  title={employer.is_eligible ? 'Eligible' : 'Not eligible'}
                />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Factory className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">
                  {industryLabels[employer.industry] || employer.industry}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{locationDisplay}</span>
                {employer.suburb.postcodeData && (
                  <PostcodeBadges
                    postcode={employer.suburb.postcodeData}
                    size="sm"
                    className="ml-0.5"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() =>
                navigate(paths.app.employers.edit.getHref(employer.id))
              }
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
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
