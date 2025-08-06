
interface PostItProps {
  content: string;
  dueDate: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onEvaluate?: () => void;
  showEvaluationButton?: boolean;
}

const PostIt: React.FC<PostItProps> = ({ content, dueDate, onEdit, onDelete, onEvaluate, showEvaluationButton = false }) => {
  console.log('PostIt rendering with:', { content, dueDate });
  
  return (
    <div className="post-it">
      {content}
      <footer className="post-it-footer">
        <div className="card-actions">
          {onEdit && (
            <a href="#" className="action-button" onClick={(e) => { e.preventDefault(); onEdit(); }}>✏️</a>
          )}
          {onDelete && (
            <a href="#" className="action-button" onClick={(e) => { e.preventDefault(); onDelete(); }}>🗑️</a>
          )}
          {onEvaluate && showEvaluationButton && (
            <a href="#" className="action-button" onClick={(e) => { e.preventDefault(); onEvaluate(); }}>⭐</a>
          )}
        </div>
        <span>期限: {dueDate || 'なし'}</span>
      </footer>
    </div>
  );
};

export default PostIt;