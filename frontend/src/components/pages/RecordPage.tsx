import { useState, useEffect } from 'react';
import { apiClient, type ApiResponse } from '../../lib/api';
import Sidebar from '../ui/Sidebar';
import DissolvePartnershipModal from '../modals/DissolvePartnershipModal';

interface UserStats {
  current_user: {
    name: string;
    avatar_url?: string;
    average_score: number;
    score_trend: number;
  };
  partner: {
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
              src={
                userStats?.current_user.avatar_url || '/public/icon_user.png'
              }
              alt="あなたのアイコン"
            />
            <div className="user-name">
              {userStats?.current_user.name || 'あなた'}
            </div>
            <div className="score-label">これまでの平均スコア</div>
            <div className="score-value">
              {userStats?.current_user.average_score.toFixed(1) || '0.0'}
            </div>
            <div className="trend">
              先月から{' '}
              {userStats?.current_user.score_trend &&
              userStats.current_user.score_trend >= 0
                ? '+'
                : ''}
              {userStats?.current_user.score_trend?.toFixed(1) || '0.0'} UP!
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
              src={userStats?.partner.avatar_url || '/public/icon_partner.png'}
              alt="パートナーのアイコン"
            />
            <div className="user-name">
              {userStats?.partner.name || 'パートナー'}
            </div>
            <div className="score-label">これまでの平均スコア</div>
            <div className="score-value">
              {userStats?.partner.average_score.toFixed(1) || '0.0'}
            </div>
            <div className="trend">
              先月から{' '}
              {userStats?.partner.score_trend &&
              userStats.partner.score_trend >= 0
                ? '+'
                : ''}
              {userStats?.partner.score_trend?.toFixed(1) || '0.0'} UP!
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
