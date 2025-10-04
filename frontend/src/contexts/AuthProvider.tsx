import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import type { AuthContextType } from './AuthContext';
import { API_BASE_URL } from '../lib/config';

interface AuthProviderProps {
  children: ReactNode;
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
          axios.defaults.headers.common['Authorization'] =
            `Bearer ${storedToken}`;
          const response = await axios.get(`${API_BASE_URL}/get_me`);

          setTokenState(storedToken);
          setCurrentUser(response.data.current_user);
          setPartner(response.data.partner);
        }
      } catch (error) {
        // トークンが無効な場合、クリア
        localStorage.removeItem('authToken');
        delete axios.defaults.headers.common['Authorization'];
        setTokenState(null);
        setCurrentUser(null);
        setPartner(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []); // 空の依存配列で初回のみ実行

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);

    if (newToken) {
      localStorage.setItem('authToken', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      // ユーザー情報を取得
      axios
        .get(`${API_BASE_URL}/get_me`)
        .then(response => {
          setCurrentUser(response.data.current_user);
          setPartner(response.data.partner);
        })
        .catch(() => {
          // エラーの場合はクリア
          setToken(null);
        });
    } else {
      localStorage.removeItem('authToken');
      delete axios.defaults.headers.common['Authorization'];
      setCurrentUser(null);
      setPartner(null);
    }
  };

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <AuthContext.Provider value={{ token, setToken, currentUser, partner }}>
      {children}
    </AuthContext.Provider>
  );
};
