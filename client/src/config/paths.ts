export const paths = {
  home: {
    path: '/',
    getHref: () => '/',
  },
  legal: {
    privacy: {
      path: '/privacy',
      getHref: () => '/privacy',
    },
    terms: {
      path: '/terms',
      getHref: () => '/terms',
    },
  },
  auth: {
    login: {
      path: '/auth/login',
      getHref: (redirectTo?: string) =>
        `/auth/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
    register: {
      path: '/auth/register',
      getHref: (redirectTo?: string) =>
        `/auth/register${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
  },
  app: {
    dashboard: {
      path: '/app',
      getHref: () => '/app',
    },
    employers: {
      path: '/app/employers',
      getHref: () => '/app/employers',
      new: {
        path: '/app/employers/new',
        getHref: () => '/app/employers/new',
      },
      edit: {
        path: '/app/employers/:id/edit',
        getHref: (id: string) => `/app/employers/${id}/edit`,
      },
    },
    hours: {
      path: '/app/hours',
      getHref: () => '/app/hours',
      edit: {
        path: '/app/hours/edit',
        getHref: () => '/app/hours/edit',
      },
    },
    visas: {
      path: '/app/visas',
      getHref: () => '/app/visas',
      new: {
        path: '/app/visas/new',
        getHref: () => '/app/visas/new',
      },
      edit: {
        path: '/app/visas/:type/edit',
        getHref: (type: string) => `/app/visas/${type}/edit`,
      },
    },
    profile: {
      path: '/app/profile',
      getHref: () => '/app/profile',
    },
  },
};
