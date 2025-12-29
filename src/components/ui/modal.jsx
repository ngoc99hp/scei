import { createPortal } from "react-dom";

export function Modal({ open, onClose, children }) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-card p-6 shadow-lg">
        {children}
      </div>
    </div>,
    document.body
  );
}

export const ModalHeader = ({ title, description }) => (
  <div className="mb-4">
    <h2 className="text-lg font-semibold">{title}</h2>
    {description && (
      <p className="text-sm text-muted-foreground">
        {description}
      </p>
    )}
  </div>
);

export const ModalFooter = ({ children }) => (
  <div className="mt-6 flex justify-end gap-2">
    {children}
  </div>
);
