import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../lib/api';
import Sidebar from '../ui/Sidebar';
import PromiseColumn from '../ui/PromiseColumn';
import AddPromiseModal from '../modals/AddPromiseModal';
import EditPromiseModal from '../modals/EditPromiseModal';
import EvaluationModal from '../modals/EvaluationModal';
import DissolvePartnershipModal from '../modals/DissolvePartnershipModal';
import type { PromiseItem, ApiResponse } from '../../lib/api';
import { useAuth } from '../../contexts/useAuth';

const Dashboard = () => {
  const [promises, setPromises] = useState<PromiseItem[]>([]);
  const { token, currentUser, partner } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] =
    useState<boolean>(false);
  const [isDissolveModalOpen, setIsDissolveModalOpen] =
    useState<boolean>(false);
  const [selectedPromise, setSelectedPromise] = useState<PromiseItem | null>(
    null
  );
  const [promiseTypeToAdd, setPromiseTypeToAdd] = useState<
    'my_promise' | 'our_promise' | 'partner_promise' | ''
  >('');

  const fetchPromises = useCallback(async () => {
    if (!token) return;

    try {
      const response: ApiResponse<PromiseItem[]> =
        await apiClient.get('/promises');
      if (response.error) {
        console.error('約束の取得に失敗しました:', response.error);
        setPromises([]);
      } else {
        setPromises(response.data || []);
      }
    } catch (error) {
      console.error('約束の取得エラー:', error);
      setPromises([]);
    }
  }, [token]);

  useEffect(() => {
    fetchPromises();
  }, [fetchPromises]);

  const handleOpenModal = (
    type: 'my_promise' | 'our_promise' | 'partner_promise'
  ): void => {
    setPromiseTypeToAdd(type);
    setIsModalOpen(true);
  };

  const handlePromiseCreated = async (): Promise<void> => {
    await fetchPromises();
  };

  const handleEditPromise = (promise: PromiseItem): void => {
    setSelectedPromise(promise);
    setIsEditModalOpen(true);
  };

  const handleDeletePromise = async (promise: PromiseItem): Promise<void> => {
    if (!confirm('この約束を削除しますか？')) {
      return;
    }

    const response: ApiResponse = await apiClient.delete(
      `/promises/${promise.id}`
    );

    if (response.error) {
      console.error('約束の削除に失敗しました:', response.error);

      let errorMessage = '約束の削除に失敗しました。';

      if (response.error.errors && response.error.errors.length > 0) {
        errorMessage += `\n\nエラー詳細:\n${response.error.errors.join('\n')}`;
      } else if (response.error.error) {
        errorMessage += `\n\nエラー詳細: ${response.error.error}`;
      } else if (response.error.message) {
        errorMessage += `\n\nエラー詳細: ${response.error.message}`;
      }

      alert(errorMessage);
      return;
    }

    await fetchPromises();
  };

  const handlePromiseUpdated = async (): Promise<void> => {
    await fetchPromises();
  };

  const handleOpenEvaluationModal = (promise: PromiseItem): void => {
    setSelectedPromise(promise);
    setIsEvaluationModalOpen(true);
  };

  const handleEvaluationSubmitted = async (): Promise<void> => {
    await fetchPromises();
  };

  const myPromisesTitle = currentUser
    ? `${currentUser.name}の約束`
    : 'わたしの約束';
  const partnerPromisesTitle = partner
    ? `${partner.name}の約束`
    : 'パートナーの約束';

  const myPromises = promises.filter(p => {
    console.log('Filtering promise:', p);
    console.log('Current user ID:', currentUser?.id);
    console.log('Promise creator_id:', p.creator_id);
    console.log('Is match:', currentUser && p.creator_id === currentUser.id);
    return currentUser && p.creator_id === currentUser.id;
  });
  const partnerPromises = promises.filter(
    p => partner && p.creator_id === partner.id
  );
  const ourPromises = promises.filter(p => p.type === 'our_promise');

  return (
    <div className="yubi-app">
      <Sidebar onDissolvePartnership={() => setIsDissolveModalOpen(true)} />

      <main className="yubi-main">
        <div className="yubi-board">
          <PromiseColumn
            title={myPromisesTitle}
            promises={myPromises}
            onAdd={() => handleOpenModal('my_promise')}
            showAddButton={true}
            onEdit={handleEditPromise}
            onDelete={handleDeletePromise}
          />
          <PromiseColumn
            title="ふたりの約束"
            promises={ourPromises}
            onAdd={() => handleOpenModal('our_promise')}
            showAddButton={true}
            onEdit={handleEditPromise}
            onDelete={handleDeletePromise}
            onEvaluate={handleOpenEvaluationModal}
            showEvaluationButton={true}
          />
          <PromiseColumn
            title={partnerPromisesTitle}
            promises={partnerPromises}
            onAdd={() => handleOpenModal('partner_promise')}
            showAddButton={false}
            onEdit={handleEditPromise}
            onDelete={handleDeletePromise}
          />
        </div>
      </main>

      <AddPromiseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        promiseType={promiseTypeToAdd}
        onPromiseCreated={handlePromiseCreated}
      />

      <EditPromiseModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        promise={selectedPromise}
        onPromiseUpdated={handlePromiseUpdated}
      />

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

export default Dashboard;
