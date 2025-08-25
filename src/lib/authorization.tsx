import { useAuth } from './auth';

export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
};

export const POLICIES = {
  'employer:create': (user) => !!user,
  'employer:update': (user, employer) => user?.id === employer?.user_id,
  'employer:delete': (user, employer) => user?.id === employer?.user_id,
  'workEntry:create': (user) => !!user,
  'workEntry:update': (user, workEntry) => user?.id === workEntry?.user_id,
  'workEntry:delete': (user, workEntry) => user?.id === workEntry?.user_id,
};

export const useAuthorization = () => {
  const { user } = useAuth();

  const checkAccess = ({ allowedRoles, policyCheck }) => {
    if (allowedRoles) {
      return allowedRoles.includes(user?.role);
    }

    if (policyCheck) {
      return policyCheck(user);
    }

    return true;
  };

  return { checkAccess, role: user?.role };
};