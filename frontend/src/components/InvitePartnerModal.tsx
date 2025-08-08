import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/useAuth';

interface InvitePartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InvitePartnerModal: React.FC<InvitePartnerModalProps> = ({ isOpen, onClose }) => {
  const [inviteeEmail, setInviteeEmail] = useState('');
  const [invitationUrl, setInvitationUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();

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

  if (!isOpen) return null;

  return (
    <div className="yubi-modal-overlay yubi-modal-overlay--open">
      <div className="yubi-modal">
        <div className="yubi-modal__header">
          <h2 className="yubi-modal__title">パートナーを招待</h2>
        </div>
        
        <div className="yubi-modal__body">
          {!invitationUrl ? (
            <form onSubmit={handleCreateInvitation}>
              <div className="yubi-form-group">
                <label htmlFor="inviteeEmail" className="yubi-form-group__label">
                  パートナーのメールアドレス
                </label>
                <input
                  type="email"
                  id="inviteeEmail"
                  value={inviteeEmail}
                  onChange={(e) => setInviteeEmail(e.target.value)}
                  className="yubi-form-group__input"
                  placeholder="partner@example.com"
                  required
                />
              </div>
              
              {error && <p style={{ color: '#e53e3e', marginBottom: '16px' }}>{error}</p>}
            </form>
          ) : (
            <div className="yubi-invitation-result">
              <h3>招待リンクが作成されました！</h3>
              <p>以下のリンクをパートナーに送信してください：</p>
              
              <div className="yubi-invitation-url">
                <input
                  type="text"
                  value={invitationUrl}
                  readOnly
                  className="yubi-form-group__input"
                />
                <button
                  onClick={handleCopyLink}
                  className="yubi-button yubi-button--primary"
                >
                  リンクをコピー
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="yubi-modal__footer">
          {!invitationUrl ? (
            <>
              <button
                type="submit"
                disabled={isCreating}
                className="yubi-button yubi-button--primary"
                onClick={handleCreateInvitation}
              >
                {isCreating ? '作成中...' : '招待リンクを作成'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="yubi-button yubi-button--secondary"
              >
                キャンセル
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setInvitationUrl('');
                setInviteeEmail('');
                onClose();
              }}
              className="yubi-button yubi-button--primary"
            >
              完了
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvitePartnerModal; 