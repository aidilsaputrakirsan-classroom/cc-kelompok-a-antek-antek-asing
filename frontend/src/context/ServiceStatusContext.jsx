import { createContext, useContext, useEffect, useState, useRef } from "react";
import { setServiceUnavailableHandler, checkAuthHealth } from "../services/api";

const ServiceStatusContext = createContext(null);

export function ServiceStatusProvider({ children }) {
  const [isAuthDown, setIsAuthDown] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pendingRequestsRef = useRef([]);

  // Register the global handler
  useEffect(() => {
    setServiceUnavailableHandler((path, resolve, reject) => {
      // If it's an auth-related path, set auth as down
      const isAuthPath = !path.startsWith("/items");
      if (isAuthPath) {
        setIsAuthDown(true);
      }

      // Add to pending requests queue
      pendingRequestsRef.current.push({ path, resolve, reject });

      // Show the error modal
      setIsModalOpen(true);
    });

    // Run health check on startup
    checkAuthHealth().then((healthy) => {
      if (!healthy) {
        setIsAuthDown(true);
      }
    });

    // Periodic health check every 15 seconds to auto-recover/detect auth status
    const interval = setInterval(() => {
      checkAuthHealth().then((healthy) => {
        setIsAuthDown(!healthy);
      });
    }, 15000);

    return () => {
      setServiceUnavailableHandler(null);
      clearInterval(interval);
    };
  }, []);

  const handleRetry = async () => {
    const requests = [...pendingRequestsRef.current];
    pendingRequestsRef.current = [];
    setIsModalOpen(false);

    // Run health check to see if auth is back up
    const healthy = await checkAuthHealth();
    if (healthy) {
      setIsAuthDown(false);
    }

    // Resolve all pending requests to trigger their retry loops
    requests.forEach(({ resolve }) => resolve());
  };

  const handleCancel = () => {
    const requests = [...pendingRequestsRef.current];
    pendingRequestsRef.current = [];
    setIsModalOpen(false);

    // Reject all pending requests to fail them
    requests.forEach(({ reject }) => reject());
  };

  return (
    <ServiceStatusContext.Provider value={{ isAuthDown, isModalOpen, handleRetry, handleCancel }}>
      {children}
    </ServiceStatusContext.Provider>
  );
}

export function useServiceStatus() {
  return useContext(ServiceStatusContext);
}
