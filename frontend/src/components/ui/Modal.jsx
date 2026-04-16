import { createPortal } from "react-dom";
import Button from "./Button";

export default function Modal({ open, title, children, onClose, onConfirm, confirmText = "Save" }) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/35 dark:bg-slate-900/60 p-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-lg dark:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="text-slate-700 dark:text-slate-300">{children}</div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          {onConfirm && <Button onClick={onConfirm}>{confirmText}</Button>}
        </div>
      </div>
    </div>,
    document.body
  );
}
