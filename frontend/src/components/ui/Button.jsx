export default function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  ...props
}) {
  const variantStyles = {
    primary: "bg-[#2592ea] text-white hover:bg-blue-500 dark:bg-[#2592ea] dark:hover:bg-blue-500 shadow-sm shadow-blue-500/10 active:scale-[0.98] transition-all duration-200",
    secondary: "border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-[0.98] transition-all duration-200",
    danger: "bg-rose-600 dark:bg-rose-700 text-white hover:bg-rose-500 dark:hover:bg-rose-600 active:scale-[0.98] transition-all duration-200",
    ghost: "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98] transition-all duration-200",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-2.5 text-sm",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
