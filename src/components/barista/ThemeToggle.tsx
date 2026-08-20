import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";

const STORAGE_KEY = "scoffey-theme";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const next: Theme = stored === "light" || stored === "dark" ? stored : "dark";
    setTheme(next);
    applyTheme(next);
  }, []);

  const update = (next: Theme) => {
    setTheme(next);
    applyTheme(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <div className="flex items-center rounded-full border border-border bg-secondary p-1">
      <button
        type="button"
        onClick={() => update("light")}
        aria-label="Light mode"
        aria-pressed={theme === "light"}
        className={`rounded-full px-2.5 py-1 transition-colors ${
          theme === "light"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Sun className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => update("dark")}
        aria-label="Dark mode"
        aria-pressed={theme === "dark"}
        className={`rounded-full px-2.5 py-1 transition-colors ${
          theme === "dark"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Moon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
