import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { paths } from '@/config/paths';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export const LandingPage = () => {
  const { user, loading } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);

      // Manual fallback: clear all Supabase auth data from localStorage
      // This is necessary because signOut() with scope: 'local' still tries to call the server
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });

      // Try to sign out normally, but ignore errors since we already cleared localStorage
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch {
        // Ignore errors - we already cleared the session manually
      }

      // Force a page reload to ensure all state is cleared
      window.location.href = '/';

      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
      console.error('Sign out error:', error);
    } finally {
      setSigningOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Grant Me 417</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <>
                <Button asChild>
                  <Link to={paths.app.dashboard.path}>Dashboard</Link>
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  disabled={signingOut}
                >
                  {signingOut ? 'Signing out...' : 'Sign out'}
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to={paths.auth.login.path}>Login</Link>
                </Button>
                <Button asChild>
                  <Link to={paths.auth.register.path}>Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-24 text-center">
          {user ? (
            <>
              <h2 className="mb-6 text-5xl font-bold tracking-tight">
                Welcome back!
              </h2>
              <p className="mb-8 text-xl text-muted-foreground">
                Continue tracking your specified work progress for your Working
                Holiday Visa
              </p>
              <div className="flex justify-center gap-4">
                <Button size="lg" asChild>
                  <Link to={paths.app.dashboard.path}>Dashboard</Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <h2 className="mb-6 text-5xl font-bold tracking-tight">
                Track Your WHV Work Hours
              </h2>
              <p className="mb-8 text-xl text-muted-foreground">
                The easiest way to track your specified work for your second or
                third Working Holiday Visa in Australia
              </p>
              <div className="flex justify-center gap-4">
                <Button size="lg" asChild>
                  <Link to={paths.auth.register.path}>Start Tracking Now</Link>
                </Button>
              </div>
            </>
          )}
        </section>

        <section id="features" className="container mx-auto px-4 py-24">
          <h3 className="mb-12 text-center text-3xl font-bold">Features</h3>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <h4 className="mb-4 text-xl font-semibold">Track Work Hours</h4>
              <p className="text-muted-foreground">
                Easily log your daily work hours and keep track of your progress
                towards visa requirements
              </p>
            </div>
            <div className="text-center">
              <h4 className="mb-4 text-xl font-semibold">Manage Employers</h4>
              <p className="text-muted-foreground">
                Keep all your employer information organized in one place
              </p>
            </div>
            <div className="text-center">
              <h4 className="mb-4 text-xl font-semibold">Generate Reports</h4>
              <p className="text-muted-foreground">
                Export your work history for visa applications with one click
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025 Grant Me 417. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
