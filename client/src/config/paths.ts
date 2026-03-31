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
        getHref: (week?: string) =>
          `/app/hours/edit${week ? `?week=${week}` : ''}`,
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
    tools: {
      directory: {
        path: '/app/tools/directory',
        getHref: () => '/app/tools/directory',
        postcode: {
          path: '/app/tools/directory/:postcode',
          getHref: (postcode: string) => `/app/tools/directory/${postcode}`,
          suburb: {
            path: '/app/tools/directory/:postcode/:suburbId',
            getHref: (postcode: string, suburbId: string) =>
              `/app/tools/directory/${postcode}/${suburbId}`,
          },
        },
      },
    },
    profile: {
      path: '/app/profile',
      getHref: () => '/app/profile',
    },
  },
};
