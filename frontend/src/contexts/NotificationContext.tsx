import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { notificationApi } from '../services/api';
import { useAuth } from './AuthContext';

interface Notification {
  id: string;
  type: string;
  message: string;
  relatedId: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationFilterParams {
  type?: string[];
  read?: boolean;
  from?: string;
  to?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  filterParams: NotificationFilterParams;
  setFilterParams: (params: NotificationFilterParams) => void;
  refresh: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType>({} as NotificationContextType);

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filterParams, setFilterParams] = useState<NotificationFilterParams>({});

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Send filterParams to the backend
      const [notifRes, countRes] = await Promise.all([
        notificationApi.getAll(filterParams),
        notificationApi.getUnreadCount(),
      ]);
      setNotifications(notifRes.data);
      setUnreadCount(countRes.data.count);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  }, [token, filterParams]);

  useEffect(() => {
    refresh();
    // Poll every 30 seconds
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  const markAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      refresh();
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      refresh();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, loading, filterParams, setFilterParams, refresh, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};
