import { useMemo } from 'react';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { paths } from '@/config/paths';

const createAppRouter = () =>
  createBrowserRouter([
    {
      path: paths.home.path,
      lazy: async () => {
        const { LandingPage } = await import('./routes/landing');
        return { Component: LandingPage };
      },
    },
    {
      path: paths.legal.privacy.path,
      lazy: async () => {
        const { PrivacyRoute } = await import('./routes/legal/privacy');
        return { Component: PrivacyRoute };
      },
    },
    {
      path: paths.legal.terms.path,
      lazy: async () => {
        const { TermsRoute } = await import('./routes/legal/terms');
        return { Component: TermsRoute };
      },
    },
    {
      path: paths.auth.register.path,
      lazy: async () => {
        const { RegisterRoute } = await import('./routes/auth/register');
        return { Component: RegisterRoute };
      },
    },
    {
      path: paths.auth.login.path,
      lazy: async () => {
        const { LoginRoute } = await import('./routes/auth/login');
        return { Component: LoginRoute };
      },
    },
    {
      path: paths.app.dashboard.path,
      lazy: async () => {
        const { ProtectedAppRoot } = await import('./routes/app/root');
        return { Component: ProtectedAppRoot };
      },
      children: [
        {
          index: true,
          lazy: async () => {
            const { DashboardRoute } = await import('./routes/app/dashboard');
            return { Component: DashboardRoute };
          },
        },
        {
          path: paths.app.employers.path,
          children: [
            {
              index: true,
              lazy: async () => {
                const { EmployersRoute } =
                  await import('./routes/app/employers');
                return { Component: EmployersRoute };
              },
            },
            {
              path: 'new',
              lazy: async () => {
                const { EmployerNewRoute } =
                  await import('./routes/app/employers/new');
                return { Component: EmployerNewRoute };
              },
            },
            {
              path: ':id/edit',
              lazy: async () => {
                const { EmployerEditRoute } =
                  await import('./routes/app/employers/edit');
                return { Component: EmployerEditRoute };
              },
            },
          ],
        },
        {
          path: paths.app.hours.path,
          children: [
            {
              index: true,
              lazy: async () => {
                const { HoursRoute } = await import('./routes/app/hours/hours');
                return { Component: HoursRoute };
              },
            },
            {
              path: 'edit',
              lazy: async () => {
                const { HoursEditRoute } =
                  await import('./routes/app/hours/edit');
                return { Component: HoursEditRoute };
              },
            },
          ],
        },
        {
          path: paths.app.visas.path,
          children: [
            {
              index: true,
              lazy: async () => {
                const { VisasRoute } = await import('./routes/app/visas');
                return { Component: VisasRoute };
              },
            },
            {
              path: 'new',
              lazy: async () => {
                const { VisaNewRoute } = await import('./routes/app/visas/new');
                return { Component: VisaNewRoute };
              },
            },
            {
              path: ':type/edit',
              lazy: async () => {
                const { VisaEditRoute } =
                  await import('./routes/app/visas/edit');
                return { Component: VisaEditRoute };
              },
            },
          ],
        },
        {
          path: paths.app.tools.directory.path,
          children: [
            {
              index: true,
              lazy: async () => {
                const { DirectoryRoute } =
                  await import('./routes/app/tools/directory');
                return { Component: DirectoryRoute };
              },
            },
            {
              path: 'changes/:date',
              lazy: async () => {
                const { ChangeDetailRoute } =
                  await import('./routes/app/tools/directory/changes');
                return { Component: ChangeDetailRoute };
              },
            },
            {
              path: ':postcode',
              children: [
                {
                  index: true,
                  lazy: async () => {
                    const { PostcodeDetailRoute } =
                      await import('./routes/app/tools/directory/postcode');
                    return { Component: PostcodeDetailRoute };
                  },
                },
                {
                  path: ':suburbId',
                  lazy: async () => {
                    const { PostcodeDetailRoute } =
                      await import('./routes/app/tools/directory/postcode');
                    return { Component: PostcodeDetailRoute };
                  },
                },
              ],
            },
          ],
        },
        {
          path: paths.app.profile.path,
          lazy: async () => {
            const { ProfileRoute } = await import('./routes/app/profile');
            return { Component: ProfileRoute };
          },
        },
      ],
    },
    {
      path: '*',
      lazy: async () => {
        const { NotFoundRoute } = await import('./routes/not-found');
        return { Component: NotFoundRoute };
      },
    },
  ]);

export const AppRouter = () => {
  const router = useMemo(() => createAppRouter(), []);

  return <RouterProvider router={router} />;
};
