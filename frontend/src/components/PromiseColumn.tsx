import PostIt from './PostIt';
import type { Promise } from '../types';

interface PromiseColumnProps {
  title: string;
  promises: Promise[];
  onAdd: () => void;
  showAddButton?: boolean;
  onEdit?: (promise: Promise) => void;
  onDelete?: (promise: Promise) => void;
  onEvaluate?: (promise: Promise) => void;
  showEvaluationButton?: boolean;
}

const PromiseColumn = ({ title, promises, onAdd, showAddButton = true, onEdit, onDelete, onEvaluate, showEvaluationButton = false }: PromiseColumnProps) => {
  console.log(`PromiseColumn ${title}:`, promises);
  console.log(`PromiseColumn ${title} - promises length:`, promises.length);
  promises.forEach((promise, index) => {
    console.log(`PromiseColumn ${title} - promise ${index}:`, promise);
  });
  
  return (
    <div className="column">
      <h2 className="column-title">
        <span>{title}</span>
        {showAddButton && (
          <button onClick={onAdd} className="add-promise-button">+</button>
        )}
      </h2>
      <div className="post-it-container">
        {promises.map((promise, index) => (
          <PostIt 
            key={promise.id} 
            content={promise.content} 
            dueDate={promise.due_date}
            onEdit={onEdit ? () => onEdit(promise) : undefined}
            onDelete={onDelete ? () => onDelete(promise) : undefined}
            onEvaluate={onEvaluate && showEvaluationButton && index === 0 ? () => onEvaluate(promise) : undefined}
            showEvaluationButton={showEvaluationButton && index === 0}
          />
        ))}
      </div>
    </div>
  );
};

export default PromiseColumn;