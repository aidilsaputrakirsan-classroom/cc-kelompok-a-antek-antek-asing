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
    primary: "bg-slate-900 text-white hover:bg-slate-800",
    secondary: "border border-slate-300 bg-white text-slate-800 hover:bg-slate-100",
    danger: "bg-rose-600 text-white hover:bg-rose-500",
    ghost: "text-slate-700 hover:bg-slate-100",
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
