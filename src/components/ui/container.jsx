export function Container({ className = "", ...props }) {
  return (
    <div
      className={`mx-auto max-w-7xl px-4 ${className}`}
      {...props}
    />
  );
}
