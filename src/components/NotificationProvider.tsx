"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Notification {
  id: string;
  message: string;
  url: string;
  read: boolean;
  createdAt: Date;
}

interface NotificationContextType {
  socket: Socket | null;
  notifications: Notification[];
}

const NotificationContext = createContext<NotificationContextType>({
  socket: null,
  notifications: []
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      const newSocket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'wss://www.innut.io', {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        withCredentials: true
      });

      newSocket.on('newNotification', (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, []);

  const contextValue: NotificationContextType = {
    socket,
    notifications
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);