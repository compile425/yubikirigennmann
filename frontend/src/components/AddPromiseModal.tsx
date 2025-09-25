import { useState, useEffect } from 'react';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface AddPromiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  promiseType: 'my_promise' | 'our_promise' | 'partner_promise' | '';
  onPromiseCreated: () => void;
}

const AddPromiseModal = ({
  isOpen,
  onClose,
  promiseType,
  onPromiseCreated,
}: AddPromiseModalProps) => {
  const [content, setContent] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');

  const isOurPromise = promiseType === 'our_promise';

  useEffect(() => {
    if (isOpen) {
      setContent('');
      setDueDate('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!promiseType) return;

    try {
      const promiseData = {
        content: content,
        due_date: isOurPromise ? null : dueDate || null,
        type: promiseType,
        promise_id: null,
      };

      await axios.post(`${API_BASE_URL}/promises`, {
        promise: promiseData,
      });

      onPromiseCreated();
      onClose();
    } catch (error) {
      console.error('約束の作成に失敗しました:', error);

      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data;
        let errorMessage = '約束の作成に失敗しました。';

        if (errorData.errors) {
          errorMessage += `\n\nエラー詳細:\n${errorData.errors.join('\n')}`;
        } else if (errorData.error) {
          errorMessage += `\n\nエラー詳細: ${errorData.error}`;
        }

        alert(errorMessage);
      } else {
        alert('約束の作成に失敗しました。');
      }
    }
  };

  const overlayClassName = isOpen
    ? 'yubi-modal-overlay yubi-modal-overlay--open'
    : 'yubi-modal-overlay';

  return (
    <div className={overlayClassName} onClick={onClose}>
      <div className="yubi-modal" onClick={e => e.stopPropagation()}>
        <div className="yubi-modal__header">
          <h2 className="yubi-modal__title">新しい約束を追加</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="yubi-modal__body">
            <div className="yubi-form-group">
              <label
                htmlFor="promise-content"
                className="yubi-form-group__label"
              >
                約束の内容
              </label>
              <textarea
                id="promise-content"
                placeholder={
                  isOurPromise
                    ? 'ふたりで守る新しい約束を入力...'
                    : '新しい約束を入力...'
                }
                value={content}
                onChange={e => setContent(e.target.value)}
                className="yubi-form-group__textarea"
                required
              />
            </div>

            {!isOurPromise && (
              <div className="yubi-form-group">
                <label
                  htmlFor="promise-deadline"
                  className="yubi-form-group__label"
                >
                  期日
                </label>
                <input
                  type="date"
                  id="promise-deadline"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="yubi-form-group__input"
                />
              </div>
            )}
          </div>
          <div className="yubi-modal__footer">
            <button
              type="button"
              onClick={onClose}
              className="yubi-button yubi-button--cancel"
            >
              キャンセル
            </button>
            <button type="submit" className="yubi-button yubi-button--primary">
              追加する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPromiseModal;
