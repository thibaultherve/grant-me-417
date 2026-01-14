import { useMemo } from 'react';
import { useLocation } from 'react-router';

import { paths } from '@/config/paths';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrentPage: boolean;
}

interface RouteConfig {
  label: string;
  parent?: string;
}

// Route configuration mapping paths to labels
const routeConfig: Record<string, RouteConfig> = {
  [paths.app.dashboard.path]: {
    label: 'Dashboard',
  },
  [paths.app.hours.path]: {
    label: 'Work Hours',
  },
  [paths.app.hours.edit.path]: {
    label: 'Edit',
    parent: paths.app.hours.path,
  },
  [paths.app.employers.path]: {
    label: 'Employers',
  },
  [paths.app.employers.new.path]: {
    label: 'New',
    parent: paths.app.employers.path,
  },
  // Dynamic route pattern - will be matched with regex
  '/app/employers/:id/edit': {
    label: 'Edit',
    parent: paths.app.employers.path,
  },
  [paths.app.visas.path]: {
    label: 'Visas',
  },
  [paths.app.profile.path]: {
    label: 'Profile',
  },
};

/**
 * Match a pathname against route patterns (including dynamic segments)
 */
function matchRoute(pathname: string): RouteConfig | null {
  // First try exact match
  if (routeConfig[pathname]) {
    return routeConfig[pathname];
  }

  // Try pattern matching for dynamic routes
  for (const [pattern, config] of Object.entries(routeConfig)) {
    if (pattern.includes(':')) {
      // Convert pattern to regex (e.g., /app/employers/:id/edit -> /app/employers/[^/]+/edit)
      const regexPattern = pattern.replace(/:[^/]+/g, '[^/]+');
      const regex = new RegExp(`^${regexPattern}$`);
      if (regex.test(pathname)) {
        return config;
      }
    }
  }

  return null;
}

/**
 * Hook to generate breadcrumb items based on current route
 */
export function useBreadcrumbs(): BreadcrumbItem[] {
  const location = useLocation();

  return useMemo(() => {
    const items: BreadcrumbItem[] = [];
    const currentConfig = matchRoute(location.pathname);

    if (!currentConfig) {
      return items;
    }

    // Build breadcrumb chain by following parent links
    const buildChain = (config: RouteConfig, path: string): void => {
      if (config.parent) {
        const parentConfig = routeConfig[config.parent];
        if (parentConfig) {
          buildChain(parentConfig, config.parent);
        }
      }

      items.push({
        label: config.label,
        href: config.parent ? path : undefined, // Only add href if it has a parent (not current page)
        isCurrentPage: path === location.pathname || !config.parent,
      });
    };

    // Start building from current route
    buildChain(currentConfig, location.pathname);

    // Mark the last item as current page
    if (items.length > 0) {
      // Reset all isCurrentPage first
      items.forEach((item, index) => {
        item.isCurrentPage = index === items.length - 1;
        // Add href to non-current items
        if (!item.isCurrentPage && !item.href) {
          // Find the path for this label
          const entry = Object.entries(routeConfig).find(
            ([, cfg]) => cfg.label === item.label && !cfg.parent,
          );
          if (entry) {
            item.href = entry[0];
          }
        }
      });
    }

    return items;
  }, [location.pathname]);
}
