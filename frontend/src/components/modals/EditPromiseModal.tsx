import React from 'react';
import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';
import type { PromiseItem, ApiResponse } from '../../lib/api';

interface EditPromiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  promise: PromiseItem | null;
  onPromiseUpdated: () => void;
}

const EditPromiseModal = ({
  isOpen,
  onClose,
  promise,
  onPromiseUpdated,
}: EditPromiseModalProps) => {
  const [content, setContent] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');

  // 今日の日付をYYYY-MM-DD形式で取得
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (promise && isOpen) {
      setContent(promise.content);
      setDueDate(promise.due_date || '');
    }
  }, [promise, isOpen]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    if (!promise) return;

    const response: ApiResponse<PromiseItem> = await apiClient.put(
      `/promises/${promise.id}`,
      {
        promise: {
          content: content,
          due_date: dueDate || null,
        },
      }
    );

    if (response.error) {
      console.error('約束の更新に失敗しました:', response.error);

      let errorMessage = '約束の更新に失敗しました。';

      if (response.error.errors && response.error.errors.length > 0) {
        errorMessage += `\n\nエラー詳細:\n${response.error.errors.join('\n')}`;
      } else if (response.error.error) {
        errorMessage += `\n\nエラー詳細: ${response.error.error}`;
      } else if (response.error.message) {
        errorMessage += `\n\nエラー詳細: ${response.error.message}`;
      }

      alert(errorMessage);
      return;
    }

    onPromiseUpdated();
    onClose();
  };

  const overlayClassName = isOpen
    ? 'yubi-modal-overlay yubi-modal-overlay--open'
    : 'yubi-modal-overlay';

  return (
    <div className={overlayClassName} onClick={onClose}>
      <div className="yubi-modal" onClick={e => e.stopPropagation()}>
        <div className="yubi-modal__header">
          <h2 className="yubi-modal__title">約束を編集</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="yubi-modal__body">
            <div className="yubi-form-group">
              <label
                htmlFor="edit-promise-content"
                className="yubi-form-group__label"
              >
                約束の内容
              </label>
              <textarea
                id="edit-promise-content"
                placeholder="約束の内容を入力..."
                value={content}
                onChange={e => setContent(e.target.value)}
                className="yubi-form-group__textarea"
                required
              />
            </div>

            <div className="yubi-form-group">
              <label
                htmlFor="edit-promise-deadline"
                className="yubi-form-group__label"
              >
                期日
              </label>
              <input
                type="date"
                id="edit-promise-deadline"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="yubi-form-group__input"
                min={today}
              />
            </div>
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
              更新する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPromiseModal;
