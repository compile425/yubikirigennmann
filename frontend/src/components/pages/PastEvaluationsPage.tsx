import { useState, useEffect } from 'react';
import {
  apiClient,
  type ApiResponse,
  type EvaluatedPromise,
} from '../../lib/api';
import Sidebar from '../ui/Sidebar';
import PromiseColumn from '../ui/PromiseColumn';
import { useAuth } from '../../contexts/useAuth';

const PastEvaluationsPage = () => {
  const [evaluatedPromises, setEvaluatedPromises] = useState<
    EvaluatedPromise[]
  >([]);
  const { currentUser, partner } = useAuth();

  useEffect(() => {
    const fetchEvaluatedPromises = async (): Promise<void> => {
      try {
        const response: ApiResponse<EvaluatedPromise[]> = await apiClient.get(
          '/evaluated-promises'
        );

        if (response.error) {
          console.error('評価済み約束の取得に失敗しました:', response.error);
          setEvaluatedPromises([]);
        } else {
          setEvaluatedPromises(response.data || []);
        }
      } catch (error) {
        console.error('評価済み約束の取得エラー:', error);
        setEvaluatedPromises([]);
      }
    };

    fetchEvaluatedPromises();
  }, []);

  // 約束をタイプ別に分類
  const myPromises = evaluatedPromises.filter(
    promise => promise.type === 'my_promise'
  );
  const ourPromises = evaluatedPromises.filter(
    promise => promise.type === 'our_promise'
  );
  const partnerPromises = evaluatedPromises.filter(
    promise => promise.type === 'partner_promise'
  );

  // タイトル生成
  const getTitle = (type: string) => {
    if (type === 'my_promise') {
      return `${currentUser?.name || 'あなた'}の過去の約束`;
    } else if (type === 'our_promise') {
      return 'ふたりの過去の約束';
    } else if (type === 'partner_promise') {
      return `${partner?.name || 'パートナー'}の過去の約束`;
    }
    return '過去の約束';
  };

  return (
    <div className="app-wrapper">
      <Sidebar />
      <main className="board-container">
        <div className="yubi-board">
          <PromiseColumn
            title={getTitle('my_promise')}
            promises={myPromises}
            onAdd={() => {}}
            showAddButton={false}
            onEdit={() => {}}
            onDelete={() => {}}
            onEvaluate={() => {}}
            showEvaluationButton={false}
          />

          <PromiseColumn
            title={getTitle('our_promise')}
            promises={ourPromises}
            onAdd={() => {}}
            showAddButton={false}
            onEdit={() => {}}
            onDelete={() => {}}
            onEvaluate={() => {}}
            showEvaluationButton={false}
          />

          <PromiseColumn
            title={getTitle('partner_promise')}
            promises={partnerPromises}
            onAdd={() => {}}
            showAddButton={false}
            onEdit={() => {}}
            onDelete={() => {}}
            onEvaluate={() => {}}
            showEvaluationButton={false}
          />
        </div>
      </main>
    </div>
  );
};

export default PastEvaluationsPage;
