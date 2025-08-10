import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import type { AuthContextType } from './AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setTokenState] = useState<string | null>(localStorage.getItem('authToken'));
  const [currentUser, setCurrentUser] = useState<AuthContextType['currentUser']>(null);
  const [partner, setPartner] = useState<AuthContextType['partner']>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUserData = useCallback(async (): Promise<void> => {
    if (token) {
      try {
        console.log('Token found:', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('Making request to /api/get_me with token:', token);
        const response = await axios.get('http://localhost:3001/api/get_me');
        console.log('Auth response:', response.data);
        setCurrentUser(response.data.current_user);
        setPartner(response.data.partner);
      } catch (error) {
        console.error("認証に失敗しました。トークンを削除します:", error);
        localStorage.removeItem('authToken');
        setTokenState(null);
        setCurrentUser(null);
        setPartner(null);
      }
    } else {
      console.log('No token found');
    }
  }, [token]);

  useEffect(() => {
    const initializeAuth = async (): Promise<void> => {
      await fetchUserData();
      setIsLoading(false);
    };

    initializeAuth();
  }, [fetchUserData]);

  // パートナーシップの状態を定期的にチェック（10秒ごと）
  useEffect(() => {
    if (token && !partner) {
      const interval = setInterval(async (): Promise<void> => {
        try {
          const response = await axios.get('http://localhost:3001/api/get_me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.data.partner && !partner) {
            console.log('パートナーシップが作成されました:', response.data.partner);
            setPartner(response.data.partner);
          }
        } catch (error) {
          console.error('パートナーシップ状態チェックエラー:', error);
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [token, partner]);

  const setToken = (newToken: string | null): void => {
    console.log('Setting token:', newToken);
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem('authToken', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } else {
      // ログアウト時の処理
      localStorage.removeItem('authToken');
      delete axios.defaults.headers.common['Authorization'];
      setCurrentUser(null);
      setPartner(null);
      
      // 確実にユーザー情報をクリア
      console.log('ログアウト処理完了');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ token, setToken, currentUser, partner }}>
      {children}
    </AuthContext.Provider>
  );
};