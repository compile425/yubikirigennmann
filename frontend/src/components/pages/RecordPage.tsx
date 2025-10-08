import { useState, useEffect } from 'react';
import { apiClient, type ApiResponse } from '../../lib/api';
import Sidebar from '../ui/Sidebar';
import DissolvePartnershipModal from '../modals/DissolvePartnershipModal';

interface UserStats {
  inviter: {
    id: number;
    name: string;
    avatar_url?: string;
    average_score: number;
    score_trend: number;
  };
  invitee: {
    id: number;
    name: string;
    avatar_url?: string;
    average_score: number;
    score_trend: number;
  };
  monthly_apple_count: number;
}

const RecordPage = () => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isDissolveModalOpen, setIsDissolveModalOpen] =
    useState<boolean>(false);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response: ApiResponse<UserStats> =
          await apiClient.get('/user_stats');

        if (response.error) {
          console.error('ユーザー統計の取得に失敗しました:', response.error);
        } else {
          setUserStats(response.data || null);
        }
      } catch (error) {
        console.error('ユーザー統計の取得エラー:', error);
      }
    };
    fetchUserStats();
  }, []);

  return (
    <div className="app-wrapper">
      <Sidebar />
      <main className="report-fullscreen-container">
        <div className="top-info">
          <h1 className="page-title">ふたりの記録</h1>
          <div className="apple-count">
            今月のりんご <span>{userStats?.monthly_apple_count || 0}</span>個
          </div>
        </div>
        <div className="tree-and-scores">
          <div className="score-plate">
            <img
              className="avatar"
              src={userStats?.inviter.avatar_url || '/public/icon_user.png'}
              alt="招待者のアイコン"
            />
            <div className="user-name">
              あなた
            </div>
            <div className="score-label">今月の平均スコア</div>
            <div className="score-value">
              {userStats?.inviter.average_score.toFixed(1) || '0.0'}
            </div>
            <div className="trend">
              先月から{' '}
              {userStats?.inviter.score_trend &&
              userStats.inviter.score_trend >= 0
                ? '+'
                : ''}
              {userStats?.inviter.score_trend?.toFixed(1) || '0.0'} UP!
            </div>
          </div>
          <img
            className="tree-background"
            src="/public/tree2.png"
            alt="りんごの木"
          />
          <div className="score-plate">
            <img
              className="avatar"
              src={userStats?.invitee.avatar_url || '/public/icon_partner.png'}
              alt="被招待者のアイコン"
            />
            <div className="user-name">
              パートナー
            </div>
            <div className="score-label">今月の平均スコア</div>
            <div className="score-value">
              {userStats?.invitee.average_score.toFixed(1) || '0.0'}
            </div>
            <div className="trend">
              先月から{' '}
              {userStats?.invitee.score_trend &&
              userStats.invitee.score_trend >= 0
                ? '+'
                : ''}
              {userStats?.invitee.score_trend?.toFixed(1) || '0.0'} UP!
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

export default RecordPage;
