import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../lib/config';
import { useAuth } from '../../contexts/useAuth';

const InvitePartnerPage = () => {
  const [invitationUrl, setInvitationUrl] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const { token, partner, currentUser, setToken } = useAuth();
  const navigate = useNavigate();

  // パートナーシップの状態を監視
  useEffect(() => {
    if (partner) {
      // パートナーシップが作成されたら自動的にダッシュボードに移行
      navigate('/');
      return;
    }
  }, [partner, navigate]);

  const handleCreateInvitation = useCallback(async (): Promise<void> => {
    setIsCreating(true);
    setError('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/invitations`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setInvitationUrl(response.data.invitation.invite_url);
    } catch (error) {
      console.error('招待作成エラー:', error);
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.error || '招待の作成に失敗しました');
      } else {
        setError('招待の作成に失敗しました');
      }
    } finally {
      setIsCreating(false);
    }
  }, [token]);

  // 自動で招待リンクを生成
  useEffect(() => {
    if (!partner) {
      handleCreateInvitation();
    }
  }, [partner, handleCreateInvitation]);

  const handleCopyLink = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(invitationUrl);
      alert('リンクをコピーしました！');
    } catch (error) {
      console.error('コピーエラー:', error);
      alert('リンクのコピーに失敗しました');
    }
  };

  const handleLogout = (): void => {
    setToken(null);
    const navToggle = document.getElementById(
      'yubi-nav-toggle'
    ) as HTMLInputElement;
    if (navToggle) {
      navToggle.checked = false;
    }
  };

  // パートナーシップが既に存在する場合はダッシュボードにリダイレクト
  if (partner) {
    return null;
  }

  return (
    <div className="yubi-invite-page">
      <input type="checkbox" id="yubi-nav-toggle" className="yubi-nav-toggle" />
      <label htmlFor="yubi-nav-toggle" className="yubi-nav-button">
        <span className="yubi-nav-button__line"></span>
        <span className="yubi-nav-button__line"></span>
        <span className="yubi-nav-button__line"></span>
      </label>

      <main className="board-container invitation-container">
        <div className="invitation-panel">
          <h2>パートナーを招待しよう！</h2>
          <p>
            「ゆびきりげんまん」は、ふたりで使うアプリです。
            <br />
            まずはパートナーを招待して、
            <br />
            一緒に約束の木を育て始めましょう。
          </p>

          {isCreating ? (
            <div className="loading-state">
              <p>招待リンクを作成中...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p className="form-error">{error}</p>
              <button
                onClick={handleCreateInvitation}
                className="modal-button create-button"
              >
                再試行
              </button>
            </div>
          ) : (
            <div className="link-generator">
              <p>以下の招待リンクをパートナーに送ってください：</p>
              <div className="link-display">{invitationUrl}</div>
              <button
                onClick={handleCopyLink}
                className="modal-button copy-button"
              >
                リンクをコピーする
              </button>
            </div>
          )}
        </div>
      </main>

      {/* パートナーシップが存在しない場合はログアウトのみ表示 */}
      <aside className="yubi-sidebar">
        <div className="yubi-sidebar__header">
          <div className="yubi-sidebar__user-icon">
            <div className="yubi-sidebar__user-avatar">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
        <nav className="yubi-sidebar__nav">
          <a href="#" className="yubi-sidebar__link" onClick={handleLogout}>
            ログアウト
          </a>
        </nav>
      </aside>
      <label htmlFor="yubi-nav-toggle" className="yubi-overlay"></label>
    </div>
  );
};

export default InvitePartnerPage;
