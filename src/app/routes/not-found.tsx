import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';

export const NotFoundRoute = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-3xl font-bold">Page not found</h2>
        <p className="mt-4 text-muted-foreground">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-8">
          <Button asChild>
            <Link to={paths.home.path}>Go back home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};