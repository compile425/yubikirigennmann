import { useState, useEffect } from 'react';
import axios from 'axios';

interface Promise {
  id: number;
  content: string;
  due_date: string;
  type: string;
}

interface EditPromiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  promise: Promise | null;
  onPromiseUpdated: () => void;
}

const EditPromiseModal = ({ isOpen, onClose, promise, onPromiseUpdated }: EditPromiseModalProps) => {
  const [content, setContent] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  useEffect(() => {
    if (isOpen && promise) {
      setContent(promise.content);
      setDueDate(promise.due_date || '');
    }
  }, [isOpen, promise]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promise) return;

    try {
      const promiseData = {
        content: content,
        due_date: dueDate || null,
      };

      await axios.put(`http://localhost:3001/api/promises/${promise.id}`, {
        promise: promiseData
      });
      
      onPromiseUpdated();
      onClose();

    } catch (error) {
      console.error("約束の更新に失敗しました:", error);
      alert("約束の更新に失敗しました。");
    }
  };

  const overlayClassName = isOpen ? "modal-overlay is-open" : "modal-overlay";

  return (
    <div className={overlayClassName} onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">約束を編集</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="promise-content">約束の内容</label>
              <textarea 
                id="promise-content" 
                placeholder="約束の内容を入力..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="promise-deadline">期日</label>
              <input 
                type="date"
                id="promise-deadline"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="modal-button cancel">キャンセル</button>
            <button type="submit" className="modal-button add">更新する</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPromiseModal; 