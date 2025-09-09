import { useState, useEffect, useCallback } from 'react';

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  containerId?: number;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Generate initial notifications
  useEffect(() => {
    const initialNotifications: Notification[] = [
      {
        id: '1',
        type: 'warning',
        title: 'Container Status',
        message: 'Mail-server (CT104) heeft een fout status',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 min ago
        read: false,
        containerId: 104,
      },
      {
        id: '2',
        type: 'success',
        title: 'Update Voltooid',
        message: 'Web-server (CT100) succesvol geüpdatet',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: false,
        containerId: 100,
      },
      {
        id: '3',
        type: 'info',
        title: 'Backup Reminder',
        message: 'Backup-service (CT102) is gestopt - controleer planning',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        read: true,
        containerId: 102,
      },
    ];
    setNotifications(initialNotifications);
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
  };
}