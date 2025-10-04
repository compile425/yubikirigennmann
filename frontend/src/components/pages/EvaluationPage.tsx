import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient, type ApiResponse, type PromiseItem } from '../../lib/api';
import EvaluationModal from '../modals/EvaluationModal';

const EvaluationPage = () => {
  const { id } = useParams<{ id: string }>();
  const [promise, setPromise] = useState<PromiseItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchPromise = async () => {
      if (!id) return;

      try {
        const response: ApiResponse<PromiseItem> = await apiClient.get(
          `/evaluation_pages/${id}`
        );

        if (response.error) {
          console.error('約束の取得に失敗しました:', response.error);
        } else {
          setPromise(response.data || null);
          setIsModalOpen(true);
        }
      } catch (error) {
        console.error('約束の取得エラー:', error);
      }
    };

    fetchPromise();
  }, [id]);

  const handleEvaluationSubmitted = () => {
    setIsModalOpen(false);
    // 評価完了後の処理
    window.close();
  };

  return (
    <div className="evaluation-page">
      {promise && (
        <EvaluationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          promise={promise}
          onEvaluationSubmitted={handleEvaluationSubmitted}
        />
      )}
    </div>
  );
};

export default EvaluationPage;
