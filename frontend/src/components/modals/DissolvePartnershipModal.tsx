import { useState } from 'react';
import { apiClient, type ApiResponse } from '../../lib/api';
import { useAuth } from '../../contexts/useAuth';

interface DissolvePartnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DissolvePartnershipModal = ({ isOpen, onClose }: DissolvePartnershipModalProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { setToken } = useAuth();

  if (!isOpen) return null;

  const handleDissolve = async () => {
    if (!confirm('本当にパートナーシップを解消しますか？この操作は元に戻せません。')) {
      return;
    }

    setIsLoading(true);

    try {
      const response: ApiResponse = await apiClient.delete('/partnerships/dissolve');

      if (response.error) {
        console.error('パートナーシップ解消に失敗しました:', response.error);
        alert('パートナーシップ解消に失敗しました。');
      } else {
        alert('パートナーシップを解消しました。');
        setToken(null); // ログアウト
        onClose();
      }
    } catch (error) {
      console.error('パートナーシップ解消エラー:', error);
      alert('パートナーシップ解消に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>パートナーシップの解消</h2>
        <p>
          パートナーシップを解消すると、すべての約束と評価データが削除され、
          この操作は元に戻すことができません。
        </p>
        <p>本当に解消しますか？</p>
        
        <div className="modal-actions">
          <button
            onClick={onClose}
            className="yubi-button yubi-button--secondary"
            disabled={isLoading}
          >
            キャンセル
          </button>
          <button
            onClick={handleDissolve}
            className="yubi-button yubi-button--danger"
            disabled={isLoading}
          >
            {isLoading ? '解消中...' : '解消する'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DissolvePartnershipModal;
