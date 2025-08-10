import { useState, useEffect } from 'react';
import axios from 'axios';
import type { PromiseItem } from '../types';

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  promise: PromiseItem | null;
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

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!promise || rating === 0) return;

    try {
      await axios.post(
        `http://localhost:3001/api/promises/${promise.id}/promise_evaluations`,
        {
          evaluation: {
            rating: rating,
            evaluation_text: evaluationText,
          },
        }
      );

      onEvaluationSubmitted();
      onClose();
    } catch (error) {
      console.error('評価の送信に失敗しました:', error);
      alert('評価の送信に失敗しました。');
    }
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
