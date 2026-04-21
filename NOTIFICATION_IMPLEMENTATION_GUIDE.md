# 📢 Panduan Implementasi Notifikasi - DOKUMENTASI LENGKAP

## Overview
Sistem notifikasi terdiri dari dua jenis:
1. **Backend Notifications** - Disimpan di database, persistent
2. **Toast Notifications** - In-app alerts, temporary, real-time feedback

## Komponen & Hooks yang Tersedia

### 1. **NotificationBell** (`NotificationBell.jsx`)
Komponen UI yang menampilkan ikon bell dengan badge unread count dan dropdown panel.

**Features:**
- Ikon bell dengan auto-badge untuk unread count
- Dropdown panel dengan list notifikasi
- Auto-refresh setiap 5 detik (configurable)
- Mark as read functionality (click pada notifikasi)
- Mark all as read button
- Infinite scroll untuk load more
- Responsive design

**Usage:**
```jsx
import NotificationBell from "../components/NotificationBell";

export default function Header() {
  return <NotificationBell />;
}
```

### 2. **NotificationItem** (`NotificationItem.jsx`)
Komponen untuk menampilkan individual notification item dengan styling berdasarkan tipe.

**Features:**
- Icon dan color berdasarkan notification type
- Timestamp formatting (5m lalu, 1h lalu, dll)
- Expandable untuk message yang panjang
- Visual indicator untuk unread notifications
- Hover effects dan transitions

### 3. **useNotifications** Hook (`useNotifications.js`)
Hook utama untuk mengelola state notifikasi dengan auto-polling.

**Parameters:**
```javascript
useNotifications(
  autoRefresh = true,    // Enable auto-polling
  pollInterval = 5000    // Polling interval dalam ms
)
```

**Returns:**
```javascript
{
  notifications,      // Array<Notification> - daftar notifikasi
  unreadCount,        // number - jumlah unread
  total,              // number - total notifikasi
  loading,            // boolean - sedang loading
  error,              // string | null - error message
  hasMore,            // boolean - ada notifikasi lagi
  markAsRead,         // (id: number) => Promise<void>
  markAllAsRead,      // () => Promise<void>
  loadMore,           // () => void - load 20 notifikasi berikutnya
  refresh,            // () => Promise<void> - force refresh
}
```

### 4. **useToast** Hook (`useToast.js`)
Hook untuk toast notifications (real-time feedback).

**Returns:**
```javascript
{
  toasts,             // Array<Toast> - daftar toast yang ditampilkan
  addToast,           // (msg, type, duration) => id
  removeToast,        // (id) => void
  success,            // (msg, duration = 3000) => id
  error,              // (msg, duration = 3000) => id
  warning,            // (msg, duration = 3000) => id
  info,               // (msg, duration = 3000) => id
}
```

### 5. **ToastContainer** (`ToastContainer.jsx`)
Komponen untuk menampilkan toast notifications di pojok kanan atas.

**Props:**
```javascript
{
  toasts,           // Array<Toast> - dari useToast hook
  removeToast,      // function - untuk close toast
}
```

### 6. **notificationService** (`notification-service.js`)
Service layer untuk API calls ke backend.

**Methods:**
```javascript
notificationService.getNotifications(skip, limit)    // GET /notifications
notificationService.markAsRead(notificationId)       // PUT /notifications/{id}/read
notificationService.markAllAsRead()                  // PUT /notifications/read-all
```

## Implementasi Step-by-Step

### LANGKAH 1: Update App.jsx untuk ToastContainer
Sudah dilakukan! File App.jsx sudah diupdate untuk include ToastContainer.

### LANGKAH 2: Tambahkan NotificationBell ke Navbar/Header
Sudah ada di `AppShell.jsx` line ~280, tapi pastikan import-nya ada:

```jsx
// Di AppShell.jsx
import NotificationBell from "../components/NotificationBell";

// Di JSX (inside header)
<header className="...">
  {/* ... other elements ... */}
  <NotificationBell />
  {/* ... */}
</header>
```

### LANGKAH 3: Gunakan Toast di Components

#### Example 1: Di Form Submission
```jsx
import { useToast } from "../context/useToast";
import { useNavigate } from "react-router-dom";

export default function CreateTicketForm() {
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      const response = await apiClient.post("/tickets", formData);
      success("✓ Ticket berhasil dibuat!");
      navigate(`/employee/tickets/${response.data.id}`);
    } catch (err) {
      error("✕ Gagal membuat ticket: " + err.response?.data?.detail);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

#### Example 2: Di Delete Action
```jsx
const { warning, success, error } = useToast();

