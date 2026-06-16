import React, { createContext, useContext, useState, useCallback } from "react";

export const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((messageOrObj, type = "info", duration = 3000) => {
    const id = Date.now();
    let message = "";
    let toastType = type;
    let toastDuration = duration;

    if (typeof messageOrObj === "object" && messageOrObj !== null) {
      message = messageOrObj.message || "";
      toastType = messageOrObj.type || type;
      toastDuration = messageOrObj.duration !== undefined ? messageOrObj.duration : duration;
    } else {
      message = messageOrObj;
    }

    const toast = {
      id,
      message,
      type: toastType,
      timestamp: new Date(),
    };

    setToasts((prev) => [toast, ...prev]);

    if (toastDuration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, toastDuration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = {
    toasts,
    addToast,
    removeToast,
    success: useCallback((msg, dur) => addToast(msg, "success", dur), [addToast]),
    error: useCallback((msg, dur) => addToast(msg, "error", dur), [addToast]),
    warning: useCallback((msg, dur) => addToast(msg, "warning", dur), [addToast]),
    info: useCallback((msg, dur) => addToast(msg, "info", dur), [addToast]),
  };

  return React.createElement(
    ToastContext.Provider,
    { value: value },
    children
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
