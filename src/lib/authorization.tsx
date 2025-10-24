import { useAuth } from './auth';

export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
};

type User = { id: string; role?: string };
type Employer = { user_id: string };
type WorkEntry = { user_id: string };

export const POLICIES = {
  'employer:create': (user: User) => !!user,
  'employer:update': (user: User, employer: Employer) => user?.id === employer?.user_id,
  'employer:delete': (user: User, employer: Employer) => user?.id === employer?.user_id,
  'workEntry:create': (user: User) => !!user,
  'workEntry:update': (user: User, workEntry: WorkEntry) => user?.id === workEntry?.user_id,
  'workEntry:delete': (user: User, workEntry: WorkEntry) => user?.id === workEntry?.user_id,
};

export const useAuthorization = () => {
  const { user } = useAuth();

  const checkAccess = ({ allowedRoles, policyCheck }: { allowedRoles?: string[]; policyCheck?: (user: User) => boolean }) => {
    if (allowedRoles) {
      return allowedRoles.includes(user?.role || '');
    }

    if (policyCheck) {
      return policyCheck(user as User);
    }

    return true;
  };

  return { checkAccess, role: user?.role };
};