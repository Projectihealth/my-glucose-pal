/**
 * UserContext - 增强版
 *
 * 提供用户信息和管理方法
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface UserInfo {
  user_id: string;
  name: string;
  gender?: string;
  date_of_birth?: string;
  health_goal?: string;
  conditions?: string;
  cgm_device_type?: string;
}

interface UserContextValue {
  userId: string;
  userName: string;
  userInfo: UserInfo | null;
  isLoading: boolean;
  error: string | null;
  refreshUserInfo: () => Promise<void>;
  setUserId: (userId: string) => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const defaultUserId = import.meta.env.VITE_DEFAULT_USER_ID || 'user_001';
  const [userId, setUserId] = useState(defaultUserId);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUserInfo = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 获取所有用户列表
      const response = await axios.get('/api/users');
      const users = response.data;

      // 找到当前用户
      const user = users.find((u: UserInfo) => u.user_id === userId) || users[0];

      if (user) {
        setUserInfo(user);
        console.log('[UserContext] User info loaded:', user);
      } else {
        throw new Error('User not found');
      }
    } catch (err: any) {
      console.error('[UserContext] Error fetching user info:', err);
      setError('Failed to load user information');

      // 使用默认用户信息
      setUserInfo({
        user_id: userId,
        name: 'User',
        health_goal: 'Manage glucose levels'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    refreshUserInfo();
  }, [userId]);

  const value: UserContextValue = {
    userId,
    userName: userInfo?.name || 'User',
    userInfo,
    isLoading,
    error,
    refreshUserInfo,
    setUserId
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
