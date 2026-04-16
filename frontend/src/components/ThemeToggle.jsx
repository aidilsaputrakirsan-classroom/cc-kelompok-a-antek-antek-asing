import { Sun, Moon } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

export default function ThemeToggle() {
  const { mode, toggleMode } = useTheme();

  const getModeLabel = () => {
    return mode === "dark" ? "Dark" : "Light";
  };

  const getModeIcon = () => {
    return mode === "dark" ? <Moon size={20} /> : <Sun size={20} />;
  };

  const handleToggle = () => {
    toggleMode();
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg transition-all text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
      aria-label={`Current theme: ${getModeLabel()}. Click to switch.`}
      title={`Current: ${getModeLabel()} mode\nClick to change`}
    >
      <div className="transition-transform duration-300 rotate-0 group-hover:rotate-12">
        {getModeIcon()}
      </div>
    </button>
  );
}

