const styles = {
  open: "bg-slate-200 text-slate-700",
  in_progress: "bg-amber-100 text-amber-800",
  resolved: "bg-emerald-100 text-emerald-800",
  closed: "bg-zinc-200 text-zinc-700",
  low: "bg-slate-200 text-slate-700",
  medium: "bg-sky-100 text-sky-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-rose-100 text-rose-800",
};

export default function StatusBadge({ value }) {
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${styles[value] || "bg-slate-200 text-slate-700"}`}>
      {String(value).replace("_", " ")}
    </span>
  );
}
