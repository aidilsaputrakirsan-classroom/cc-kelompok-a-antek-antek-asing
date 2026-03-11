import { useEffect } from "react"

function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => {
      onClose()
    }, 3000)
    return () => clearTimeout(timer)
  }, [message, onClose])

  if (!message) return null

  const isSuccess = type === "success"

  return (
    <div style={{ ...styles.toast, ...(isSuccess ? styles.success : styles.error) }}>
      <span style={styles.icon}>{isSuccess ? "✅" : "❌"}</span>
      <span style={styles.message}>{message}</span>
      <button style={styles.closeBtn} onClick={onClose}>×</button>
    </div>
  )
}

const styles = {
  toast: {
    position: "fixed",
    bottom: "1.5rem",
    right: "1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    padding: "0.75rem 1.2rem",
    borderRadius: "10px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
    zIndex: 9999,
    minWidth: "260px",
    maxWidth: "380px",
    animation: "slideIn 0.3s ease",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    fontSize: "0.95rem",
    color: "#fff",
  },
  success: {
    backgroundColor: "#22c55e",
  },
  error: {
    backgroundColor: "#ef4444",
  },
  icon: {
    fontSize: "1.1rem",
    flexShrink: 0,
  },
  message: {
    flex: 1,
    lineHeight: 1.4,
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: "1.3rem",
    cursor: "pointer",
    lineHeight: 1,
    padding: "0 0.2rem",
    opacity: 0.8,
    flexShrink: 0,
  },
}

export default Toast