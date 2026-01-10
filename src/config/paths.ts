export const paths = {
  home: {
    path: '/',
    getHref: () => '/',
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
    },
    hours: {
      path: '/app/hours',
      getHref: () => '/app/hours',
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
