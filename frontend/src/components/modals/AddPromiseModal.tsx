import React from 'react';
import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';
import type {
  PromiseType,
  CreatePromiseData,
  ApiResponse,
  PromiseItem,
} from '../../lib/api';

interface AddPromiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  promiseType: PromiseType | '';
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

  // 今日の日付をYYYY-MM-DD形式で取得
  const today = new Date().toISOString().split('T')[0];

  const isOurPromise = promiseType === 'our_promise';

  useEffect(() => {
    if (isOpen) {
      setContent('');
      setDueDate('');
    }
  }, [isOpen]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    if (!promiseType) return;

    const promiseData: CreatePromiseData = {
      content: content,
      due_date: isOurPromise ? null : dueDate || null,
      type: promiseType,
      promise_id: null,
    };

    const response: ApiResponse<PromiseItem> = await apiClient.post(
      '/promises',
      {
        promise: promiseData,
      }
    );

    if (response.error) {
      console.error('約束の作成に失敗しました:', response.error);

      let errorMessage = '約束の作成に失敗しました。';

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

    onPromiseCreated();
    onClose();
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
                  min={today}
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
