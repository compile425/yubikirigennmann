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
}

const PostIt = ({
  content,
  dueDate,
  rating,
  evaluationText,
  evaluationDate,
  promiseType,
  onEdit,
  onDelete,
  onEvaluate,
  showEvaluationButton = false,
}: PostItProps) => {
  console.log('PostIt rendering with:', {
    content,
    dueDate,
    rating,
    evaluationText,
    evaluationDate,
  });

  const renderStars = (ratingValue: number): React.JSX.Element => {
    console.log('Rendering stars for rating:', ratingValue);
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
    <div className="yubi-card">
      {content}
      {evaluationText && (
        <div className="yubi-evaluation-comment">
          <p className="yubi-evaluation-text">"{evaluationText}"</p>
        </div>
      )}
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
              ✏️
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
              🗑️
            </a>
          )}
          {onEvaluate && showEvaluationButton && (
            <a
              href="#"
              className="yubi-action-button"
              onClick={e => {
                e.preventDefault();
                onEvaluate();
              }}
            >
              ⭐
            </a>
          )}
        </div>
        <div className="yubi-card__info">
          <div className="yubi-card__bottom-left">
            {rating && renderStars(rating)}
          </div>
          {promiseType !== 'our_promise' && (
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
      </footer>
    </div>
  );
};

export default PostIt;
