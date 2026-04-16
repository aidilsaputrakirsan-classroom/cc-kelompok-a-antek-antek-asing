export default function Card({ title, subtitle, children, className = "" }) {
  return (
    <section className={`rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm dark:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.3)] ${className}`}>
      {(title || subtitle) && (
        <header className="mb-3">
          {title && <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>}
          {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
