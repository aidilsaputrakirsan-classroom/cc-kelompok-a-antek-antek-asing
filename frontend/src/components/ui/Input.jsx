export default function Input({ label, error, className = "", ...props }) {
  return (
    <label className="block text-sm text-slate-700">
      {label}
      <input
        {...props}
        className={`mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-300 focus:ring ${className}`}
      />
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
    </label>
  );
}
