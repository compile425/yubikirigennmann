import { useState, useEffect } from 'react';
import axios from 'axios';

interface Promise {
  id: number;
  content: string;
  due_date: string;
  type: string;
}

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  promise: Promise | null;
  onEvaluationSubmitted: () => void;
}

const EvaluationModal = ({ isOpen, onClose, promise, onEvaluationSubmitted }: EvaluationModalProps) => {
  const [evaluationText, setEvaluationText] = useState('');
  const [rating, setRating] = useState(0);
  
  useEffect(() => {
    if (isOpen) {
      setEvaluationText('');
      setRating(0);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promise) return;

    try {
      const evaluationData = {
        evaluation_text: evaluationText,
        rating: rating,
      };

      await axios.post(`http://localhost:3001/api/promises/${promise.id}/promise_evaluations`, {
        evaluation: evaluationData
      });
      
      onEvaluationSubmitted();
      onClose();

    } catch (error) {
      console.error("評価の送信に失敗しました:", error);
      alert("評価の送信に失敗しました。");
    }
  };

  const overlayClassName = isOpen ? "modal-overlay is-open" : "modal-overlay";

  return (
    <div className={overlayClassName} onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">約束を評価</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {promise && (
              <div className="promise-preview">
                <h3>評価対象の約束</h3>
                <p>{promise.content}</p>
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="evaluation-text">思ったこと</label>
              <textarea 
                id="evaluation-text" 
                placeholder="この約束について思ったことを自由に書いてください..."
                value={evaluationText}
                onChange={(e) => setEvaluationText(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>評価</label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${star <= rating ? 'filled' : ''}`}
                    onClick={() => setRating(star)}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <p className="rating-text">{rating > 0 ? `${rating}点` : '評価を選択してください'}</p>
            </div>
            
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="modal-button cancel">キャンセル</button>
            <button type="submit" className="modal-button add">評価を送信</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EvaluationModal; 