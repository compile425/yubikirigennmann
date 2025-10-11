import React from 'react';
import { useState } from 'react';
import { useAuth } from '../../contexts/useAuth';
import { apiClient, type ApiResponse } from '../../lib/api';
import RegisterForm from './RegisterForm';

interface LoginResponse {
  token: string;
}

interface GuestLoginResponse {
  token: string;
  message: string;
}

const LoginForm = (): React.JSX.Element => {
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
      const response: ApiResponse<LoginResponse> = await apiClient.post(
        '/login',
        {
          email,
          password,
        }
      );

      if (response.error) {
        const errorMessage =
          response.error.error || 'メールアドレスまたはパスワードが違います。';
        setError(errorMessage);
      } else {
        setToken(response.data?.token || null);
      }
    } catch (err) {
      console.error('ログイン失敗:', err);
      setError(
        'ログインに失敗しました。メールアドレスとパスワードを確認してください。'
      );
    }
  };

  const handleGuestLogin = async (): Promise<void> => {
    setError('');
    setIsGuestLoggingIn(true);

    try {
      const response: ApiResponse<GuestLoginResponse> =
        await apiClient.post('/guest_login');

      if (response.error) {
        setError(
          response.error.error ||
            'ゲストログインに失敗しました。しばらく時間をおいて再度お試しください。'
        );
      } else {
        setToken(response.data?.token || null);
      }
    } catch (err) {
      console.error('ゲストログイン失敗:', err);
      setError(
        'ゲストログインに失敗しました。しばらく時間をおいて再度お試しください。'
      );
    } finally {
      setIsGuestLoggingIn(false);
    }
  };

  if (isRegisterMode) {
    return <RegisterForm onBackToLogin={() => setIsRegisterMode(false)} />;
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
        <a href="/forgot-password" className="yubi-login__link">
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
