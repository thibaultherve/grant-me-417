import { AUSTRALIAN_STATE_NAMES } from '@regranted/shared';
import { Fragment } from 'react';
import { Link } from 'react-router';

import { PostcodeLinkBadge } from '@/components/shared/postcode-link-badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { paths } from '@/config/paths';

import type { VisaTypeFilter } from '../types/directory';

import { FavoriteButton } from './favorite-button';
import { VisaTypeTabs } from './visa-type-tabs';

interface PostcodeDetailHeaderProps {
  postcode: string;
  stateCode: string;
  suburbs: { id: number; suburbName: string }[];
  selectedSuburbId?: string;
  isFavorite: boolean;
  visaType: VisaTypeFilter;
  onToggleFavorite: () => void;
  onVisaTypeChange: (value: VisaTypeFilter) => void;
}

export function PostcodeDetailHeader({
  postcode,
  stateCode,
  suburbs,
  selectedSuburbId,
  isFavorite,
  visaType,
  onToggleFavorite,
  onVisaTypeChange,
}: PostcodeDetailHeaderProps) {
  const selectedSuburb = selectedSuburbId
    ? suburbs.find((s) => String(s.id) === selectedSuburbId)
    : null;

  const stateName =
    (AUSTRALIAN_STATE_NAMES as Record<string, string>)[stateCode] ?? stateCode;

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="text-2xl font-bold">
                <Link to={paths.app.tools.directory.getHref()}>Directory</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
              {selectedSuburb ? (
                <BreadcrumbLink asChild>
                  <Link
                    to={paths.app.tools.directory.postcode.getHref(postcode)}
                    className="inline-flex items-center"
                  >
                    <PostcodeLinkBadge
                      postcode={postcode}
                      stateCode={stateCode}
                      size="lg"
                      asLink={false}
                    />
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="inline-flex items-center">
                  <PostcodeLinkBadge
                    postcode={postcode}
                    stateCode={stateCode}
                    size="lg"
                    asLink={false}
                  />
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>

            <BreadcrumbItem className="ml-1">
              <FavoriteButton
                isFavorite={isFavorite}
                onClick={onToggleFavorite}
              />
            </BreadcrumbItem>

            {selectedSuburb && (
              <Fragment>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-2xl font-bold">
                    {selectedSuburb.suburbName}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </Fragment>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Subtitle */}
      <p className="text-sm text-muted-foreground">
        {selectedSuburb
          ? `Postcode ${postcode} — ${stateName}`
          : formatSuburbSubtitle(suburbs)}
      </p>

      {/* Visa type tabs */}
      <VisaTypeTabs value={visaType} onChange={onVisaTypeChange} />
    </div>
  );
}

function formatSuburbSubtitle(suburbs: { suburbName: string }[]): string {
  if (suburbs.length === 0) return 'No suburbs';
  const maxShow = 5;
  const names = suburbs.slice(0, maxShow).map((s) => s.suburbName);
  const remaining = suburbs.length - maxShow;
  const base = names.join(', ');
  if (remaining > 0) {
    return `${base} and ${remaining} more suburb${remaining > 1 ? 's' : ''}`;
  }
  return base;
}
