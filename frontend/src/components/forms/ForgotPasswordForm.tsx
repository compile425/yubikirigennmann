import { useState } from 'react';
import { apiClient, type ApiResponse } from '../../lib/api';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      const response: ApiResponse = await apiClient.post('/password-resets', {
        email,
      });

      if (response.error) {
        setError('メール送信に失敗しました。もう一度お試しください。');
      } else {
        setMessage(
          'パスワードリセットメールを送信しました。メールをご確認ください。'
        );
        setEmail('');
      }
    } catch {
      setError('メール送信に失敗しました。もう一度お試しください。');
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
          <h2 className="yubi-login-title">パスワードをお忘れの方</h2>
          <p className="yubi-login-subtitle">
            登録されたメールアドレスにパスワードリセット用のリンクを送信します
          </p>
        </div>

        <form onSubmit={handleSubmit} className="yubi-login-form">
          <div className="yubi-form-group">
            <label htmlFor="email" className="yubi-form-label">
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              placeholder="your-email@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="yubi-form-input"
              required
              disabled={isSubmitting}
            />
          </div>

          {error && <div className="yubi-error-message">{error}</div>}
          {message && <div className="yubi-success-message">{message}</div>}

          <button
            type="submit"
            className="yubi-button yubi-button--login"
            disabled={isSubmitting}
          >
            {isSubmitting ? '送信中...' : 'リセットメールを送信'}
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

export default ForgotPasswordForm;
