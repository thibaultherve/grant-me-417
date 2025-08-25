import React from 'react';
import { AppRouter } from '@/app/router';
import { AuthProvider } from '@/lib/auth';
import { ThemeProvider } from '@/lib/theme';
import { VisaProvider } from '@/features/visas/hooks/use-visa-context';
import { Toaster } from 'sonner';

export const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <VisaProvider>
          <AppRouter />
          <Toaster 
            position="top-center" 
            richColors 
            duration={4000}
            visibleToasts={5}
            closeButton
            expand={false}
            theme="system"
            className="font-medium"
            toastOptions={{
              className: 'transition-all duration-300 ease-in-out transform hover:scale-[1.02] shadow-lg backdrop-blur-sm',
              style: {
                fontSize: '14px',
                fontWeight: '500',
              }
            }}
          />
        </VisaProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};