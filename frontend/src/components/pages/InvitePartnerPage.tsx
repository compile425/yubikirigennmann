import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, type ApiResponse } from '../../lib/api';
import { useAuth } from '../../contexts/useAuth';

interface InvitationResponse {
  invitation: {
    token: string;
  };
}

const InvitePartnerPage = () => {
  const [invitationUrl, setInvitationUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const { partner } = useAuth();
  const navigate = useNavigate();

  const fetchInvitationToken = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError('');

    try {
      const response: ApiResponse<InvitationResponse> = await apiClient.post('/invitations');

      if (response.error) {
        setError(response.error.error || '招待トークンの生成に失敗しました。');
      } else {
        const token = response.data?.invitation.token || '';
        setInvitationUrl(`${window.location.origin}/invite/${token}`);
      }
    } catch (error) {
      console.error('招待トークン生成エラー:', error);
      setError('予期せぬエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!partner) {
      fetchInvitationToken();
    } else {
      navigate('/');
    }
  }, [partner, fetchInvitationToken, navigate]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(invitationUrl);
    alert('招待URLをクリップボードにコピーしました！');
  };

  if (partner) {
    return (
      <div className="invite-partner-page">
        <h1>パートナーシップが既に存在します</h1>
        <p>パートナー: {partner.name}</p>
      </div>
    );
  }

  return (
    <div className="invite-partner-page">
      <h1>パートナーを招待</h1>
      
      {error && <p className="error">{error}</p>}
      
      {isLoading ? (
        <p>招待トークンを生成中...</p>
      ) : invitationUrl ? (
        <div>
          <p>以下のURLをパートナーに送ってください：</p>
          <div className="invitation-url">
            <input
              type="text"
              value={invitationUrl}
              readOnly
              className="url-input"
            />
            <button onClick={copyToClipboard} className="copy-button">
              コピー
            </button>
          </div>
        </div>
      ) : (
        <button onClick={fetchInvitationToken} className="generate-button">
          招待トークンを生成
        </button>
      )}
    </div>
  );
};

export default InvitePartnerPage;
