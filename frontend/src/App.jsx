import { useState, useEffect, useCallback } from "react"
import Toast from "./components/Toast"
import Header from "./components/Header"
import SearchBar from "./components/SearchBar"
import ItemForm from "./components/ItemForm"
import ItemList from "./components/ItemList"
import LoginPage from "./components/LoginPage"
import {
  fetchItems, createItem, updateItem, deleteItem,
  checkHealth, login, register, setToken, clearToken,
} from "./services/api"

function App() {
  // ==================== AUTH STATE ====================
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // ==================== APP STATE ====================
  const [items, setItems] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  
  // ==================== TOAST STATE ====================
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState("success")
  
  // ==================== LOADING STATE (per-operation) ====================
  const [isSubmittingItem, setIsSubmittingItem] = useState(false)
  const [deletingItemId, setDeletingItemId] = useState(null)

  // ==================== LOAD DATA ====================
  const loadItems = useCallback(async (search = "") => {
    setLoading(true)
    try {
      const data = await fetchItems(search)
      setItems(data.items)
      setTotalItems(data.total)
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        handleLogout()
      }
      console.error("Error loading items:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkHealth().then(setIsConnected)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadItems()
    }
  }, [isAuthenticated, loadItems])

  // ==================== TOAST HELPER ====================
  const showToast = (message, type = "success") => {
    setToastMessage(message)
    setToastType(type)
  }

  // ==================== AUTH HANDLERS ====================

  const handleLogin = async (email, password) => {
    const data = await login(email, password)
    setUser(data.user)
    setIsAuthenticated(true)
  }

  const handleRegister = async (userData) => {
    // Register lalu otomatis login
    await register(userData)
    await handleLogin(userData.email, userData.password)
  }

  const handleLogout = () => {
    clearToken()
    setUser(null)
    setIsAuthenticated(false)
    setItems([])
    setTotalItems(0)
    setEditingItem(null)
    setSearchQuery("")
  }

  // ==================== ITEM HANDLERS ====================

  const handleSubmit = async (itemData, editId) => {
    setIsSubmittingItem(true)
    try {
      if (editId) {
        await updateItem(editId, itemData)
        showToast("✏️ Item berhasil diperbarui", "success")
        setEditingItem(null)
      } else {
        await createItem(itemData)
        showToast("✅ Item berhasil ditambahkan", "success")
      }
      await loadItems(searchQuery)
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        handleLogout()
      } else {
        showToast(`❌ ${err.message}`, "error")
      }
    } finally {
      setIsSubmittingItem(false)
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (id) => {
    const item = items.find((i) => i.id === id)
    if (!window.confirm(`Yakin ingin menghapus "${item?.name}"?`)) return
    setDeletingItemId(id)
    try {
      await deleteItem(id)
      showToast("🗑️ Item berhasil dihapus", "success")
      if (editingItem?.id === id) setEditingItem(null)
      await loadItems(searchQuery)
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        handleLogout()
      } else {
        showToast(`❌ ${err.message}`, "error")
      }
    } finally {
      setDeletingItemId(null)
    }
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    loadItems(query)
  }

  // ==================== RENDER ====================

  // Jika belum login, tampilkan login page
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} onRegister={handleRegister} />
  }

  // Jika sudah login, tampilkan main app
  return (
    <div style={styles.app}>
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage("")}
      />
      <div style={styles.container}>
        <Header
          totalItems={totalItems}
          isConnected={isConnected}
          user={user}
          onLogout={handleLogout}
        />
        <ItemForm
          onSubmit={handleSubmit}
          editingItem={editingItem}
          onCancelEdit={() => setEditingItem(null)}
          loading={isSubmittingItem}
        />
        <SearchBar onSearch={handleSearch} />
        <ItemList
          items={items}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
          deletingItemId={deletingItemId}
        />
      </div>
    </div>
  )
}

const styles = {
  app: {
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    padding: "2rem",
    fontFamily: "'Segoe UI', Arial, sans-serif",
  },
  container: { maxWidth: "900px", margin: "0 auto" },
}

export default App
