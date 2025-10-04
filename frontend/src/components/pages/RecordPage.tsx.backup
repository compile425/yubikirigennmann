import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../ui/Sidebar';
import DissolvePartnershipModal from '../modals/DissolvePartnershipModal';
import { useAuth } from '../../contexts/useAuth';
import { API_BASE_URL } from '../../lib/config';

interface MonthlyStats {
  current_month_apples: number;
  user_average_score: number;
  partner_average_score: number;
  user_trend: number;
  partner_trend: number;
}

const RecordPage = () => {
  const { currentUser, partner } = useAuth();
  const [isDissolveModalOpen, setIsDissolveModalOpen] =
    useState<boolean>(false);
  const [stats, setStats] = useState<MonthlyStats>({
    current_month_apples: 0,
    user_average_score: 0,
    partner_average_score: 0,
    user_trend: 0,
    partner_trend: 0,
  });

  const fetchStats = async (): Promise<void> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/monthly_stats`);
      setStats(response.data);
    } catch (error) {
      console.error('統計情報の取得に失敗しました:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const userAvatar =
    currentUser?.avatar_url ||
    (currentUser?.is_inviter ? '/icon_user.png' : '/icon_partner.png');
  const partnerAvatar = partner?.avatar_url || '/icon_partner.png';

  return (
    <div className="yubi-app">
      <Sidebar onDissolvePartnership={() => setIsDissolveModalOpen(true)} />

      <main className="yubi-report-fullscreen-container">
        <div className="yubi-report-top-info">
          <h1 className="yubi-report-page-title">ふたりの記録</h1>
          <div className="yubi-apple-count">
            今月のりんご <span>{stats.current_month_apples}</span>個
          </div>
        </div>

        <div className="yubi-tree-and-scores">
          <div className="yubi-score-plate">
            <img
              className="yubi-avatar"
              src={userAvatar}
              alt="あなたのアイコン"
            />
            <div className="yubi-user-name">
              {currentUser?.name || 'あなた'}
            </div>
            <div className="yubi-score-label">これまでの平均スコア</div>
            <div className="yubi-score-value">
              {stats.user_average_score.toFixed(1)}
            </div>
            <div className="yubi-trend">
              先月から {stats.user_trend >= 0 ? '+' : ''}
              {stats.user_trend.toFixed(1)}{' '}
              {stats.user_trend >= 0 ? 'UP!' : 'DOWN'}
            </div>
          </div>

          <img
            className="yubi-tree-background"
            src="/tree2.png"
            alt="りんごの木"
          />

          <div className="yubi-score-plate">
            <img
              className="yubi-avatar"
              src={partnerAvatar}
              alt="パートナーのアイコン"
            />
            <div className="yubi-user-name">
              {partner?.name || 'パートナー'}
            </div>
            <div className="yubi-score-label">これまでの平均スコア</div>
            <div className="yubi-score-value">
              {stats.partner_average_score.toFixed(1)}
            </div>
            <div className="yubi-trend">
              先月から {stats.partner_trend >= 0 ? '+' : ''}
              {stats.partner_trend.toFixed(1)}{' '}
              {stats.partner_trend >= 0 ? 'UP!' : 'DOWN'}
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
