export function Badge({ variant = "default", className = "", ...props }) {
  const variants = {
    default: "bg-muted text-muted-foreground",
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "border border-border",
    success: "bg-green-600 text-white",
    warning: "bg-yellow-500 text-black",
    danger: "bg-destructive text-white",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
