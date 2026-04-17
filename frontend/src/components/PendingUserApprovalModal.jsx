import { useState } from "react";
import { AlertCircle, Loader } from "lucide-react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import Input from "./ui/Input";

export default function PendingUserApprovalModal({
  user,
  isOpen,
  onClose,
  onApprove,
  departments = [],
  loading = false,
}) {
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState(null);

  const handleApprove = async () => {
    if (!selectedDepartment) {
      setError("Please select a department");
      return;
    }

    try {
      setError(null);
      console.log("Calling onApprove with:", user.id, selectedDepartment, notes);
      await onApprove(user.id, parseInt(selectedDepartment), notes);
      
      // Reset form
      setSelectedDepartment("");
      setNotes("");
      onClose();
    } catch (err) {
      console.error("Approve error:", err);
      setError(err.message || "Failed to approve user");
    }
  };

  if (!user) return null;

  return (
    <Modal open={isOpen} onClose={onClose} title="Approve User Registration">
      <div className="space-y-4">
        {/* User Info */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <span className="font-medium">User:</span> {user.name}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <span className="font-medium">Email:</span> {user.email}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex gap-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
            <AlertCircle
              size={18}
              className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
            />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Department Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Assign Department *
          </label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">-- Select Department --</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Approval Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={loading}
            placeholder="Add any notes for the user..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button
            onClick={onClose}
            variant="secondary"
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            variant="primary"
            disabled={loading || !selectedDepartment}
            className="flex-1 flex items-center justify-center gap-2"
          >
            {loading && <Loader size={16} className="animate-spin" />}
            {loading ? "Approving..." : "Approve & Assign"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
