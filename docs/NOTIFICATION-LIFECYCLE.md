# Notification Lifecycle & Business Logic

Dokumentasi ini menjelaskan bagaimana sistem notifikasi bekerja, lifecycle notifikasi, dan logika terbaik untuk penanganan notifikasi di aplikasi.

## 📋 Pertanyaan: Apakah Notifikasi Hilang Sebelum Di-Resolve?

**Jawaban: TIDAK. Notifikasi tetap ada di database sampai di-resolve.**

Notifikasi adalah event atau aksi yang terjadi dan dicatat **permanen** di database. Berbeda dengan toast (ephemeral notification), notifikasi disimpan untuk history dan audit trail.

---

## 🔄 Lifecycle Notifikasi

### Status Notifikasi dalam Database

```
┌─────────────────────────────────────────────────────────┐
│              NOTIFICATION LIFECYCLE                      │
└─────────────────────────────────────────────────────────┘

1. CREATED
   └─> Notifikasi dibuat ketika event tertentu terjadi
       Example: User membuat ticket, ticket di-assign, ticket di-resolve
       Status: is_read = false
       Stored: ✓ Di database
       Visible: ✓ Tampil di bell icon

2. READ
   └─> User melihat/membaca notifikasi
       User klik notifikasi atau klik "mark as read"
       Status: is_read = true
       Stored: ✓ Tetap di database
       Visible: ✓ Masih visible, hanya badge berubah

3. RESOLVED (optional)
   └─> Notifikasi sudah ditindaklanjuti/selesai
       (Belum diimplementasi - lihat setelah point 5)
       Status: resolved = true atau archived
       Stored: ✓ Di database (permanent record)
       Visible: ? Bisa hidden atau archive

┌─────────────────────────────────────────────────────────┐
│ PENTING: Notifikasi TIDAK pernah hilang dari database   │
│ Hanya status yang berubah (read, archived, resolved)    │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Current Implementation (Fase 1)

Saat ini sistem notifikasi hanya punya **2 status**:

| Status | Field | Nilai | Meaning |
|--------|-------|-------|---------|
| Unread | `is_read` | `false` | Belum dibaca user |
| Read   | `is_read` | `true` | Sudah dibaca user |

### Flow Saat Ini:

```
1. Event Terjadi (ticket_created, ticket_assigned, dll)
   ↓
2. Backend CREATE notification dengan is_read=false
   ↓
3. Frontend POLL /notifications setiap 5 detik
   ↓
4. User LIHAT notifikasi di bell dropdown
   ↓
5. User KLIK notifikasi
   ├─> Mark as read: PUT /notifications/{id}/read (is_read = true)
   ├─> Navigate ke ticket detail page
   └─> Dropdown closes
   ↓
6. Notifikasi TETAP ada di database (dengan is_read=true)
   ├─> Tidak di-delete
   ├─> Masih bisa di-filter/di-query
   └─> Permanent record untuk audit
```

---

## ✅ Logika Terbaik (Best Practice)

### 1. **Jangan Di-Delete, Gunakan Flag Status**
```
BAIK ❌ DELETE FROM notifications WHERE id=123;
BAIK ✅ UPDATE notifications SET is_read=true WHERE id=123;
BAIK ✅ UPDATE notifications SET resolved=true WHERE id=123;
```

### 2. **Implementasi Status Lifecycle yang Komprehensif**
```javascript
// Recommended notification states:
{
  id: "notif_123",
  title: "Ticket Dibuat",
  message: "Ticket 'Bug login' dibuat oleh Admin",
  type: "ticket_created",
  reference_id: 45,
  
  // Status fields
  is_read: false,      // User sudah melihat?
  is_resolved: false,  // Issue sudah ditindaklanjuti?
  is_archived: false,  // Disembunyikan dari view?
  
  // Timestamps
  created_at: "2026-04-21T10:00:00",
  read_at: null,         // Kapan di-baca?
  resolved_at: null,     // Kapan di-resolve?
  
  // Metadata
  created_by: "system",
  read_by: "employee_1",
  resolved_by: null,
}
```

### 3. **Query Patterns - Jangan Show Deleted**
```sql
-- BAIK: Ambil unread notifications saja
SELECT * FROM notifications 
WHERE user_id = $1 
  AND is_read = false 
  AND is_archived = false
ORDER BY created_at DESC;

-- BAIK: Ambil semua, tapi user bisa filter
SELECT * FROM notifications 
WHERE user_id = $1 
  AND is_archived = false
ORDER BY created_at DESC;

-- BURUK: Delete dari database
DELETE FROM notifications WHERE user_id = $1;
```

---

## 🎯 Recommended Phase 2 Enhancements

Untuk next phase, recommend implementasi ini:

### A. **Resolved/Action Status**
```
- Button "Mark as Resolved" di notification item
- Endpoint: PUT /notifications/{id}/resolve
- Meaning: Admin/user sudah action notifikasi, close case
- Visual: Grey out atau move to archive
```

### B. **Archive Feature**
```
- Button "Archive" untuk hide dari main view
- Endpoint: PUT /notifications/{id}/archive
- Meaning: Hide dari main view, tapi tetap di database
- Visual: Move to "Archive" tab
```

### C. **Filter & Search**
```
- Filter: Unread | Read | Resolved | Archived
- Search: By title, message, date range
- Sort: Newest first, oldest first, by status
```

### D. **Notification History**
```
- View: Show timeline notif untuk specific ticket
- Example: Klik ticket → lihat semua notif related
- Benefit: Audit trail, understand ticket lifecycle
```

---

## 💾 Database Schema Recommendation

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Content
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR NOT NULL,  -- ticket_created, ticket_assigned, dll
  reference_id INT,       -- Ticket ID (nullable)
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP,
  resolved_at TIMESTAMP,
  
  -- Audit
  created_by VARCHAR,
  resolved_by VARCHAR,
  
  -- Soft delete (jika diperlukan)
  deleted_at TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX (user_id, created_at),
  INDEX (user_id, is_read)
);
```

---

## 🚀 Current Features Summary

| Feature | Status | Endpoint |
|---------|--------|----------|
| Get notifications | ✅ Implemented | GET /notifications?skip=0&limit=20 |
| Mark single as read | ✅ Implemented | PUT /notifications/{id}/read |
| Mark all as read | ✅ Implemented | PUT /notifications/read-all |
| Archive notif | ⏳ Future | PUT /notifications/{id}/archive |
| Resolve notif | ⏳ Future | PUT /notifications/{id}/resolve |
| Delete notif | ⏳ Future (avoid) | - |
| Search/filter | ⏳ Future | GET /notifications?filter=read&... |

---

## 🎓 Key Takeaways

1. **Notifikasi = Permanent Record**
   - Disimpan di database selamanya (atau sampai di-delete manually)
   - NOT ephemeral seperti toast

2. **Gunakan Status Flags**
   - `is_read` = User lihat?
   - `is_resolved` = Issue handled?
   - `is_archived` = Hidden dari view?

3. **Jangan Delete Automatic**
   - Archive atau mark resolved instead
   - Maintain audit trail

4. **Query Smart**
   - Filter by `is_archived = false` di SELECT
   - Allow user filter/search sesuai kebutuhan

5. **UI Considerations**
   - Unread: Highlighted badge, bold text
   - Read: Normal style
   - Resolved: Green checkmark / grey out
   - Archived: Hidden by default, show in separate tab

---

## 📝 Notes untuk Development

- Current implementation sudah good untuk Phase 1
- `is_read` flag cukup untuk MVP
- Implement archive/resolve di Phase 2 based on user feedback
- Don't over-engineer, add features when needed
- Maintain database integrity - never delete, only update status
