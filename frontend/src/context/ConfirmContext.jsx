import { createContext, useCallback, useContext, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, HelpCircle } from "lucide-react";
import Button from "../components/ui/Button";

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const [visible, setVisible] = useState(false);
  const resolveRef = useRef(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({
        title: options?.title || "Konfirmasi",
        message: options?.message || "Apakah Anda yakin?",
        confirmText: options?.confirmText || "Ya, Lanjutkan",
        cancelText: options?.cancelText || "Batal",
        tone: options?.tone || "danger",
      });
      // Mount first, then flip visible on next frame so the enter transition runs.
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    });
  }, []);

  const settle = useCallback((result) => {
    setVisible(false);
    setTimeout(() => {
      setState(null);
      resolveRef.current?.(result);
      resolveRef.current = null;
    }, 150);
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state &&
        createPortal(
          <div
            className={`fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/60 p-4 transition-opacity duration-150 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => settle(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-xl dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] transition-all duration-150 ${
                visible ? "scale-100 opacity-100" : "scale-90 opacity-0"
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <span
                  className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full ${
                    state.tone === "danger"
                      ? "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                      : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  }`}
                >
                  <span
                    className={`flex h-full w-full items-center justify-center rounded-full transition-transform duration-300 ${
                      visible ? "scale-100" : "scale-0"
                    }`}
                  >
                    {state.tone === "danger" ? (
                      <AlertTriangle size={22} aria-hidden="true" />
                    ) : (
                      <HelpCircle size={22} aria-hidden="true" />
                    )}
                  </span>
                </span>
                <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">{state.title}</h4>
                <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">{state.message}</p>
              </div>

              <div className="mt-5 flex justify-center gap-2">
                <Button variant="secondary" className="flex-1" onClick={() => settle(false)}>
                  {state.cancelText}
                </Button>
                <Button
                  variant={state.tone === "danger" ? "danger" : "primary"}
                  className="flex-1"
                  onClick={() => settle(true)}
                >
                  {state.confirmText}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within ConfirmProvider");
  }
  return ctx;
}
