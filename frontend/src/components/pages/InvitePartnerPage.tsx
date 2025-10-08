import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, type ApiResponse } from '../../lib/api';
import { useAuth } from '../../contexts/useAuth';
import Sidebar from '../ui/Sidebar';
import DissolvePartnershipModal from '../modals/DissolvePartnershipModal';

interface InvitationCodeResponse {
  invitation_code: string;
}

const InvitePartnerPage = () => {
  const [invitationCode, setInvitationCode] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isDissolveModalOpen, setIsDissolveModalOpen] =
    useState<boolean>(false);
  const { partner, refreshUserData } = useAuth();
  const navigate = useNavigate();

  const generateInvitationCode = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response: ApiResponse<InvitationCodeResponse> =
        await apiClient.post('/invitation-codes');

      if (response.error) {
        setError(response.error.error || '招待コードの生成に失敗しました。');
      } else {
        const code = response.data?.invitation_code || '';
        setInvitationCode(code);
        setSuccess('招待コードが生成されました！');
      }
    } catch (error) {
      console.error('招待コード生成エラー:', error);
      setError('予期せぬエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const joinPartnership = useCallback(async (): Promise<void> => {
    if (!inputCode.trim()) {
      setError('招待コードを入力してください。');
      return;
    }

    setIsJoining(true);
    setError('');
    setSuccess('');

    try {
      const response: ApiResponse<{ message: string }> = await apiClient.post(
        '/join-partnership',
        {
          invitation_code: inputCode.trim(),
        }
      );

      if (response.error) {
        setError(
          response.error.error || 'パートナーシップの参加に失敗しました。'
        );
      } else {
        setSuccess('パートナーシップが結ばれました！');
        // ユーザー情報を更新してからナビゲート
        await refreshUserData();
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    } catch (error) {
      console.error('パートナーシップ参加エラー:', error);
      setError('予期せぬエラーが発生しました。');
    } finally {
      setIsJoining(false);
    }
  }, [inputCode, navigate, refreshUserData]);

  useEffect(() => {
    if (partner) {
      navigate('/');
    }
  }, [partner, navigate]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(invitationCode);
    alert('招待コードをクリップボードにコピーしました！');
  };

  if (partner) {
    return (
      <div className="app-wrapper">
        <Sidebar onDissolvePartnership={() => setIsDissolveModalOpen(true)} />
        <main className="board-container">
          <div className="invite-partner-page">
            <h1>パートナーシップが既に存在します</h1>
            <p>パートナー: {partner.name}</p>
          </div>
        </main>

        <DissolvePartnershipModal
          isOpen={isDissolveModalOpen}
          onClose={() => setIsDissolveModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <Sidebar onDissolvePartnership={() => setIsDissolveModalOpen(true)} />
      <main className="board-container">
        <div className="invite-partner-page">
          <h1>パートナーと始める</h1>

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          {/* 招待コード生成セクション */}
          <div className="invitation-section">
            <h2>招待コードを生成する</h2>
            {isLoading ? (
              <p>招待コードを生成中...</p>
            ) : invitationCode ? (
              <div>
                <p>以下の招待コードをパートナーに送ってください：</p>
                <div className="invitation-code">
                  <input
                    type="text"
                    value={invitationCode}
                    readOnly
                    className="code-input"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="yubi-hitokoto-send-button"
                  >
                    コピー
                  </button>
                </div>
                <button
                  onClick={generateInvitationCode}
                  className="yubi-hitokoto-send-button"
                >
                  新しいコードを生成
                </button>
              </div>
            ) : (
              <button
                onClick={generateInvitationCode}
                className="yubi-hitokoto-send-button"
              >
                招待コードを生成
              </button>
            )}
          </div>

          {/* 招待コード入力セクション */}
          <div className="join-section">
            <h2>招待コードで参加する</h2>
            <p>パートナーから受け取った招待コードを入力してください：</p>
            <div className="join-form">
              <input
                type="text"
                value={inputCode}
                onChange={e => setInputCode(e.target.value)}
                placeholder="招待コードを入力"
                className="code-input"
                maxLength={8}
              />
              <button
                onClick={joinPartnership}
                className="yubi-hitokoto-send-button"
                disabled={isJoining}
              >
                {isJoining ? '参加中...' : 'パートナーシップに参加'}
              </button>
            </div>
          </div>
        </div>
      </main>

      <DissolvePartnershipModal
        isOpen={isDissolveModalOpen}
        onClose={() => setIsDissolveModalOpen(false)}
      />
    </div>
  );
};

export default InvitePartnerPage;
