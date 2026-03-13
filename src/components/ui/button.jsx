// ✅ SPRINT 1 FIX — Thêm variant cho button trên nền tối

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  asChild = false,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:pointer-events-none"

  const variants = {
    // Dùng trên nền sáng (trang thường)
    primary:     "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary:   "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline:     "border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
    ghost:       "hover:bg-accent hover:text-accent-foreground",
    destructive: "bg-destructive text-white hover:bg-destructive/90",

    // ✅ Dùng trên nền tối (Hero gradient, CTA section)
    "outline-inverse":
      "border border-white/40 bg-transparent text-white hover:bg-white/10 hover:border-white/60",
    "primary-inverse":
      "bg-white text-primary hover:bg-white/90",
  }

  const sizes = {
    sm:   "h-8 px-3 text-sm",
    md:   "h-10 px-4",
    lg:   "h-12 px-6 text-lg",
    icon: "h-10 w-10",
  }

  const classes = `${base} ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.md} ${className}`

  if (asChild) {
    return props.children
  }

  return (
    <button
      className={classes}
      {...props}
    />
  )
}