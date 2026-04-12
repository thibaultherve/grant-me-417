import { ELIGIBLE_COUNTRIES_SORTED } from '@regranted/shared';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { paths } from '@/config/paths';
import { useRegister } from '@/lib/auth';

export const RegisterRoute = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [nationality, setNationality] = useState('');

  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get('redirectTo') || paths.app.dashboard.path;

  const registerMutation = useRegister({
    onSuccess: () => {
      toast.success('Account created successfully!');
      navigate(redirectTo);
    },
  });

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('firstName') as string;

    registerMutation.mutate(
      { email, password, firstName, nationality },
      {
        onError: (err) => {
          toast.error(err.message || 'Failed to create account');
        },
      },
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-background text-foreground">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Register</CardTitle>
          <CardDescription>Create your account to get started</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="John"
                required
                disabled={registerMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality</Label>
              <Select
                value={nationality}
                onValueChange={setNationality}
                disabled={registerMutation.isPending}
              >
                <SelectTrigger
                  id="nationality"
                  aria-label="Nationality"
                  className="w-full"
                >
                  <SelectValue placeholder="Select your nationality" />
                </SelectTrigger>
                <SelectContent>
                  {ELIGIBLE_COUNTRIES_SORTED.map(({ code, label }) => (
                    <SelectItem key={code} value={code}>
                      <span className={`fi fi-${code.toLowerCase()} mr-2`} />
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                disabled={registerMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                minLength={8}
                required
                disabled={registerMutation.isPending}
              />
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) =>
                  setTermsAccepted(checked === true)
                }
                disabled={registerMutation.isPending}
                className="mt-0.5"
              />
              <Label
                htmlFor="terms"
                className="text-sm font-normal leading-snug text-muted-foreground"
              >
                I agree to the{' '}
                <Link
                  to={paths.legal.terms.getHref()}
                  target="_blank"
                  className="text-primary hover:underline"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  to={paths.legal.privacy.getHref()}
                  target="_blank"
                  className="text-primary hover:underline"
                >
                  Privacy Policy
                </Link>
              </Label>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={
                registerMutation.isPending || !termsAccepted || !nationality
              }
            >
              {registerMutation.isPending
                ? 'Creating account...'
                : 'Create account'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                to={paths.auth.login.getHref(redirectTo)}
                className="font-medium text-primary hover:underline"
              >
                Login here
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
