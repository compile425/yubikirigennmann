import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient, type ApiResponse } from '../../lib/api';

const ResetPasswordForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState<string>('');
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('無効なリンクです。');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== passwordConfirmation) {
      setError('パスワードが一致しません。');
      return;
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください。');
      return;
    }

    setIsSubmitting(true);

    try {
      const response: ApiResponse = await apiClient.put('/password-resets', {
        token,
        password,
      });

      if (response.error) {
        const errorMessage =
          response.error.error || 'パスワードのリセットに失敗しました。';
        setError(errorMessage);
      } else {
        setMessage('パスワードをリセットしました。ログイン画面に移動します...');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch {
      setError('パスワードのリセットに失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="yubi-login-container">
      <div className="yubi-login-card">
        <div className="yubi-login-header">
          <img
            src="/icon_yubikiri.png"
            alt="ゆびきり"
            className="yubi-login-icon"
          />
          <h2 className="yubi-login-title">新しいパスワードを設定</h2>
          <p className="yubi-login-subtitle">
            新しいパスワードを入力してください
          </p>
        </div>

        <form onSubmit={handleSubmit} className="yubi-login-form">
          <div className="yubi-form-group">
            <label htmlFor="password" className="yubi-form-label">
              新しいパスワード
            </label>
            <input
              type="password"
              id="password"
              placeholder="6文字以上"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="yubi-form-input"
              required
              disabled={isSubmitting || !token}
            />
          </div>

          <div className="yubi-form-group">
            <label htmlFor="password-confirmation" className="yubi-form-label">
              パスワード（確認）
            </label>
            <input
              type="password"
              id="password-confirmation"
              placeholder="もう一度入力"
              value={passwordConfirmation}
              onChange={e => setPasswordConfirmation(e.target.value)}
              className="yubi-form-input"
              required
              disabled={isSubmitting || !token}
            />
          </div>

          {error && <div className="yubi-error-message">{error}</div>}
          {message && <div className="yubi-success-message">{message}</div>}

          <button
            type="submit"
            className="yubi-button yubi-button--login"
            disabled={isSubmitting || !token}
          >
            {isSubmitting ? '処理中...' : 'パスワードをリセット'}
          </button>

          <div className="yubi-login-links">
            <a href="/" className="yubi-login-link">
              ログイン画面に戻る
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
