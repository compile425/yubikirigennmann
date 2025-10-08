import PostIt from './PostIt';
import type { PromiseItem } from '../../lib/api';

interface PromiseColumnProps {
  title: string;
  promises: PromiseItem[];
  onAdd: () => void;
  showAddButton?: boolean;
  onEdit?: (promise: PromiseItem) => void;
  onDelete?: (promise: PromiseItem) => void;
  onEvaluate?: (promise: PromiseItem) => void;
  showEvaluationButton?: boolean;
  currentUserId?: number;
}

const PromiseColumn = ({
  title,
  promises,
  onAdd,
  showAddButton = true,
  onEdit,
  onDelete,
  onEvaluate,
  showEvaluationButton = false,
  // currentUserId, // 現在未使用のためコメントアウト
}: PromiseColumnProps) => {
  console.log(`PromiseColumn ${title}:`, promises);
  console.log(`PromiseColumn ${title} - promises length:`, promises.length);
  promises.forEach((promise, index) => {
    console.log(`PromiseColumn ${title} - promise ${index}:`, promise);
  });

  // 今週評価するふたりの約束を判定する関数
  const isWeeklyEvaluationTarget = (
    promise: PromiseItem,
    index: number
  ): boolean => {
    // ふたりの約束で、一番上（index === 0）で、評価ボタンが表示される場合
    return (
      promise.type === 'our_promise' &&
      index === 0 &&
      showEvaluationButton &&
      !!onEvaluate
    );
  };

  return (
    <div className="yubi-column">
      <h2 className="yubi-column__header">
        <span>{title}</span>
        {showAddButton && (
          <button onClick={onAdd} className="yubi-button yubi-button--add">
            +
          </button>
        )}
      </h2>
      <div className="yubi-column__content">
        {promises.map((promise, index) => (
          <PostIt
            key={promise.id}
            content={promise.content}
            dueDate={promise.due_date}
            rating={promise.rating}
            evaluationText={promise.evaluation_text}
            evaluationDate={promise.evaluation_date}
            promiseType={promise.type}
            onEdit={onEdit ? () => onEdit(promise) : undefined}
            onDelete={onDelete ? () => onDelete(promise) : undefined}
            onEvaluate={
              onEvaluate && showEvaluationButton && index === 0
                ? () => onEvaluate(promise)
                : undefined
            }
            showEvaluationButton={showEvaluationButton && index === 0}
            isPickup={isWeeklyEvaluationTarget(promise, index)}
          />
        ))}
      </div>
    </div>
  );
};

export default PromiseColumn;
