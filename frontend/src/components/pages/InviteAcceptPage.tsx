import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient, type ApiResponse } from '../../lib/api';
import LoginForm from '../forms/LoginForm';
import { useAuth } from '../../contexts/useAuth';

const InviteAcceptPage = () => {
  const { token: invitationToken } = useParams<{ token: string }>();
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const validateInvitation = async () => {
      if (token) {
        // 既にログインしている場合はダッシュボードへ
        navigate('/dashboard');
        return;
      }

      if (invitationToken) {
        try {
          const response: ApiResponse = await apiClient.get(`/invite/${invitationToken}`);
          
          if (response.error) {
            console.error('招待トークンの検証に失敗しました:', response.error);
            setIsValidToken(false);
          } else {
            setIsValidToken(true);
          }
        } catch (error) {
          console.error('招待トークンの検証エラー:', error);
          setIsValidToken(false);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsValidToken(false);
        setIsLoading(false);
      }
    };
    validateInvitation();
  }, [invitationToken, navigate, token]);

  const handleAuthSuccess = async () => {
    if (invitationToken) {
      try {
        const response: ApiResponse = await apiClient.get(`/invite/${invitationToken}`);
        
        if (response.error) {
          console.error('招待承認後の処理に失敗しました:', response.error);
          alert('招待の承認に失敗しました。');
        } else {
          console.log('招待承認成功:', response.data);
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('招待承認後の処理エラー:', error);
        alert('招待の承認に失敗しました。');
      }
    } else {
      navigate('/dashboard');
    }
  };

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  if (isValidToken === false) {
    return (
      <div className="invite-accept-page">
        <h1>無効な招待リンク</h1>
        <p>この招待リンクは無効または期限切れです。</p>
      </div>
    );
  }

  return (
    <div className="invite-accept-page">
      <h1>パートナーシップ招待</h1>
      <p>ログインまたは新規登録してパートナーシップに参加してください。</p>
      
      <LoginForm
        invitationToken={invitationToken}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default InviteAcceptPage;
