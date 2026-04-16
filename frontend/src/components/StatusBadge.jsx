import {
  AlertTriangle,
  CheckCheck,
  Circle,
  CircleDot,
  Clock3,
  Flag,
  FolderCheck,
  Shield,
  User,
  UserCog,
  UserRoundCheck,
} from "lucide-react";

const styles = {
  open: "bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-400",
  in_progress: "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400",
  resolved: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400",
  closed: "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300",
  low: "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
  medium: "bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-400",
  high: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400",
  urgent: "bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-400",
  employee: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400",
  it_employee: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-400",
  admin: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400",
  superadmin: "bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-400",
};

const icons = {
  open: CircleDot,
  in_progress: Clock3,
  resolved: CheckCheck,
  closed: FolderCheck,
  low: Circle,
  medium: Flag,
  high: AlertTriangle,
  urgent: AlertTriangle,
  employee: User,
  it_employee: UserCog,
  admin: Shield,
  superadmin: UserRoundCheck,
};

export default function StatusBadge({ value }) {
  const Icon = icons[value] || null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
        styles[value] || "bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-400"
      }`}
    >
      {Icon && <Icon size={12} aria-hidden="true" />}
      {String(value).replaceAll("_", " ")}
    </span>
  );
}
