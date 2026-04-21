import { createPortal } from "react-dom";
import Button from "./Button";

export default function Modal({ open, title, children, onClose, onConfirm, confirmText = "Save", showCancel = true }) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/35 dark:bg-slate-900/60 p-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-lg dark:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h4>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="text-slate-700 dark:text-slate-300">{children}</div>
        {onConfirm && (
          <div className="mt-4 flex gap-2 justify-end">
            {showCancel && (
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
            )}
            <Button type="button" variant="primary" onClick={onConfirm}>
              {confirmText}
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}