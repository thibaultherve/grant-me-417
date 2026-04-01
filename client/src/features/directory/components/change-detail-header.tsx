import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { paths } from '@/config/paths';
import { formatDate } from '@/utils/date-format';

import type { VisaTypeFilter } from '../types/directory';

interface ChangeDetailHeaderProps {
  date: string;
  visaType: VisaTypeFilter;
}

export function ChangeDetailHeader({
  date,
  visaType,
}: ChangeDetailHeaderProps) {
  return (
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
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
        <ShieldCheck className="w-3.5 h-3.5" />
        WHV {visaType}
      </span>
    </div>
  );
}
