import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './useAuth';
import { apiClient } from '../lib/api';
import type { ApiResponse } from '../lib/api';

interface OneWord {
  id: number;
  content: string;
  created_at: string;
}

interface HitokotoNotificationContextType {
  hasUnreadHitokoto: boolean;
  markAsRead: () => void;
  resetVisitStatus: () => void;
}

const HitokotoNotificationContext = createContext<
  HitokotoNotificationContextType | undefined
>(undefined);

interface HitokotoNotificationProviderProps {
  children: ReactNode;
}

export const HitokotoNotificationProvider = ({
  children,
}: HitokotoNotificationProviderProps) => {
  const [hasUnreadHitokoto, setHasUnreadHitokoto] = useState<boolean>(false);
  const { token, partner } = useAuth();

  const checkNotification = useCallback(async () => {
    if (!token || !partner) {
      setHasUnreadHitokoto(false);
      return;
    }

    const isDismissed = localStorage.getItem('hitokoto_dismissed') === 'true';
    if (isDismissed) {
      setHasUnreadHitokoto(false);
      return;
    }

    try {
      const response: ApiResponse<OneWord[]> =
        await apiClient.get('/one_words');

      if (!response.error && response.data) {
        setHasUnreadHitokoto(response.data.length > 0);
      } else {
        setHasUnreadHitokoto(false);
      }
    } catch {
      setHasUnreadHitokoto(false);
    }
  }, [token, partner]);

  const markAsRead = useCallback(() => {
    localStorage.setItem('hitokoto_dismissed', 'true');
    setHasUnreadHitokoto(false);
  }, []);

  const resetVisitStatus = useCallback(() => {
    localStorage.removeItem('hitokoto_dismissed');
  }, []);

  useEffect(() => {
    if (token && partner) {
      checkNotification();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <HitokotoNotificationContext.Provider
      value={{
        hasUnreadHitokoto,
        markAsRead,
        resetVisitStatus,
      }}
    >
      {children}
    </HitokotoNotificationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHitokotoNotification = (): HitokotoNotificationContextType => {
  const context = useContext(HitokotoNotificationContext);
  if (context === undefined) {
    throw new Error(
      'useHitokotoNotification must be used within a HitokotoNotificationProvider'
    );
  }
  return context;
};
