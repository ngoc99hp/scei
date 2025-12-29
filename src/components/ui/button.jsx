import Link from "next/link"

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
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline:
      "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    destructive:
      "bg-destructive text-white hover:bg-destructive/90",
  }

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4",
    lg: "h-12 px-6 text-lg",
  }

  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`

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