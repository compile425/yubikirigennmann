import React from 'react';
import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';
import type { ApiResponse, EvaluationData } from '../../lib/api';

// 評価可能な約束の共通プロパティを定義
interface EvaluablePromise {
  id: number;
  content: string;
}

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  promise: EvaluablePromise | null;
  onEvaluationSubmitted: () => void;
}

const EvaluationModal = ({
  isOpen,
  onClose,
  promise,
  onEvaluationSubmitted,
}: EvaluationModalProps) => {
  const [rating, setRating] = useState<number>(0);
  const [evaluationText, setEvaluationText] = useState<string>('');
  const [hoveredRating, setHoveredRating] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setEvaluationText('');
      setHoveredRating(0);
    }
  }, [isOpen]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    if (!promise || rating === 0) return;

    const evaluationData: EvaluationData = {
      rating: rating,
      evaluation_text: evaluationText,
    };

    const response: ApiResponse = await apiClient.post(
      `/promises/${promise.id}/promise_evaluations`,
      {
        evaluation: evaluationData,
      }
    );

    if (response.error) {
      console.error('評価の送信に失敗しました:', response.error);

      let errorMessage = '評価の送信に失敗しました。';

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

    onEvaluationSubmitted();
    onClose();
  };

  const overlayClassName = isOpen
    ? 'yubi-modal-overlay yubi-modal-overlay--open'
    : 'yubi-modal-overlay';

  return (
    <div className={overlayClassName} onClick={onClose}>
      <div className="yubi-modal" onClick={e => e.stopPropagation()}>
        <div className="yubi-modal__header">
          <h2 className="yubi-modal__title">約束を評価</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="yubi-modal__body">
            <div className="yubi-form-group">
              <label className="yubi-form-group__label">約束の内容</label>
              <p className="yubi-evaluation__promise-content">
                {promise?.content}
              </p>
            </div>

            <div className="yubi-form-group">
              <label className="yubi-form-group__label">評価</label>
              <div className="yubi-rating">
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    className={`yubi-star ${star <= (hoveredRating || rating) ? 'yubi-star--filled' : ''}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    style={{ cursor: 'pointer' }}
                  >
                    ★
                  </span>
                ))}
              </div>
              {rating > 0 && (
                <p className="yubi-rating-text">評価: {rating} / 5</p>
              )}
            </div>

            <div className="yubi-form-group">
              <label
                htmlFor="evaluation-text"
                className="yubi-form-group__label"
              >
                評価コメント
              </label>
              <textarea
                id="evaluation-text"
                placeholder="評価コメントを入力..."
                value={evaluationText}
                onChange={e => setEvaluationText(e.target.value)}
                className="yubi-form-group__textarea"
              />
            </div>
          </div>
          <div className="yubi-modal__footer">
            <button
              type="button"
              onClick={onClose}
              className="yubi-button yubi-button--cancel"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="yubi-button yubi-button--primary"
              disabled={rating === 0}
            >
              評価を送信
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EvaluationModal;
