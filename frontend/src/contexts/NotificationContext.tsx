import { createContext, useContext, useState, ReactNode } from 'react';
import { ParsedError } from '@/types/errors';

interface Notification {
  id: string;
  error: ParsedError;
  timestamp: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (error: ParsedError) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (error: ParsedError) => {
    const notification: Notification = {
      id: Date.now().toString(),
      error,
      timestamp: Date.now(),
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-remove after 5 seconds for non-error notifications
    if (error.severity !== 'error') {
      setTimeout(() => {
        removeNotification(notification.id);
      }, 5000);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}