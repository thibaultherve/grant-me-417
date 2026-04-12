import { Trash2 } from 'lucide-react';

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

const footerButtonStyle = {
  backgroundColor: 'var(--background)',
  borderColor: 'var(--border)',
  boxShadow: '0 1px 1.75px 0 rgba(0,0,0,0.05)',
};

interface EditFooterProps {
  mode: 'edit';
  isBusy: boolean;
  isSubmitting?: boolean;
  isDeleting?: boolean;
  visaId: string;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

interface AddFooterProps {
  mode: 'add';
  isBusy: boolean;
  isSubmitting?: boolean;
  canSubmit: boolean;
  onCancel: () => void;
}

type VisaFormFooterProps = EditFooterProps | AddFooterProps;

export function VisaFormFooter(props: VisaFormFooterProps) {
  const { mode, isBusy, isSubmitting, onCancel } = props;

  if (mode === 'edit') {
    const { isDeleting, visaId, onDelete } = props;

    return (
      <div className="flex items-center justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isBusy}
          className="h-10"
          style={footerButtonStyle}
        >
          Cancel
        </Button>

        {onDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                disabled={isBusy}
                className="h-10 gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Visa</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this WHV 417 visa? All
                  associated work entries will remain, but visa tracking data
                  will be lost. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(visaId)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        <Button type="submit" disabled={isBusy} className="h-10">
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </div>
    );
  }

  const { canSubmit } = props;

  return (
    <div className="flex items-center justify-end gap-3 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isBusy}
        className="h-10"
        style={footerButtonStyle}
      >
        Cancel
      </Button>

      <Button type="submit" disabled={isBusy || !canSubmit} className="h-10">
        {isSubmitting ? 'Adding...' : 'Add Visa'}
      </Button>
    </div>
  );
}