const handleDelete = async (itemId) => {
  const confirmed = window.confirm("Yakin ingin menghapus?");
  if (!confirmed) return;

  try {
    await apiClient.delete(`/tickets/${itemId}`);
    success("Item berhasil dihapus!");
    refetch();
  } catch (err) {
    error("Gagal menghapus item!");
  }
};
```

#### Example 3: Di Copy to Clipboard
```jsx
const { success } = useToast();

const handleCopy = (text) => {
  navigator.clipboard.writeText(text);
  success("✓ Copied to clipboard!");
};
```

### LANGKAH 4: Trigger Notifications dari Backend

Notifikasi dibuat otomatis oleh backend saat:
- Ticket dibuat, diupdate, ditugaskan, diselesaikan, ditutup
- User approval requests
- Admin actions

**Tidak perlu trigger manual dari frontend** - backend akan handle.

### LANGKAH 5: Advanced - Custom Polling Interval

Jika ada halaman yang memerlukan polling lebih sering:

```jsx
// Default 5 detik
const { notifications } = useNotifications(true, 5000);

// Polling setiap 2 detik
const { notifications } = useNotifications(true, 2000);

// Disable auto-polling, manual refresh
const { notifications, refresh } = useNotifications(false, 0);

useEffect(() => {
  refresh(); // Call manually when needed
}, [refresh]);
```

## Notification Types & Icons

| Type | Label | Icon | Color |
|------|-------|------|-------|
| `ticket_created` | Ticket Dibuat | 📋 | Blue |
| `ticket_updated` | Ticket Diperbarui | ✏️ | Amber |
| `ticket_assigned` | Ticket Ditugaskan | 👤 | Purple |
| `ticket_resolved` | Ticket Diselesaikan | ✓ | Green |
| `ticket_closed` | Ticket Ditutup | ⊘ | Gray |
| `approval_requested` | Persetujuan Diperlukan | ⓘ | Indigo |
| `user_approved` | Pengguna Disetujui | ✓ | Green |
| `user_rejected` | Pengguna Ditolak | ✕ | Red |

## Toast Notification Types

### Success (Hijau)
```javascript
const { success } = useToast();

// Auto-close 3s (default)
success("Operasi berhasil!");

// Custom duration
success("Data tersimpan!", 5000);

// Manual close
success("Processing...", 0);
```

### Error (Merah)
```javascript
const { error } = useToast();

error("Terjadi kesalahan!");
error("Email sudah terdaftar!", 4000);
```

### Warning (Amber)
```javascript
const { warning } = useToast();

warning("Perhatian: Data akan dihapus permanen!");
```

### Info (Biru)
```javascript
const { info } = useToast();

info("Proses sedang berlangsung...", 0);
// Manually close: removeToast(id)
```

## API Endpoints Reference

### GET /notifications
Mendapatkan list notifikasi dengan pagination.

**Query Params:**
- `skip`: number (default: 0) - offset
- `limit`: number (default: 20) - items per page

**Response:**
```json
{
  "unread_count": 5,
  "total": 42,
  "items": [
    {
      "id": 1,
      "user_id": 10,
      "title": "Support Ticket #123",
      "message": "Your ticket has been assigned to IT Support",
      "type": "ticket_assigned",
      "reference_id": 123,
      "is_read": false,
      "created_at": "2024-04-21T10:30:00Z"
    }
  ]
}
```

### PUT /notifications/{notif_id}/read
Tandai satu notifikasi sebagai dibaca.

**Response:**
```json
{
  "message": "Notifikasi ditandai sudah dibaca"
}
```

### PUT /notifications/read-all
Tandai semua notifikasi user sebagai dibaca.

**Response:**
```json
{
  "message": "5 notifikasi ditandai sudah dibaca"
}
```

## Best Practices

✅ **DO:**
- Gunakan Toast untuk real-time feedback (form results, deletions)
- Gunakan Backend Notifications untuk persistent events
- Handle errors gracefully dengan try-catch
- Disable polling saat user tidak active untuk reduce server load
- Set appropriate durations (3s untuk success/error, 0 untuk manual close)

❌ **DON'T:**
- Jangan spam toast notifications
- Jangan polling terlalu sering (< 1s) untuk reduce server load
- Jangan forget to cleanup subscriptions
- Jangan trigger notifications untuk setiap keystroke
- Jangan show both toast dan notification bell untuk same action

## Real-World Examples

### Example 1: Ticket Lifecycle with Notifications
```jsx
export default function TicketDetailPage() {
  const { success, error } = useToast();
  const { notifications, markAsRead } = useNotifications();

  // When user sees a ticket update notification, mark it as read
  useEffect(() => {
    notifications
      .filter(n => n.type === 'ticket_updated' && !n.is_read)
      .forEach(n => markAsRead(n.id));
  }, [notifications, markAsRead]);

  const handleStatusChange = async (newStatus) => {
    try {
      await updateTicket({ status: newStatus });
      success(`Status changed to ${newStatus}`);
      // Backend akan auto-create notification untuk assigned user
    } catch (err) {
      error("Failed to update ticket");
    }
  };

  return (
    <div>
      <TicketInfo />
      <StatusButtons onStatusChange={handleStatusChange} />
    </div>
  );
}
```

### Example 2: Admin Approval with Toast
```jsx
export default function PendingUserCard({ user }) {
  const { success, error, warning } = useToast();

  const handleApprove = async () => {
    try {
      await approveUser(user.id);
      success(`User ${user.name} approved!`);
      // Backend akan send notification ke user
    } catch (err) {
      error("Failed to approve user");
    }
  };

  const handleReject = async (reason) => {
    const confirmed = window.confirm("Reject user?");
    if (!confirmed) return warning("Action cancelled");

    try {
      await rejectUser(user.id, { reason });
      success("User rejected");
    } catch (err) {
      error("Failed to reject user");
    }
  };

  return (
    <div>
      <button onClick={handleApprove} className="btn btn-success">
        Approve
      </button>
      <button onClick={handleReject} className="btn btn-danger">
        Reject
      </button>
    </div>
  );
}
```

### Example 3: Bulk Operations with Progress
```jsx
const { info, success, error } = useToast();

