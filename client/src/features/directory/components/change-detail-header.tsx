import { ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';
import { formatDate } from '@/utils/date-format';

import type { VisaTypeFilter } from '../types/directory';

interface ChangeDetailHeaderProps {
  date: string;
  visaType: VisaTypeFilter;
  prevDate?: string;
  nextDate?: string;
}

export function ChangeDetailHeader({
  date,
  visaType,
  prevDate,
  nextDate,
}: ChangeDetailHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="text-2xl font-bold">
                <Link to={paths.app.tools.directory.getHref()}>Directory</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbLink className="text-2xl font-bold text-muted-foreground">
                Changes
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbPage className="text-2xl font-bold">
                {formatDate(date)}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Visa badge pill */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-[13px] font-semibold text-primary-foreground">
          <ShieldCheck className="w-3.5 h-3.5" />
          WHV {visaType}
        </span>
      </div>

      {/* Previous / Next navigation */}
      <div className="flex items-center gap-1">
        {prevDate ? (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2.5"
            asChild
          >
            <Link
              to={`/app/tools/directory/changes/${prevDate}?visaType=${visaType}`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </Link>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2.5"
            disabled
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Previous
          </Button>
        )}
        {nextDate ? (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2.5"
            asChild
          >
            <Link
              to={`/app/tools/directory/changes/${nextDate}?visaType=${visaType}`}
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2.5"
            disabled
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
