import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../lib/config';
import Sidebar from '../ui/Sidebar';
import PromiseColumn from '../ui/PromiseColumn';
import type { EvaluatedPromise } from '../../lib/api';
import { useAuth } from '../../contexts/useAuth';

const PastEvaluationsPage = () => {
  const [evaluatedPromises, setEvaluatedPromises] = useState<
    EvaluatedPromise[]
  >([]);
  const { token, currentUser, partner } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);

  const fetchEvaluatedPromises = useCallback(async (): Promise<void> => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/evaluated-promises`);
      console.log('API Response:', response.data);
      console.log('First promise data:', response.data[0]);
      console.log('Rating in first promise:', response.data[0]?.rating);
      setEvaluatedPromises(response.data);
    } catch (error) {
      console.error('評価済み約束の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchEvaluatedPromises();
  }, [fetchEvaluatedPromises]);

  const myPromisesTitle = currentUser
    ? `${currentUser.name}の過去の約束`
    : 'わたしの過去の約束';
  const partnerPromisesTitle = partner
    ? `${partner.name}の過去の約束`
    : 'パートナーの過去の約束';

  const myEvaluatedPromises = evaluatedPromises.filter(
    p => currentUser && p.creator_id === currentUser.id
  );
  const partnerEvaluatedPromises = evaluatedPromises.filter(
    p => partner && p.creator_id === partner.id
  );
  const ourEvaluatedPromises = evaluatedPromises.filter(
    p => p.type === 'our_promise'
  );

  if (loading) {
    return (
      <div className="yubi-flex-center min-h-screen">
        <div className="yubi-text-xl">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="yubi-app">
      <Sidebar />
      <main className="yubi-main">
        <div className="yubi-board">
          <PromiseColumn
            title={myPromisesTitle}
            promises={myEvaluatedPromises}
            onAdd={() => {}}
            showAddButton={false}
          />
          <PromiseColumn
            title="ふたりの過去の約束"
            promises={ourEvaluatedPromises}
            onAdd={() => {}}
            showAddButton={false}
          />
          <PromiseColumn
            title={partnerPromisesTitle}
            promises={partnerEvaluatedPromises}
            onAdd={() => {}}
            showAddButton={false}
          />
        </div>
      </main>
    </div>
  );
};

export default PastEvaluationsPage;
