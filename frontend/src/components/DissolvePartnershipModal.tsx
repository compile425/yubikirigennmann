import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/useAuth';

interface DissolvePartnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DissolvePartnershipModal = ({
  isOpen,
  onClose,
}: DissolvePartnershipModalProps) => {
  const [isDissolving, setIsDissolving] = useState(false);
  const { token } = useAuth();

  const handleDissolvePartnership = async () => {
    if (
      !confirm(
        '本当にパートナーとの関係を解消しますか？\n\nこの操作を行うと、共有していた全ての約束の記録が閲覧できなくなります。\nこの操作は元に戻せません。'
      )
    ) {
      return;
    }

    setIsDissolving(true);

    try {
      await axios.delete('http://localhost:3001/api/partnerships/dissolve', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert('パートナーシップを解消しました');
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('パートナーシップ解消エラー:', error);
      if (axios.isAxiosError(error) && error.response) {
        alert(
          error.response.data.error || 'パートナーシップの解消に失敗しました'
        );
      } else {
        alert('パートナーシップの解消に失敗しました');
      }
    } finally {
      setIsDissolving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="yubi-modal-overlay">
      <div className="yubi-modal yubi-modal--dissolve">
        <div className="yubi-modal__header">
          <h2>パートナー関係の解消</h2>
        </div>

        <div className="yubi-modal__content">
          <div className="yubi-dissolve-warning">
            <p>本当にパートナーとの関係を解消しますか？</p>
            <p className="yubi-dissolve-warning__danger">
              この操作を行うと、共有していた全ての約束の記録が閲覧できなくなります。
              <br />
              この操作は元に戻せません。
            </p>
          </div>

          <div className="yubi-modal__actions">
            <button
              type="button"
              onClick={onClose}
              disabled={isDissolving}
              className="yubi-button yubi-button--secondary"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleDissolvePartnership}
              disabled={isDissolving}
              className="yubi-button yubi-button--danger"
            >
              {isDissolving ? '解消中...' : 'はい、解消します'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DissolvePartnershipModal;
