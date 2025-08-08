import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/useAuth';

const InvitePartnerPage: React.FC = () => {
  const [inviteeEmail, setInviteeEmail] = useState('');
  const [invitationUrl, setInvitationUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteeEmail.trim()) {
      setError('メールアドレスを入力してください');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:3001/api/invitations', {
        invitee_email: inviteeEmail
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

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
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(invitationUrl);
      alert('リンクをコピーしました！');
    } catch (error) {
      console.error('コピーエラー:', error);
      alert('リンクのコピーに失敗しました');
    }
  };

  const handleBackToDashboard = () => {
    navigate('/');
  };

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
            「ゆびきりげんまん」は、ふたりで使うアプリです。<br />
            まずはパートナーを招待して、一緒に約束の木を育て始めましょう。
          </p>
          
          {!invitationUrl ? (
            <form onSubmit={handleCreateInvitation} className="invitation-form">
              <div className="form-group">
                <label htmlFor="inviteeEmail" className="form-label">
                  パートナーのメールアドレス
                </label>
                <input
                  type="email"
                  id="inviteeEmail"
                  value={inviteeEmail}
                  onChange={(e) => setInviteeEmail(e.target.value)}
                  className="form-input"
                  placeholder="partner@example.com"
                  required
                />
              </div>
              
              {error && <p className="form-error">{error}</p>}
              
              <button
                type="submit"
                disabled={isCreating}
                className="modal-button create-button"
              >
                {isCreating ? '作成中...' : '招待リンクを作成'}
              </button>
            </form>
          ) : (
            <div className="link-generator">
              <div className="link-display">{invitationUrl}</div>
              <a href="#" className="modal-button copy-button" onClick={handleCopyLink}>
                リンクをコピーする
              </a>
            </div>
          )}
        </div>
      </main>
      
      <aside className="yubi-sidebar">
        <div className="yubi-sidebar__header">
          <div className="yubi-sidebar__user-icon">
            <div className="yubi-sidebar__user-avatar">
              U
            </div>
          </div>
        </div>
        <nav className="yubi-sidebar__nav">
          <a href="#" className="yubi-sidebar__link" onClick={handleBackToDashboard}>約束一覧</a>
          <a href="#" className="yubi-sidebar__link">ふたりの記録</a>
          <a href="#" className="yubi-sidebar__link">過去の評価</a>
          <a href="#" className="yubi-sidebar__link">ちょっと一言</a>
          <a href="#" className="yubi-sidebar__link">このアプリについて</a>
          <a href="#" className="yubi-sidebar__link">パートナー招待</a>
          <a href="#" className="yubi-sidebar__link">ログアウト</a>
        </nav>
      </aside>
      <label htmlFor="yubi-nav-toggle" className="yubi-overlay"></label>
    </div>
  );
};

export default InvitePartnerPage; 