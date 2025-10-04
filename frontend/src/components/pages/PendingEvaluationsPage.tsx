import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../lib/api';
import Sidebar from '../ui/Sidebar';
import DissolvePartnershipModal from '../modals/DissolvePartnershipModal';
import EvaluationModal from '../modals/EvaluationModal';
import { useAuth } from '../../contexts/useAuth';
import type { PendingPromise, ApiResponse } from '../../lib/api';

const PendingEvaluationsPage = () => {
  const { token, currentUser, partner } = useAuth();
  const [isDissolveModalOpen, setIsDissolveModalOpen] =
    useState<boolean>(false);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] =
    useState<boolean>(false);
  const [selectedPromise, setSelectedPromise] = useState<PendingPromise | null>(
    null
  );
  const [pendingPromises, setPendingPromises] = useState<PendingPromise[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchPendingPromises = useCallback(async (): Promise<void> => {
    if (!token) return;

    setIsLoading(true);
    const response: ApiResponse<PendingPromise[]> = await apiClient.get(
      '/pending-evaluations'
    );

    if (response.error) {
      console.error('評価待ちの約束の取得に失敗しました:', response.error);
      setPendingPromises([]);
    } else {
      setPendingPromises(response.data || []);
    }

    setIsLoading(false);
  }, [token]);

  useEffect(() => {
    fetchPendingPromises();
  }, [fetchPendingPromises]);

  const handleOpenEvaluationModal = (promise: PendingPromise): void => {
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
