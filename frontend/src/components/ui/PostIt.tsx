import React from 'react';

interface PostItProps {
  content: string;
  dueDate: string;
  rating?: number;
  evaluationText?: string;
  evaluationDate?: string;
  promiseType?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onEvaluate?: () => void;
  showEvaluationButton?: boolean;
  isPickup?: boolean;
}

const PostIt = ({
  content,
  dueDate,
  rating,
  evaluationText,
  evaluationDate,
  // promiseType, // 未使用のためコメントアウト
  onEdit,
  onDelete,
  onEvaluate,
  showEvaluationButton = false,
  isPickup = false,
}: PostItProps) => {
  const renderStars = (ratingValue: number): React.JSX.Element => {
    return (
      <div className="yubi-rating-display">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`yubi-star-display ${star <= ratingValue ? 'yubi-star-display--filled' : ''}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className={`yubi-card ${isPickup ? 'yubi-card--pickup' : ''}`}>
      {isPickup && <div className="yubi-pickup-header">Pick Up!</div>}
      {content}
      <footer className="yubi-card__footer">
        <div className="yubi-actions">
          {onEdit && (
            <a
              href="#"
              className="yubi-action-button"
              onClick={e => {
                e.preventDefault();
                onEdit();
              }}
            >
              <span className="material-symbols-outlined">edit</span>
            </a>
          )}
          {onDelete && (
            <a
              href="#"
              className="yubi-action-button"
              onClick={e => {
                e.preventDefault();
                onDelete();
              }}
            >
              <span className="material-symbols-outlined">delete</span>
            </a>
          )}
          {onEvaluate && showEvaluationButton && !isPickup && (
            <a
              href="#"
              className="yubi-action-button"
              onClick={e => {
                e.preventDefault();
                onEvaluate();
              }}
            >
              <span className="material-symbols-outlined">kid_star</span>
            </a>
          )}
        </div>
        <div className="yubi-card__info">
          {evaluationText && (
            <div className="yubi-evaluation-comment-section">
              <h4 className="yubi-evaluation-comment-title">評価コメント</h4>
              <div className="yubi-evaluation-comment">
                <p className="yubi-evaluation-text">{evaluationText}</p>
              </div>
            </div>
          )}
          <div className="yubi-card__bottom-row">
            <div className="yubi-card__bottom-left">
              {rating && renderStars(rating)}
            </div>
            {(rating || evaluationDate) && (
              <div className="yubi-card__bottom-right">
                <span>
                  評価日:{' '}
                  {evaluationDate
                    ? new Date(evaluationDate).toLocaleDateString('ja-JP')
                    : dueDate || 'なし'}
                </span>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PostIt;
