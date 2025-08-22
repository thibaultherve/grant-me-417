import { useNavigate } from "react-router-dom";
import { useAuth } from "./use-auth";

export function useAuthActions() {
  const auth = useAuth();
  const navigate = useNavigate();

  const signInAndRedirect = async (
    email: string,
    password: string,
    redirectTo = "/dashboard"
  ) => {
    await auth.signIn(email, password);
    navigate(redirectTo);
  };

  const signUpAndRedirect = async (
    email: string,
    password: string,
    redirectTo = "/dashboard"
  ) => {
    await auth.signUp(email, password);
    navigate(redirectTo);
  };

  const signOutAndRedirect = async (redirectTo = "/") => {
    navigate(redirectTo, { replace: true });
    await auth.signOut();
  };

  return {
    ...auth,
    signInAndRedirect,
    signUpAndRedirect,
    signOutAndRedirect,
  };
}
