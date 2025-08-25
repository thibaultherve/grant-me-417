export const paths = {
  home: {
    path: '/',
    getHref: () => '/',
  },
  auth: {
    login: {
      path: '/auth/login',
      getHref: (redirectTo) =>
        `/auth/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
    register: {
      path: '/auth/register',
      getHref: (redirectTo) =>
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
    },
    workEntries: {
      path: '/app/work-entries',
      getHref: () => '/app/work-entries',
    },
    visas: {
      path: '/app/visas',
      getHref: () => '/app/visas',
    },
    profile: {
      path: '/app/profile',
      getHref: () => '/app/profile',
    },
  },
};