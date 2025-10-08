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
  markAsRead: () => Promise<void>;
  refreshUnreadStatus: () => Promise<void>;
  hasVisitedHitokotoPage: boolean;
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
  const [hasVisitedHitokotoPage, setHasVisitedHitokotoPage] =
    useState<boolean>(false);
  const { token, partner } = useAuth();

  const refreshUnreadStatus = useCallback(async (): Promise<void> => {
    // 認証されていない場合やパートナーがいない場合は通知を表示しない
    if (!token || !partner) {
      setHasUnreadHitokoto(false);
      return;
    }

    try {
      const response: ApiResponse<OneWord[]> =
        await apiClient.get('/one_words');

      if (response.error) {
        console.error('一言の取得に失敗しました:', response.error);
        setHasUnreadHitokoto(false);
      } else {
        // 一言の数をチェック
        const oneWords = response.data || [];
        const currentCount = oneWords.length;
        const savedCount = parseInt(
          localStorage.getItem('hitokoto_count') || '0',
          10
        );

        // 保存された数より増えていたら通知を表示
        const hasNewWords = currentCount > savedCount;

        console.log('一言通知チェック:', {
          currentCount,
          savedCount,
          hasNewWords,
        });
        setHasUnreadHitokoto(hasNewWords);
      }
    } catch (error) {
      console.error('一言の取得エラー:', error);
      setHasUnreadHitokoto(false);
    }
  }, [token, partner]);

  const markAsRead = useCallback(async (): Promise<void> => {
    console.log('通知を消します');
    // 現在の一言数を記録
    try {
      const response: ApiResponse<OneWord[]> =
        await apiClient.get('/one_words');
      if (!response.error && response.data) {
        const currentCount = response.data.length;
        localStorage.setItem('hitokoto_count', currentCount.toString());
        console.log('一言数を記録:', currentCount);
      }
    } catch (error) {
      console.error('一言の取得エラー:', error);
    }
    setHasUnreadHitokoto(false);
  }, []);

  const resetVisitStatus = useCallback((): void => {
    // 一言送信時は既読日時をリセットしない（新しい一言が来たら通知を表示するため）
    setHasVisitedHitokotoPage(false);
  }, []);

  // 初回マウント時のみ通知をチェック
  useEffect(() => {
    if (token && partner) {
      refreshUnreadStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <HitokotoNotificationContext.Provider
      value={{
        hasUnreadHitokoto,
        markAsRead,
        refreshUnreadStatus,
        hasVisitedHitokotoPage,
        resetVisitStatus,
      }}
    >
      {children}
    </HitokotoNotificationContext.Provider>
  );
};

export const useHitokotoNotification = (): HitokotoNotificationContextType => {
  const context = useContext(HitokotoNotificationContext);
  if (context === undefined) {
    throw new Error(
      'useHitokotoNotification must be used within a HitokotoNotificationProvider'
    );
  }
  return context;
};
