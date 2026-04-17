import { useContext } from "react";
import { PendingUsersContext } from "../context/PendingUsersContext";

export function usePendingUsers() {
  const context = useContext(PendingUsersContext);

  if (!context) {
    throw new Error("usePendingUsers must be used within PendingUsersProvider");
  }

  return context;
}
