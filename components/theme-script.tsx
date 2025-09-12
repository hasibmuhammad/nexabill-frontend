// This script runs before React hydrates to prevent FOUC (Flash of Unstyled Content)
// It immediately applies the stored theme or system preference
export function ThemeScript() {
  const themeScript = `
    (function() {
      try {
        // Check for stored theme
        const storedTheme = localStorage.getItem('theme');
        
        // Check system preference
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        
        // Determine theme to apply
        const theme = storedTheme || systemTheme;
        
        // Apply theme immediately
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        // Add smooth transitions after theme is set
        document.documentElement.style.transition = 'background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), color 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      } catch (e) {
        // Fallback: do nothing if localStorage is not available
      }
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: themeScript,
      }}
    />
  );
}
