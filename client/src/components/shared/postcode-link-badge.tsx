import { Link } from 'react-router';

import { paths } from '@/config/paths';
import { cn } from '@/lib/utils';

// Static class strings required for Tailwind v4 detection at build time
export const STATE_CONFIG: Record<string, { bg: string; fg: string }> = {
  ACT: { bg: 'bg-state-act', fg: 'text-white' },
  NSW: { bg: 'bg-state-nsw', fg: 'text-state-nsw-fg' },
  NT: { bg: 'bg-state-nt', fg: 'text-white' },
  QLD: { bg: 'bg-state-qld', fg: 'text-white' },
  SA: { bg: 'bg-state-sa', fg: 'text-white' },
  TAS: { bg: 'bg-state-tas', fg: 'text-white' },
  VIC: { bg: 'bg-state-vic', fg: 'text-white' },
  WA: { bg: 'bg-state-wa', fg: 'text-state-wa-fg' },
};

const SIZE_CLASSES = {
  sm: {
    state: 'text-[10px] font-semibold px-[5px]',
    postcode: 'text-[10px] font-medium px-[5px]',
    radius: 'rounded',
  },
  default: {
    state: 'text-[10px] font-bold px-2',
    postcode: 'text-sm font-semibold px-2 pl-1.5',
    radius: 'rounded',
  },
  lg: {
    state: 'text-xs font-bold px-2',
    postcode: 'text-[28px] font-bold px-2.5 pl-2',
    radius: 'rounded-md',
  },
} as const;

interface PostcodeLinkBadgeProps {
  postcode: string;
  stateCode: string;
  size?: 'sm' | 'default' | 'lg';
  asLink?: boolean;
  className?: string;
}

export function PostcodeLinkBadge({
  postcode,
  stateCode,
  size = 'default',
  asLink = true,
  className,
}: PostcodeLinkBadgeProps) {
  const stateConfig = STATE_CONFIG[stateCode] ?? {
    bg: 'bg-muted',
    fg: 'text-muted-foreground',
  };
  const sizeConfig = SIZE_CLASSES[size];

  const badge = (
    <span
      className={cn(
        'inline-flex items-stretch shrink-0 leading-none',
        sizeConfig.radius,
        asLink &&
          'hover:opacity-90 hover:shadow-sm transition-all cursor-pointer',
        className,
      )}
    >
      {/* State half (colored bg) */}
      <span
        className={cn(
          'inline-flex items-center justify-center',
          sizeConfig.state,
          sizeConfig.radius,
          'rounded-r-none',
          stateConfig.bg,
          stateConfig.fg,
        )}
      >
        {stateCode}
      </span>
      {/* Postcode half (white bg, border) */}
      <span
        className={cn(
          'inline-flex items-center justify-center',
          sizeConfig.postcode,
          sizeConfig.radius,
          'rounded-l-none',
          'bg-background border border-border border-l-0 text-foreground',
        )}
      >
        {postcode}
      </span>
    </span>
  );

  if (!asLink) return badge;

  return (
    <Link
      to={paths.app.tools.directory.postcode.getHref(postcode)}
      className="inline-flex"
      onClick={(e) => e.stopPropagation()}
    >
      {badge}
    </Link>
  );
}
