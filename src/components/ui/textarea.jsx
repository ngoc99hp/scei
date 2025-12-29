export function Textarea(props) {
  return (
    <textarea
      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      {...props}
    />
  );
}
