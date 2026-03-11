import { useState, useEffect, useCallback } from "react"
import Header from "./components/Header"
import SearchBar from "./components/SearchBar"
import SortBar from "./components/SortBar"
import ItemForm from "./components/ItemForm"
import ItemList from "./components/ItemList"
import Toast from "./components/Toast"
import { fetchItems, createItem, updateItem, deleteItem, checkHealth } from "./services/api"

function App() {
  // ==================== STATE ====================
  const [items, setItems] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("")
  const [toast, setToast] = useState({ message: "", type: "success" })

  const showToast = (message, type = "success") => {
    setToast({ message, type })
  }

  // ==================== UTILITY FUNCTIONS ====================
  const sortItems = (itemsToSort, sortByValue) => {
    if (!sortByValue) return itemsToSort

    const sorted = [...itemsToSort]
    if (sortByValue === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortByValue === "price") {
      sorted.sort((a, b) => a.price - b.price)
    } else if (sortByValue === "created_at") {
      sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    }
    return sorted
  }

  // ==================== LOAD DATA ====================
  const loadItems = useCallback(async (search = "", sort = "") => {
    setLoading(true)
    try {
      const data = await fetchItems(search)
      const sortedItems = sortItems(data.items, sort)
      setItems(sortedItems)
      setTotalItems(data.total)
    } catch (err) {
      console.error("Error loading items:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  // ==================== ON MOUNT ====================
  useEffect(() => {
    // Cek koneksi API
    checkHealth().then(setIsConnected)
    // Load items
    loadItems()
  }, [loadItems])

  // ==================== HANDLERS ====================

  const handleSubmit = async (itemData, editId) => {
    try {
      if (editId) {
        await updateItem(editId, itemData)
        setEditingItem(null)
        showToast("Item berhasil diperbarui!", "success")
      } else {
        await createItem(itemData)
        showToast("Item berhasil ditambahkan!", "success")
      }
      loadItems(searchQuery, sortBy)
    } catch (err) {
      showToast("Gagal menyimpan: " + err.message, "error")
      throw err
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    // Scroll ke atas ke form
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (id) => {
    const item = items.find((i) => i.id === id)
    if (!window.confirm(`Yakin ingin menghapus "${item?.name}"?`)) return

    try {
      await deleteItem(id)
      loadItems(searchQuery, sortBy)
      showToast(`"${item?.name}" berhasil dihapus!`, "success")
    } catch (err) {
      showToast("Gagal menghapus: " + err.message, "error")
    }
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    loadItems(query, sortBy)
  }

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy)
    loadItems(searchQuery, newSortBy)
  }

  const handleCancelEdit = () => {
    setEditingItem(null)
  }

  // ==================== RENDER ====================
  return (
    <div style={styles.app}>
      <div style={styles.container}>
        <Header totalItems={totalItems} isConnected={isConnected} />
        <ItemForm
          onSubmit={handleSubmit}
          editingItem={editingItem}
          onCancelEdit={handleCancelEdit}
        />
        <SearchBar onSearch={handleSearch} />
        <SortBar sortBy={sortBy} onSortChange={handleSortChange} />
        <ItemList
          items={items}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />
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
  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },
}

export default App