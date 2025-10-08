import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import type { AuthContextType } from './AuthContext';
import { apiClient, type ApiResponse } from '../lib/api';

interface AuthProviderProps {
  children: ReactNode;
}

interface UserMeResponse {
  current_user: AuthContextType['currentUser'];
  partner: AuthContextType['partner'];
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [currentUser, setCurrentUser] =
    useState<AuthContextType['currentUser']>(null);
  const [partner, setPartner] = useState<AuthContextType['partner']>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 初回のみ実行される認証チェック
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem('authToken');

        if (storedToken) {
          // トークンがある場合、検証
          const response: ApiResponse<UserMeResponse> =
            await apiClient.get('/get_me');

          if (response.error) {
            // エラーの場合はクリア
            localStorage.removeItem('authToken');
            setTokenState(null);
            setCurrentUser(null);
            setPartner(null);
          } else {
            setTokenState(storedToken);
            setCurrentUser(response.data?.current_user || null);
            setPartner(response.data?.partner || null);
          }
        }
      } catch {
        // トークンが無効な場合、クリア
        localStorage.removeItem('authToken');
        setTokenState(null);
        setCurrentUser(null);
        setPartner(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []); // 空の依存配列で初回のみ実行

  const refreshUserData = async (): Promise<void> => {
    if (!token) return;

    try {
      const response: ApiResponse<UserMeResponse> =
        await apiClient.get('/get_me');
      if (response.error) {
        console.error('ユーザー情報の取得に失敗しました:', response.error);
      } else {
        setCurrentUser(response.data?.current_user || null);
        setPartner(response.data?.partner || null);
      }
    } catch (error) {
      console.error('ユーザー情報の取得エラー:', error);
    }
  };

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);

    if (newToken) {
      localStorage.setItem('authToken', newToken);

      // ユーザー情報を取得
      apiClient
        .get<UserMeResponse>('/get_me')
        .then(response => {
          if (response.error) {
            // エラーの場合はクリア
            setToken(null);
          } else {
            setCurrentUser(response.data?.current_user || null);
            setPartner(response.data?.partner || null);
          }
        })
        .catch(() => {
          // エラーの場合はクリア
          setToken(null);
        });
    } else {
      localStorage.removeItem('authToken');
      setCurrentUser(null);
      setPartner(null);
    }
  };

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <AuthContext.Provider
      value={{ token, setToken, currentUser, partner, refreshUserData }}
    >
      {children}
    </AuthContext.Provider>
  );
};
