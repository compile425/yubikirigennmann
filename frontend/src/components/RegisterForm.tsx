import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/useAuth';

interface AxiosErrorResponse {
  error: string;
}

interface RegisterFormProps {
  onBackToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onBackToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const { setToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
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
      const response = await axios.post('http://localhost:3001/api/register', {
        user: {
          name,
          email,
        },
        user_credential: {
          password,
          password_confirmation: passwordConfirmation,
        },
      });
      
      console.log('Registration response:', response.data);
      setToken(response.data.token);
      
      // 登録成功後にユーザー情報を即座に取得
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        const userResponse = await axios.get('http://localhost:3001/api/get_me');
        console.log('User info after registration:', userResponse.data);
      } catch (userError) {
        console.error('Failed to get user info after registration:', userError);
      }
    } catch (err) {
      console.error('登録失敗:', err);
      if (axios.isAxiosError(err) && err.response) {
        const errorData = err.response.data as AxiosErrorResponse;
        setError(errorData.error || '登録に失敗しました。');
      } else {
        setError('予期せぬエラーが発生しました。');
      }
    }
  };

  return (
    <div className="yubi-login">
      <header className="yubi-login__header">
        <h1>新規登録</h1>
      </header>

      <form className="yubi-login__form" onSubmit={handleSubmit}>
        <div className="yubi-form-group">
          <label htmlFor="name" className="yubi-form-group__label">お名前</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="yubi-form-group__input"
            required
          />
        </div>
        <div className="yubi-form-group">
          <label htmlFor="email" className="yubi-form-group__label">メールアドレス</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="yubi-form-group__input"
            required
          />
        </div>
        <div className="yubi-form-group">
          <label htmlFor="password" className="yubi-form-group__label">パスワード</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="yubi-form-group__input"
            required
            minLength={6}
          />
        </div>
        <div className="yubi-form-group">
          <label htmlFor="passwordConfirmation" className="yubi-form-group__label">パスワード（確認）</label>
          <input
            type="password"
            id="passwordConfirmation"
            name="passwordConfirmation"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className="yubi-form-group__input"
            required
            minLength={6}
          />
        </div>
        {error && <p className="yubi-login__error">{error}</p>}
        <button type="submit" className="yubi-button yubi-button--primary yubi-button--login">登録する</button>
      </form>

      <div className="yubi-login__links">
        <button 
          type="button" 
          className="yubi-login__link yubi-login__link--button"
          onClick={onBackToLogin}
        >
          ログイン画面に戻る
        </button>
      </div>
    </div>
  );
};

export default RegisterForm; 