import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import DissolvePartnershipModal from './DissolvePartnershipModal';
import EvaluationModal from './EvaluationModal';
import { useAuth } from '../contexts/useAuth';
import type { PromiseItem } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const PendingEvaluationsPage = () => {
  const { token, currentUser, partner } = useAuth();
  const [isDissolveModalOpen, setIsDissolveModalOpen] =
    useState<boolean>(false);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] =
    useState<boolean>(false);
  const [selectedPromise, setSelectedPromise] = useState<PromiseItem | null>(
    null
  );
  const [pendingPromises, setPendingPromises] = useState<PromiseItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchPendingPromises();
  }, []);

  const fetchPendingPromises = async (): Promise<void> => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/pending-evaluations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPendingPromises(response.data);
    } catch (error) {
      console.error('評価待ちの約束の取得に失敗しました:', error);
      // デモ用のダミーデータ
      setPendingPromises([
        {
          id: 1,
          content: '毎日おはようメッセージを送る',
          due_date: '2024-01-15',
          type: 'our_promise',
          creator_id: currentUser?.id || 1,
        },
        {
          id: 2,
          content: '週末は一緒に散歩する',
          due_date: '2024-01-20',
          type: 'our_promise',
          creator_id: partner?.id || 2,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEvaluationModal = (promise: PromiseItem): void => {
    setSelectedPromise(promise);
    setIsEvaluationModalOpen(true);
  };

  const handleEvaluationSubmitted = async (): Promise<void> => {
    await fetchPendingPromises();
  };

  // 評価待ちの約束を自分が作ったものと相手が作ったもので分ける
  const myPendingPromises = pendingPromises.filter(
    promise => currentUser && promise.creator_id === currentUser.id
  );
  const partnerPendingPromises = pendingPromises.filter(
    promise => partner && promise.creator_id === partner.id
  );

  // タイトルを生成
  const myPromisesTitle = currentUser
    ? `${currentUser.name}の評価`
    : 'わたしの評価';
  const partnerPromisesTitle = partner
    ? `${partner.name}の評価`
    : 'パートナーの評価';

  if (isLoading) {
    return (
      <div className="yubi-app">
        <Sidebar onDissolvePartnership={() => setIsDissolveModalOpen(true)} />
        <main className="yubi-main">
          <div className="yubi-loading">
            <p>評価待ちの約束を読み込み中...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="yubi-app">
      <Sidebar onDissolvePartnership={() => setIsDissolveModalOpen(true)} />

      <main className="yubi-main">
        <div className="yubi-board">
          <div className="yubi-column">
            <h2 className="yubi-column__header">
              <span>{myPromisesTitle}</span>
              <span className="yubi-badge yubi-badge--pending">
                {myPendingPromises.length}件
              </span>
            </h2>
            <div className="yubi-column__content">
              {myPendingPromises.length === 0 ? (
                <div className="yubi-empty-state">
                  <p>評価待ちの約束はありません</p>
                </div>
              ) : (
                myPendingPromises.map(promise => (
                  <div
                    key={promise.id}
                    className="yubi-card yubi-card--pending"
                  >
                    <div className="yubi-card__content">{promise.content}</div>
                    <div className="yubi-card__meta">
                      <span className="yubi-card__due-date">
                        期限:{' '}
                        {new Date(promise.due_date).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                    <div className="yubi-card__actions">
                      <button
                        className="yubi-button yubi-button--evaluate"
                        onClick={() => handleOpenEvaluationModal(promise)}
                      >
                        🌟 評価する
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="yubi-column">
            <h2 className="yubi-column__header">
              <span>{partnerPromisesTitle}</span>
              <span className="yubi-badge yubi-badge--pending">
                {partnerPendingPromises.length}件
              </span>
            </h2>
            <div className="yubi-column__content">
              {partnerPendingPromises.length === 0 ? (
                <div className="yubi-empty-state">
                  <p>評価待ちの約束はありません</p>
                </div>
              ) : (
                partnerPendingPromises.map(promise => (
                  <div
                    key={promise.id}
                    className="yubi-card yubi-card--pending"
                  >
                    <div className="yubi-card__content">{promise.content}</div>
                    <div className="yubi-card__meta">
                      <span className="yubi-card__due-date">
                        期限:{' '}
                        {new Date(promise.due_date).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                    <div className="yubi-card__actions">
                      <button
                        className="yubi-button yubi-button--evaluate"
                        onClick={() => handleOpenEvaluationModal(promise)}
                      >
                        🌟 評価する
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {pendingPromises.length === 0 && (
          <div className="yubi-success-message">
            <div className="yubi-success-icon">🎉</div>
            <h3>すべての評価が完了しました！</h3>
            <p>素晴らしいです！すべての約束の評価が完了しています。</p>
          </div>
        )}
      </main>

      <EvaluationModal
        isOpen={isEvaluationModalOpen}
        onClose={() => setIsEvaluationModalOpen(false)}
        promise={selectedPromise}
        onEvaluationSubmitted={handleEvaluationSubmitted}
      />

      <DissolvePartnershipModal
        isOpen={isDissolveModalOpen}
        onClose={() => setIsDissolveModalOpen(false)}
      />
    </div>
  );
};

export default PendingEvaluationsPage;
