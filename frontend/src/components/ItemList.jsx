import ItemCard from "./ItemCard"

function ItemList({ items, onEdit, onDelete, loading, deletingItemId }) {
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinnerOuter}>
          <div style={styles.spinnerInner}></div>
        </div>
        <p style={styles.loadingText}>Memuat data...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div style={styles.empty}>
        <p style={styles.emptyIcon}>📭</p>
        <p style={styles.emptyText}>Belum ada item.</p>
        <p style={styles.emptyHint}>
          Gunakan form di atas untuk menambahkan item pertama.
        </p>
      </div>
    )
  }

  return (
    <div style={styles.grid}>
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={deletingItemId === item.id}
        />
      ))}
    </div>
  )
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "1rem",
  },
  loadingContainer: {
    textAlign: "center",
    padding: "3rem 2rem",
    backgroundColor: "#f8f9fa",
    borderRadius: "12px",
    border: "2px dashed #ddd",
  },
  spinnerOuter: {
    display: "inline-block",
    width: "50px",
    height: "50px",
    marginBottom: "1rem",
    position: "relative",
  },
  spinnerInner: {
    width: "100%",
    height: "100%",
    border: "4px solid #ddd",
    borderTop: "4px solid #548235",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    fontSize: "1.1rem",
    color: "#888",
    margin: 0,
  },
  empty: {
    textAlign: "center",
    padding: "3rem",
    backgroundColor: "#f8f9fa",
    borderRadius: "12px",
    border: "2px dashed #ddd",
  },
  emptyIcon: {
    fontSize: "3rem",
    margin: "0 0 0.5rem 0",
  },
  emptyText: {
    fontSize: "1.1rem",
    color: "#555",
    margin: "0 0 0.25rem 0",
  },
  emptyHint: {
    fontSize: "0.9rem",
    color: "#888",
    margin: 0,
  },
}

export default ItemList