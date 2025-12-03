import type { AgentType } from '../config/agentConfig';

const DEFAULT_USER_ID = import.meta.env.VITE_DEFAULT_USER_ID || 'user_001';

export const USER_ID_CHANGE_EVENT = 'userIdChanged';

/**
 * User interface
 */
export interface User {
  user_id: string;
  name: string;
  email?: string;
  gender?: string;
  date_of_birth?: string;
  health_goal?: string;
  conditions?: string;
  cgm_device_type?: string;
  agent_preference?: AgentType;  // 新增: 用户偏好的 health companion
  created_at?: string;
  updated_at?: string;
}

/**
 * 获取用户偏好的 agent（默认为 olivia）
 */
export const getPreferredAgent = (user: User | null | undefined): AgentType => {
  return user?.agent_preference || 'olivia';
};

const ensureStorage = () => {
  if (typeof window === 'undefined') {
    return {
      getItem: () => null,
      setItem: () => {},
    };
  }
  return window.localStorage;
};

export const getStoredUserId = (): string => {
  const storage = ensureStorage();
  try {
    const current = storage.getItem('currentUserId');
    const legacy = storage.getItem('user_id');
    const finalId = current || legacy || DEFAULT_USER_ID;
    if (!current) {
      storage.setItem('currentUserId', finalId);
    }
    if (!legacy) {
      storage.setItem('user_id', finalId);
    }
    return finalId;
  } catch (error) {
    console.warn('Failed to read user id from storage', error);
    return DEFAULT_USER_ID;
  }
};

export const setStoredUserId = (userId: string) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem('currentUserId', userId);
    window.localStorage.setItem('user_id', userId);
    window.dispatchEvent(new Event(USER_ID_CHANGE_EVENT));
  } catch (error) {
    console.error('Failed to persist user id', error);
  }
};
























