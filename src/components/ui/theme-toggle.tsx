import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { Button } from './button';

interface ThemeToggleProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
  className?: string;
}

export const ThemeToggle = ({ 
  variant = 'ghost', 
  size = 'icon',
  showLabel = false,
  className 
}: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={className}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <>
          <Moon className="h-4 w-4" />
          {showLabel && <span className="ml-2">Dark</span>}
        </>
      ) : (
        <>
          <Sun className="h-4 w-4" />
          {showLabel && <span className="ml-2">Light</span>}
        </>
      )}
    </Button>
  );
};