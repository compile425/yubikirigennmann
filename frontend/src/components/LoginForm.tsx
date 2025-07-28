import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/useAuth';

interface AxiosErrorResponse {
  error: string;
}

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:3001/api/login', {
        email,
        password,
      });
      setToken(response.data.token);
    } catch (err) {
      console.error('ログイン失敗:', err);
      if (axios.isAxiosError(err) && err.response) {
        const errorData = err.response.data as AxiosErrorResponse;
        setError(errorData.error || 'メールアドレスまたはパスワードが違います。');
      } else {
        setError('予期せぬエラーが発生しました。');
      }
    }
  };

  return (
    <div className="login-container">
      <header className="login-header">
        <h1>ログイン</h1>
      </header>

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">メールアドレス</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">パスワード</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        <button type="submit" className="login-button">ログインする</button>
      </form>

      <div className="login-links">
        <a href="#">パスワードを忘れた場合</a>
        <a href="#">新規登録はこちら</a>
      </div>
    </div>
  );
};

export default LoginForm;