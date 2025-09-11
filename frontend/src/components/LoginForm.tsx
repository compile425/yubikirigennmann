import { useState } from 'react';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
import { useAuth } from '../contexts/useAuth';
import RegisterForm from './RegisterForm';

interface AxiosErrorResponse {
  error: string;
}

interface LoginFormProps {
  invitationToken?: string;
  onAuthSuccess?: () => void;
}

const LoginForm = ({ invitationToken, onAuthSuccess }: LoginFormProps) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [isGuestLoggingIn, setIsGuestLoggingIn] = useState<boolean>(false);
  const { setToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password,
      });
      setToken(response.data.token);

      if (invitationToken && onAuthSuccess) {
        onAuthSuccess();
      }
    } catch (err) {
      console.error('ログイン失敗:', err);
      if (axios.isAxiosError(err) && err.response) {
        const errorData = err.response.data as AxiosErrorResponse;
        setError(
          errorData.error || 'メールアドレスまたはパスワードが違います。'
        );
      } else {
        setError('予期せぬエラーが発生しました。');
      }
    }
  };

  const handleGuestLogin = async (): Promise<void> => {
    setError('');
    setIsGuestLoggingIn(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/guest_login`);
      setToken(response.data.token);

      if (invitationToken && onAuthSuccess) {
        onAuthSuccess();
      }
    } catch (err) {
      console.error('ゲストログイン失敗:', err);
      if (axios.isAxiosError(err) && err.response) {
        const errorData = err.response.data as AxiosErrorResponse;
        setError(errorData.error || 'ゲストログインに失敗しました。');
      } else {
        setError('予期せぬエラーが発生しました。');
      }
    } finally {
      setIsGuestLoggingIn(false);
    }
  };

  if (isRegisterMode) {
    return (
      <RegisterForm
        onBackToLogin={() => setIsRegisterMode(false)}
        invitationToken={invitationToken}
        onAuthSuccess={onAuthSuccess}
      />
    );
  }

  return (
    <div className="yubi-login">
      <header className="yubi-login__header">
        <h1>ログイン</h1>
      </header>

      <form className="yubi-login__form" onSubmit={handleSubmit}>
        <div className="yubi-form-group">
          <label htmlFor="email" className="yubi-form-group__label">
            メールアドレス
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="yubi-form-group__input"
            required
          />
        </div>
        <div className="yubi-form-group">
          <label htmlFor="password" className="yubi-form-group__label">
            パスワード
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="yubi-form-group__input"
            required
          />
        </div>
        {error && <p className="yubi-login__error">{error}</p>}
        <button
          type="submit"
          className="yubi-button yubi-button--primary yubi-button--login"
        >
          ログインする
        </button>
      </form>

      <div className="yubi-login__links">
        <a href="#" className="yubi-login__link">
          パスワードを忘れた場合
        </a>
        <button
          type="button"
          className="yubi-login__link yubi-login__link--button"
          onClick={() => setIsRegisterMode(true)}
        >
          新規登録はこちら
        </button>
      </div>

      <div className="yubi-login__guest">
        <button
          type="button"
          className="yubi-button yubi-button--secondary yubi-button--guest"
          onClick={handleGuestLogin}
          disabled={isGuestLoggingIn}
        >
          {isGuestLoggingIn ? 'ログイン中...' : 'ゲストとしてログイン'}
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
