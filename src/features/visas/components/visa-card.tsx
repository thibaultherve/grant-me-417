import { Trash2, Edit, Calendar, CheckCircle, Clock } from 'lucide-react';

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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import type { UserVisa } from '../types';

interface VisaCardProps {
  visa: UserVisa;
  onDelete: (id: string) => void;
  onEdit?: (visa: UserVisa) => void;
}

const visaLabels: Record<string, string> = {
  first_whv: 'First WHV (417)',
  second_whv: 'Second WHV (417)',
  third_whv: 'Third WHV (417)',
};

const visaDescriptions: Record<string, string> = {
  first_whv: 'Your initial Working Holiday Visa',
  second_whv: 'Complete 88 days of specified work',
  third_whv: 'Complete 179 days of specified work',
};

export function VisaCard({ visa, onDelete, onEdit }: VisaCardProps) {
  const getStatusBadge = () => {
    if (visa.progress_percentage >= 100) {
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle className="w-3 h-3" />
          Completed
        </Badge>
      );
    } else if (visa.progress_percentage > 0) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="w-3 h-3" />
          In Progress
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="gap-1">
          Not Started
        </Badge>
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">
              {visaLabels[visa.visa_type] || visa.visa_type}
            </CardTitle>
            <CardDescription>
              {visaDescriptions[visa.visa_type] || ''}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onEdit(visa)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Visa</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "
                    {visaLabels[visa.visa_type]}"? All associated work entries
                    will remain, but visa tracking data will be lost. This
                    action cannot be undone.
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
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {visa.days_worked} / {visa.days_required} days
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary">
            <div
              className="h-2 rounded-full bg-primary transition-all duration-300"
              style={{ width: `${Math.min(visa.progress_percentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{visa.progress_percentage.toFixed(1)}% complete</span>
            {visa.days_remaining > 0 && (
              <span>{visa.days_remaining} days remaining</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>
            {formatDate(visa.arrival_date)} → {formatDate(visa.expiry_date)}
          </span>
        </div>

        {visa.eligible_days > 0 && (
          <div className="text-sm">
            <span className="text-muted-foreground">Eligible days: </span>
            <span className="font-medium text-foreground">
              {visa.eligible_days}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
