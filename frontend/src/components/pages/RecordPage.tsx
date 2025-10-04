import { useState, useEffect } from 'react';
import { apiClient, type ApiResponse } from '../../lib/api';
import Sidebar from '../ui/Sidebar';
import DissolvePartnershipModal from '../modals/DissolvePartnershipModal';
import { useAuth } from '../../contexts/useAuth';

interface MonthlyStat {
  month: string;
  total_promises: number;
  completed_promises: number;
  average_rating: number;
}

const RecordPage = () => {
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>([]);
  const [isDissolveModalOpen, setIsDissolveModalOpen] = useState<boolean>(false);
  const { partner } = useAuth();

  useEffect(() => {
    const fetchMonthlyStats = async () => {
      try {
        const response: ApiResponse<MonthlyStat[]> = await apiClient.get('/monthly_stats');

        if (response.error) {
          console.error('月間統計の取得に失敗しました:', response.error);
        } else {
          setMonthlyStats(response.data || []);
        }
      } catch (error) {
        console.error('月間統計の取得エラー:', error);
      }
    };
    fetchMonthlyStats();
  }, []);

  return (
    <div className="yubi-app">
      <Sidebar />
      <main className="yubi-main">
        <div className="record-page">
          <h1>記録</h1>
          
          <div className="monthly-stats">
            <h2>月間統計</h2>
            {monthlyStats.length > 0 ? (
              <div className="stats-grid">
                {monthlyStats.map((stat, index) => (
                  <div key={index} className="stat-card">
                    <h3>{stat.month}</h3>
                    <p>総約束数: {stat.total_promises}</p>
                    <p>完了数: {stat.completed_promises}</p>
                    <p>平均評価: {stat.average_rating.toFixed(1)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>データがありません</p>
            )}
          </div>

          {partner && (
            <button
              onClick={() => setIsDissolveModalOpen(true)}
              className="yubi-button yubi-button--danger"
            >
              パートナーシップを解除
            </button>
          )}
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
