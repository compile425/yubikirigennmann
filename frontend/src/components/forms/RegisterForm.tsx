import React from 'react';
import { useState } from 'react';
import { useAuth } from '../../contexts/useAuth';
import { apiClient, type ApiResponse } from '../../lib/api';

interface RegisterResponse {
  token: string;
}

interface RegisterFormProps {
  onBackToLogin: () => void;
  invitationCode?: string;
  onAuthSuccess?: () => void;
}

const RegisterForm = ({
  onBackToLogin,
  invitationCode,
  onAuthSuccess,
}: RegisterFormProps) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { setToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirmation) {
      setError('パスワードが一致しません。');
      return;
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください。');
      return;
    }

    try {
      const requestData: {
        user: {
          name: string;
          email: string;
        };
        user_credential: {
          password: string;
          password_confirmation: string;
        };
        invitation_code?: string;
      } = {
        user: {
          name,
          email,
        },
        user_credential: {
          password,
          password_confirmation: passwordConfirmation,
        },
      };

      if (invitationCode) {
        requestData.invitation_code = invitationCode;
      }

      const response: ApiResponse<RegisterResponse> = await apiClient.post('/register', requestData);

      if (response.error) {
        if (response.error.errors && response.error.errors.length > 0) {
          setError(response.error.errors.join(', '));
        } else {
          setError(response.error.error || '登録に失敗しました。');
        }
      } else {
        setToken(response.data?.token || null);

        if (invitationCode && onAuthSuccess) {
          onAuthSuccess();
        }
      }
    } catch (err) {
      console.error('登録失敗:', err);
      setError('予期せぬエラーが発生しました。');
    }
  };

  return (
    <div className="yubi-login">
      <header className="yubi-login__header">
        <h1>新規登録</h1>
      </header>

      <form className="yubi-login__form" onSubmit={handleSubmit}>
        <div className="yubi-form-group">
          <label htmlFor="name" className="yubi-form-group__label">
            名前
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="yubi-form-group__input"
            required
          />
        </div>

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
            minLength={6}
          />
        </div>

        <div className="yubi-form-group">
          <label htmlFor="passwordConfirmation" className="yubi-form-group__label">
            パスワード確認
          </label>
          <input
            type="password"
            id="passwordConfirmation"
            name="passwordConfirmation"
            value={passwordConfirmation}
            onChange={e => setPasswordConfirmation(e.target.value)}
            className="yubi-form-group__input"
            required
            minLength={6}
          />
        </div>

        {error && <p className="yubi-login__error">{error}</p>}

        <button
          type="submit"
          className="yubi-button yubi-button--primary yubi-button--login"
        >
          登録する
        </button>
      </form>

      <div className="yubi-login__links">
        <button
          type="button"
          className="yubi-login__link yubi-login__link--button"
          onClick={onBackToLogin}
        >
          ログインに戻る
        </button>
      </div>
    </div>
  );
};

export default RegisterForm;
