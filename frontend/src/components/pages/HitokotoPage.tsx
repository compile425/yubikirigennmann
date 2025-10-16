import { useState, useEffect } from 'react';
import { apiClient, type ApiResponse } from '../../lib/api';
import { useHitokotoNotification } from '../../contexts/HitokotoNotificationContext';
import Sidebar from '../ui/Sidebar';
import DissolvePartnershipModal from '../modals/DissolvePartnershipModal';

interface OneWord {
  id: number;
  content: string;
  created_at: string;
}

const HitokotoPage = () => {
  const [oneWords, setOneWords] = useState<OneWord[]>([]);
  const [newOneWord, setNewOneWord] = useState<string>('');
  const [isDissolveModalOpen, setIsDissolveModalOpen] =
    useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const { resetVisitStatus } = useHitokotoNotification();

  // 検索用のステート
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(
    currentDate.getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    currentDate.getMonth() + 1
  );
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // 月の選択肢
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const fetchOneWords = async () => {
    try {
      const response: ApiResponse<OneWord[]> = await apiClient.get(
        `/one_words?year=${selectedYear}&month=${selectedMonth}`
      );

      if (response.error) {
        console.error('一言の取得に失敗しました:', response.error);
      } else {
        setOneWords(response.data || []);
      }
    } catch (error) {
      console.error('一言の取得エラー:', error);
    }
  };

  useEffect(() => {
    fetchOneWords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedMonth]);

  // 検索ボタンのトグル
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  // 検索実行
  const handleSearch = () => {
    setIsSearchOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOneWord.trim()) return;

    setIsSubmitting(true);
    setShowSuccessMessage(false);

    try {
      const response: ApiResponse<OneWord> = await apiClient.post(
        '/one_words',
        {
          content: newOneWord,
        }
      );

      if (response.error) {
        console.error('一言の投稿に失敗しました:', response.error);
      } else {
        setNewOneWord('');
        fetchOneWords();
        setShowSuccessMessage(true);

        // 一言を送信したら通知フラグをリセット
        resetVisitStatus();

        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
      }
    } catch (error) {
      console.error('一言の投稿エラー:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-wrapper">
      <Sidebar />
      <main className="board-container">
        <div className="yubi-hitokoto-container">
          <div className="yubi-hitokoto-form-section">
            <div className="yubi-column__header">
              <span>パートナーへメッセージを送る</span>
            </div>
            <div className="yubi-hitokoto-form-panel">
              <form onSubmit={handleSubmit}>
                <textarea
                  value={newOneWord}
                  onChange={e => setNewOneWord(e.target.value)}
                  placeholder="日頃の感謝や、ふと思ったことを手紙に書いてみよう..."
                  rows={3}
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  className="yubi-hitokoto-send-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '送信中...' : '手紙を送る'}
                </button>
              </form>

              {showSuccessMessage && (
                <div className="yubi-hitokoto-success-message">
                  手紙を送りました！
                </div>
              )}
            </div>
          </div>

          <div className="yubi-hitokoto-received-messages">
            <div className="yubi-past-evaluations-header">
              <div className="yubi-search-section">
                <h1 className="yubi-past-evaluations-title">
                  {selectedYear}年{selectedMonth}月のもらった一言
                </h1>
                <button
                  onClick={toggleSearch}
                  className="yubi-search-toggle-button"
                  title="年月で検索"
                >
                  ▼
                </button>
              </div>
              {isSearchOpen && (
                <div className="yubi-search-dropdown">
                  <div className="yubi-search-controls">
                    <div className="yubi-search-field">
                      <label htmlFor="hitokoto-year-input">年</label>
                      <input
                        id="hitokoto-year-input"
                        type="number"
                        value={selectedYear}
                        onChange={e => setSelectedYear(Number(e.target.value))}
                        className="yubi-search-input"
                        min="2025"
                        max="2125"
                        placeholder="2025"
                      />
                    </div>
                    <div className="yubi-search-field">
                      <label htmlFor="hitokoto-month-select">月</label>
                      <select
                        id="hitokoto-month-select"
                        value={selectedMonth}
                        onChange={e => setSelectedMonth(Number(e.target.value))}
                        className="yubi-search-select"
                      >
                        {months.map(month => (
                          <option key={month} value={month}>
                            {month}月
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={handleSearch}
                      className="yubi-button yubi-button--primary yubi-search-apply-button"
                    >
                      検索
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="yubi-column__content">
              {oneWords.length === 0 ? (
                <div className="yubi-empty-message">
                  もらった一言はありません
                </div>
              ) : (
                oneWords.map(word => (
                  <div key={word.id} className="yubi-card">
                    {word.content}
                    <footer className="yubi-card__footer">
                      {new Date(word.created_at)
                        .toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })
                        .replace(/\//g, '.')}
                    </footer>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <DissolvePartnershipModal
        isOpen={isDissolveModalOpen}
        onClose={() => setIsDissolveModalOpen(false)}
      />
    </div>
  );
};

export default HitokotoPage;
