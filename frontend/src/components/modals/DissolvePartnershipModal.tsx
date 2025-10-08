import { useState } from 'react';
import { apiClient, type ApiResponse } from '../../lib/api';
import { useAuth } from '../../contexts/useAuth';

interface DissolvePartnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DissolvePartnershipModal = ({
  isOpen,
  onClose,
}: DissolvePartnershipModalProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { setToken } = useAuth();

  if (!isOpen) return null;

  const handleDissolve = async () => {
    setIsLoading(true);

    try {
      const response: ApiResponse = await apiClient.delete(
        '/partnerships/dissolve'
      );

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
    <div
      className={`yubi-modal-overlay ${isOpen ? 'yubi-modal-overlay--open' : ''}`}
      onClick={onClose}
    >
      <div
        className="yubi-modal yubi-modal--dissolve"
        onClick={e => e.stopPropagation()}
      >
        <div className="yubi-modal__header">
          <h2 className="yubi-modal__title">パートナー関係の解消</h2>
        </div>

        <div className="yubi-modal__body">
          <p>本当にパートナーとの関係を解消しますか？</p>
          <div className="yubi-dissolve-warning">
            <p>
              <strong>
                この操作を行うと、共有していた全ての約束の記録が閲覧できなくなります。
              </strong>
              この操作は元に戻せません。
            </p>
          </div>
        </div>

        <div className="yubi-modal__actions">
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
            {isLoading ? '解消中...' : 'はい、解消します'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DissolvePartnershipModal;
