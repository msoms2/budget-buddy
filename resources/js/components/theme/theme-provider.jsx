import React, { createContext, useContext, useEffect, useState } from 'react';

// Create context for theme
const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => {},
});

// Hook for using theme
export const useTheme = () => useContext(ThemeContext);

// Theme provider component
export function ThemeProvider({ children, defaultTheme = 'light' }) {
  const [theme, setTheme] = useState(() => {
    // Try to get theme from session storage
    if (typeof window !== 'undefined') {
      const savedTheme = window.sessionStorage.getItem('user_theme');
      return savedTheme || defaultTheme;
    }
    return defaultTheme;
  });

  // Update theme in DOM and session storage when it changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save theme preference to session storage
    window.sessionStorage.setItem('user_theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}