import { useState, useEffect, useCallback } from 'react';
import { apiClient, type ApiResponse, type EvaluatedPromise } from '../../lib/api';
import Sidebar from '../ui/Sidebar';
import PromiseColumn from '../ui/PromiseColumn';

const PastEvaluationsPage = () => {
  const [evaluatedPromises, setEvaluatedPromises] = useState<EvaluatedPromise[]>([]);

  const fetchEvaluatedPromises = useCallback(async (): Promise<void> => {
    try {
      const response: ApiResponse<EvaluatedPromise[]> = await apiClient.get('/evaluated-promises');

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
  }, []);

  useEffect(() => {
    fetchEvaluatedPromises();
  }, [fetchEvaluatedPromises]);

  return (
    <div className="yubi-app">
      <Sidebar />
      <main className="yubi-main">
        <div className="yubi-board">
          <PromiseColumn
            title="評価済みの約束"
            promises={evaluatedPromises}
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
