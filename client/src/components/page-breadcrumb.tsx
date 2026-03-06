import { Fragment } from 'react';
import { Link } from 'react-router';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs';

/**
 * PageBreadcrumb component that automatically generates breadcrumbs
 * based on the current route. Renders nothing if no breadcrumb config exists.
 */
export function PageBreadcrumb() {
  const items = useBreadcrumbs();

  if (items.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <Fragment key={item.label}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {item.isCurrentPage ? (
                <BreadcrumbPage className="text-2xl font-bold">
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild className="text-2xl font-bold">
                  <Link to={item.href!}>{item.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
