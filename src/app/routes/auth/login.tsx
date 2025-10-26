import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { supabase } from '@/lib/supabase';
import { paths } from '@/config/paths';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export const LoginRoute = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get('redirectTo') || paths.app.dashboard.path;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Welcome back!');
      navigate(redirectTo);
    } catch (error) {
      toast.error((error as Error).message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm via-beige to-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-serif font-light text-foreground mb-3 tracking-tight">
            Welcome back
          </h1>
          <p className="text-base text-muted-foreground">
            Sign in to continue tracking your work hours
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-black/5 border border-black/5 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Email Field */}
            <div className="space-y-3">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                required
                disabled={loading}
                className="h-12 bg-white/50 border-black/10 text-foreground placeholder:text-muted-foreground/50 rounded-xl focus:border-black/20 focus:ring-2 focus:ring-black/5 transition-all"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                disabled={loading}
                className="h-12 bg-white/50 border-black/10 text-foreground placeholder:text-muted-foreground/50 rounded-xl focus:border-black/20 focus:ring-2 focus:ring-black/5 transition-all"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-black hover:bg-black/90 text-white font-medium rounded-xl shadow-lg shadow-black/10 transition-all duration-200 mt-8"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          {/* Footer */}
          <div className="px-8 pb-8 pt-4">
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link
                to={paths.auth.register.getHref(redirectTo)}
                className="font-medium text-foreground hover:underline underline-offset-4 transition-all"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom Text */}
        <p className="text-center text-xs text-muted-foreground/70 mt-8">
          Track your Working Holiday Visa work hours with ease
        </p>
      </div>
    </div>
  );
};
