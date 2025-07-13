import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';
type AccentColor = 'blue' | 'purple' | 'green' | 'red' | 'yellow' | 'pink';

interface ThemeContextType {
  theme: Theme;
  accentColor: AccentColor;
  setTheme: (theme: Theme) => void;
  setAccentColor: (color: AccentColor) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('voyagehub-theme');
    return (stored as Theme) || 'dark';
  });
  
  const [accentColor, setAccentColor] = useState<AccentColor>(() => {
    const stored = localStorage.getItem('voyagehub-accent');
    return (stored as AccentColor) || 'blue';
  });

  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const updateTheme = () => {
      let shouldBeDark = theme === 'dark';
      
      if (theme === 'system') {
        shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      
      setIsDark(shouldBeDark);
      
      // Update CSS custom properties
      const root = document.documentElement;
      
      if (shouldBeDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
      
      // Update accent color CSS variables
      const accentColors = {
        blue: {
          primary: '#3B82F6',
          primaryHover: '#2563EB',
          primaryLight: '#DBEAFE',
        },
        purple: {
          primary: '#8B5CF6',
          primaryHover: '#7C3AED',
          primaryLight: '#EDE9FE',
        },
        green: {
          primary: '#10B981',
          primaryHover: '#059669',
          primaryLight: '#D1FAE5',
        },
        red: {
          primary: '#EF4444',
          primaryHover: '#DC2626',
          primaryLight: '#FEE2E2',
        },
        yellow: {
          primary: '#F59E0B',
          primaryHover: '#D97706',
          primaryLight: '#FEF3C7',
        },
        pink: {
          primary: '#EC4899',
          primaryHover: '#DB2777',
          primaryLight: '#FCE7F3',
        },
      };
      
      const colors = accentColors[accentColor];
      root.style.setProperty('--color-primary', colors.primary);
      root.style.setProperty('--color-primary-hover', colors.primaryHover);
      root.style.setProperty('--color-primary-light', colors.primaryLight);
    };

    updateTheme();
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        updateTheme();
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, accentColor]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('voyagehub-theme', newTheme);
  };

  const handleSetAccentColor = (newColor: AccentColor) => {
    setAccentColor(newColor);
    localStorage.setItem('voyagehub-accent', newColor);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        accentColor,
        setTheme: handleSetTheme,
        setAccentColor: handleSetAccentColor,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};