const handleBulkMarkAsRead = async (notificationIds) => {
  const toastId = info("Processing... 0%", 0);
  
  try {
    for (let i = 0; i < notificationIds.length; i++) {
      await markAsRead(notificationIds[i]);
      // Update progress
      const progress = Math.round(((i + 1) / notificationIds.length) * 100);
      // Note: toasts tidak support update, perlu custom component untuk advanced
    }
    
    removeToast(toastId);
    success(`${notificationIds.length} notifications marked as read`);
  } catch (err) {
    error("Failed to process notifications");
  }
};
```

## Troubleshooting Guide

### 🚨 Notifikasi tidak muncul di NotificationBell
**Solution:**
1. Verify API endpoint working: `curl http://localhost:8000/notifications -H "Authorization: Bearer TOKEN"`
2. Check browser console untuk error
3. Verify localStorage punya valid token
4. Check network tab - request harus ada

### 🚨 Toast tidak muncul
**Solution:**
1. Pastikan ToastContainer di App.jsx
2. Cek props `toasts` dan `removeToast` passed correctly
3. Verify z-index tidak tertutup element lain
4. Try in incognito mode (clear cache)

### 🚨 Auto-polling tidak refresh
**Solution:**
1. Default interval 5 detik - mungkin perlu lebih sering
2. Check network tab apakah request terkirim
3. Disable browser cache: DevTools > Network > Disable cache
4. Verify backend returning data

### 🚨 High server load dari polling
**Solution:**
1. Increase poll interval: `useNotifications(true, 10000)` (10 detik)
2. Disable polling on certain pages: `useNotifications(false, 0)`
3. Implement WebSocket untuk real-time (future improvement)

## File Structure
```
frontend/src/
├── components/
│   ├── NotificationBell.jsx        ← Bell icon + dropdown
│   ├── NotificationItem.jsx        ← Single notification display
│   ├── NotificationCenter.jsx      ← Legacy (still available)
│   └── ToastContainer.jsx          ← Toast display
├── context/
│   ├── NotificationContext.jsx     ← Legacy (still available)
│   └── useToast.js                 ← Toast hook
├── hooks/
│   ├── useNotification.js          ← Legacy (still available)
│   └── useNotifications.js         ← New hook with backend
└── services/
    └── notification-service.js     ← API layer
```

## Testing Notifications

### Manual Test - Create Notification via CLI
```bash
curl -X POST http://localhost:8000/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "user_id": 1,
    "title": "Test Notification",
    "message": "This is a test",
    "type": "ticket_created",
    "reference_id": 123
  }'
```

### Test Toast in Console
```javascript
// Inject test
const { success, error, warning, info } = useToast();
success("Test success!");
error("Test error!");
warning("Test warning!");
info("Test info!");
```

---

**Documentation Version:** 1.0.0
**Last Updated:** April 21, 2024
**Backend Version:** 1.0.0
