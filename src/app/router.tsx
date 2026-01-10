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
          lazy: async () => {
            const { EmployersRoute } = await import('./routes/app/employers');
            return { Component: EmployersRoute };
          },
        },
        {
          path: paths.app.hours.path,
          children: [
            {
              index: true,
              lazy: async () => {
                const { HoursRoute } = await import('./routes/app/hours');
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
          lazy: async () => {
            const { VisasRoute } = await import('./routes/app/visas');
            return { Component: VisasRoute };
          },
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
