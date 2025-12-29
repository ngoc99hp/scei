export function Card({ className = "", ...props }) {
  return (
    <div
      className={`rounded-xl border border-border bg-card text-card-foreground shadow-sm ${className}`}
      {...props}
    />
  );
}

export function CardHeader({ className = "", ...props }) {
  return (
    <div
      className={`border-b border-border px-6 py-4 ${className}`}
      {...props}
    />
  );
}
