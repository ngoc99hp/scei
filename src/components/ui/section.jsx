export function Section({ className = "", ...props }) {
  return (
    <section className={`py-16 ${className}`} {...props} />
  );
}
