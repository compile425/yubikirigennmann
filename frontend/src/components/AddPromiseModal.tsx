import { useState, useEffect } from 'react';
import axios from 'axios';

interface AddPromiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  promiseType: 'my_promise' | 'our_promise' | 'partner_promise' | '';
  onPromiseCreated: () => void;
}

const AddPromiseModal = ({ isOpen, onClose, promiseType, onPromiseCreated }: AddPromiseModalProps) => {
  const [content, setContent] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  const isOurPromise = promiseType === 'our_promise';

  useEffect(() => {
    if (isOpen) {
      setContent('');
      setDueDate('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promiseType) return;

    try {
      const promiseData = {
        content: content,
        due_date: isOurPromise ? null : (dueDate || null),
        type: promiseType,
        promise_id: null,
      };

      await axios.post('http://localhost:3001/api/promises', {
        promise: promiseData
      });

      onPromiseCreated();
      onClose();

    } catch (error) {
      console.error("約束の作成に失敗しました:", error);
      alert("約束の作成に失敗しました。");
    }
  };

  const overlayClassName = isOpen ? "modal-overlay is-open" : "modal-overlay";

  return (
    <div className={overlayClassName} onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">新しい約束を追加</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="promise-content">約束の内容</label>
              <textarea 
                id="promise-content" 
                placeholder={isOurPromise ? "ふたりで守る新しい約束を入力..." : "新しい約束を入力..."}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
            
            {!isOurPromise && (
              <div className="form-group">
                <label htmlFor="promise-deadline">期日</label>
                <input 
                  type="date"
                  id="promise-deadline"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            )}
            
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="modal-button cancel">キャンセル</button>
            <button type="submit" className="modal-button add">追加する</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPromiseModal;