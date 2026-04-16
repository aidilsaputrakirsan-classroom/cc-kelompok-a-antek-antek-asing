// NotificationCenter - Usage Guide
// ================================

// 1. Import the useNotification hook in any component
// import { useNotification } from "../hooks/useNotification";

// 2. Use the hook in your component
// const { notifications, addNotification, removeNotification, clearAll } = useNotification();

// 3. Examples of usage:

// SUCCESS NOTIFICATION
// addNotification("Ticket created successfully!", "success", 4000);
// Auto-closes after 4 seconds

// ERROR NOTIFICATION
// addNotification("Failed to update ticket", "error", 5000);
// Auto-closes after 5 seconds

// WARNING NOTIFICATION
// addNotification("Your session will expire soon", "warning", 6000);
// Auto-closes after 6 seconds

// INFO NOTIFICATION
// addNotification("New ticket assigned to you", "info", 3000);
// Auto-closes after 3 seconds

// PERSISTENT NOTIFICATION (No auto-close)
// const id = addNotification("Please confirm this action", "info", 0);
// Then manually close it with:
// removeNotification(id);

// EXAMPLE IN A COMPONENT:
/*
import { useNotification } from "../hooks/useNotification";

function MyComponent() {
  const { addNotification } = useNotification();

  const handleCreateTicket = async () => {
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        body: JSON.stringify(ticketData),
      });
      
      if (response.ok) {
        addNotification("Ticket created successfully!", "success", 4000);
      }
    } catch (error) {
      addNotification(error.message || "Failed to create ticket", "error", 5000);
    }
  };

  return <button onClick={handleCreateTicket}>Create Ticket</button>;
}
*/

// NOTIFICATION TYPES:
// - "success": Green background, checkmark icon
// - "error": Red background, X icon
// - "warning": Amber background, warning icon
// - "info": Blue background, info icon

// NotificationCenter Component:
// - Appears in the AppShell header (left of profile)
// - Shows bell icon with unread count badge
// - Click to open notification dropdown
// - Shows up to 9+ in badge for unread count
// - Displays timestamp for each notification
// - Shows full notification history with timestamps
// - Clear all button to dismiss all notifications
// - Individual dismiss buttons for each notification
