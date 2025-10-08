import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../lib/api';
import Sidebar from '../ui/Sidebar';
import DissolvePartnershipModal from '../modals/DissolvePartnershipModal';
import EvaluationModal from '../modals/EvaluationModal';
import { useAuth } from '../../contexts/useAuth';
import type { PendingPromise, ApiResponse } from '../../lib/api';

const PendingEvaluationsPage = () => {
  const { token } = useAuth();
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

  if (isLoading) {
    return (
      <div className="yubi-app yubi-app--pending-evaluations">
        <Sidebar onDissolvePartnership={() => setIsDissolveModalOpen(true)} />
        <main className="yubi-main yubi-main--pending-evaluations">
          <div className="yubi-loading">
            <p>評価待ちの約束を読み込み中...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="yubi-app yubi-app--pending-evaluations">
      <Sidebar onDissolvePartnership={() => setIsDissolveModalOpen(true)} />

      <main className="yubi-main yubi-main--pending-evaluations">
        <div className="yubi-board">
          <div className="yubi-column">
            <h2 className="yubi-column__header">
              <span>評価待ちの約束</span>
              <span className="yubi-badge yubi-badge--pending">
                {pendingPromises.length}件
              </span>
            </h2>
            <div className="yubi-column__content">
              {pendingPromises.length === 0 ? (
                <div className="yubi-empty-state">
                  <p>評価待ちの約束はありません</p>
                </div>
              ) : (
                pendingPromises.map(promise => (
                  <div
                    key={promise.id}
                    className="yubi-card yubi-card--pending"
                  >
                    <div className="yubi-card__content">{promise.content}</div>
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
