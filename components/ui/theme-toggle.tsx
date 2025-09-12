"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme-context";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="relative h-9 w-9 px-0 bg-slate-100 border-slate-200 hover:bg-slate-200 dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600 theme-transition hover:scale-105"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
