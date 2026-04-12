import { Star } from 'lucide-react';

import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onClick: () => void;
  className?: string;
}

export function FavoriteButton({
  isFavorite,
  onClick,
  className,
}: FavoriteButtonProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        'inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors cursor-pointer hover:bg-muted',
        className,
      )}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Star
        className={cn(
          'w-4 h-4 transition-colors',
          isFavorite
            ? 'fill-warning text-warning'
            : 'fill-none text-muted-foreground',
        )}
      />
    </button>
  );
}
