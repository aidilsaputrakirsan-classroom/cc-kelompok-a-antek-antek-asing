export default function Input({ label, error, className = "", ...props }) {
  return (
    <label className="block text-sm text-slate-700 dark:text-slate-300 transition-colors duration-500">
      {label}
      <input
        {...props}
        className={`mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none ring-blue-300 dark:ring-blue-700 focus:ring transition-all duration-300 ${className}`}
      />
      {error && <span className="mt-1 block text-xs text-rose-600 dark:text-rose-400 transition-colors duration-500">{error}</span>}
    </label>
  );
}
