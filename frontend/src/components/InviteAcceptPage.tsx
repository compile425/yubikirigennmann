import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const InviteAcceptPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);

  useEffect(() => {
    const checkInvitation = async (): Promise<void> => {
      if (!token) {
        setError('無効な招待リンクです');
        setIsLoading(false);
        return;
      }

      try {
        await axios.get(`${API_BASE_URL}/invite/${token}`);
      } catch (error) {
        console.error('招待確認エラー:', error);
        if (axios.isAxiosError(error) && error.response) {
          setError(error.response.data.error || '無効な招待リンクです');
        } else {
          setError('招待の確認に失敗しました');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkInvitation();
  }, [token]);

  const handleAuthSuccess = async (): Promise<void> => {
    if (!token) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/invite/${token}`);
      if (response.data.message === 'パートナーシップが作成されました') {
        alert('パートナーシップが作成されました！');
        navigate('/');
      }
    } catch (error) {
      console.error('パートナーシップ作成エラー:', error);
      alert('パートナーシップの作成に失敗しました');
    }
  };

  if (isLoading) {
    return (
      <div className="yubi-loading">
        <p>招待を確認中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="yubi-error">
        <h2>エラー</h2>
        <p>{error}</p>
        <button
          onClick={() => navigate('/')}
          className="yubi-button yubi-button--primary"
        >
          ホームに戻る
        </button>
      </div>
    );
  }

  return (
    <div className="yubi-invite-accept">
      <div className="yubi-invite-accept__card">
        <h1>パートナーを招待しよう！</h1>
        <p>「ゆびきりげんまん」は、ふたりで使うアプリです。</p>

        <div className="yubi-invite-accept__auth">
          <div className="yubi-invite-accept__tabs">
            <button
              className={`yubi-tab ${isLoginMode ? 'yubi-tab--active' : ''}`}
              onClick={() => setIsLoginMode(true)}
            >
              ログイン
            </button>
            <button
              className={`yubi-tab ${!isLoginMode ? 'yubi-tab--active' : ''}`}
              onClick={() => setIsLoginMode(false)}
            >
              新規登録
            </button>
          </div>

          {isLoginMode ? (
            <LoginForm
              invitationToken={token}
              onAuthSuccess={handleAuthSuccess}
            />
          ) : (
            <RegisterForm
              onBackToLogin={() => setIsLoginMode(true)}
              invitationToken={token}
              onAuthSuccess={handleAuthSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteAcceptPage;
