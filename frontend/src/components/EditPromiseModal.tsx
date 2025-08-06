import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Promise } from '../types';

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
    if (promise && isOpen) {
      setContent(promise.content);
      setDueDate(promise.due_date || '');
    }
  }, [promise, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promise) return;

    try {
      await axios.put(`http://localhost:3001/api/promises/${promise.id}`, {
        promise: {
          content: content,
          due_date: dueDate || null,
        }
      });

      onPromiseUpdated();
      onClose();

    } catch (error) {
      console.error("約束の更新に失敗しました:", error);
      alert("約束の更新に失敗しました。");
    }
  };

  const overlayClassName = isOpen ? "yubi-modal-overlay yubi-modal-overlay--open" : "yubi-modal-overlay";

  return (
    <div className={overlayClassName} onClick={onClose}>
      <div className="yubi-modal" onClick={(e) => e.stopPropagation()}>
        <div className="yubi-modal__header">
          <h2 className="yubi-modal__title">約束を編集</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="yubi-modal__body">
            <div className="yubi-form-group">
              <label htmlFor="edit-promise-content" className="yubi-form-group__label">約束の内容</label>
              <textarea 
                id="edit-promise-content" 
                placeholder="約束の内容を入力..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="yubi-form-group__textarea"
                required
              />
            </div>
            
            <div className="yubi-form-group">
              <label htmlFor="edit-promise-deadline" className="yubi-form-group__label">期日</label>
              <input 
                type="date"
                id="edit-promise-deadline"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="yubi-form-group__input"
              />
            </div>
            
          </div>
          <div className="yubi-modal__footer">
            <button type="button" onClick={onClose} className="yubi-button yubi-button--cancel">キャンセル</button>
            <button type="submit" className="yubi-button yubi-button--primary">更新する</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPromiseModal; 