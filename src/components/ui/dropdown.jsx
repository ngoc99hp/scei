"use client"

import { useState, useRef, useEffect } from "react";

export function Dropdown({ trigger, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const close = (e) =>
      ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-popover shadow-md">
          {children}
        </div>
      )}
    </div>
  );
}

export const DropdownItem = ({ className = "", ...props }) => (
  <button
    className={`flex w-full items-center px-4 py-2 text-sm hover:bg-accent ${className}`}
    {...props}
  />
);