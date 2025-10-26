import { AppRouter } from '@/app/router';
import { AuthProvider } from '@/lib/auth';
import { ThemeProvider, useTheme } from '@/lib/theme';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/react-query';
import { Toaster } from 'sonner';

const ToasterWithTheme = () => {
  const { theme } = useTheme();
  
  return (
    <Toaster 
      position="top-center" 
      richColors 
      duration={4000}
      visibleToasts={5}
      closeButton
      expand={false}
      theme={theme}
      className="font-medium"
      toastOptions={{
        className: 'bg-card border-border text-card-foreground shadow-lg backdrop-blur-md rounded-lg transition-all duration-300 ease-in-out transform hover:scale-[1.02]',
        style: {
          fontSize: '14px',
          fontWeight: '500',
        }
      }}
    />
  );
};

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppRouter />
          <ToasterWithTheme />
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};