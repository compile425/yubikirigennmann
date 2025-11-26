import { useState, useEffect } from 'react';
import {
  apiClient,
  type ApiResponse,
  type EvaluatedPromise,
} from '../../lib/api';
import Sidebar from '../ui/Sidebar';
import PromiseColumn from '../ui/PromiseColumn';
import DissolvePartnershipModal from '../modals/DissolvePartnershipModal';

const PastEvaluationsPage = () => {
  const [evaluatedPromises, setEvaluatedPromises] = useState<
    EvaluatedPromise[]
  >([]);
  const [isDissolveModalOpen, setIsDissolveModalOpen] =
    useState<boolean>(false);

  useEffect(() => {
    document.documentElement.classList.add('no-scroll');
    return () => {
      document.documentElement.classList.remove('no-scroll');
    };
  }, []);

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

  useEffect(() => {
    const fetchEvaluatedPromises = async (): Promise<void> => {
      try {
        const response: ApiResponse<EvaluatedPromise[]> = await apiClient.get(
          `/evaluated-promises?year=${selectedYear}&month=${selectedMonth}`
        );

        if (response.error) {
          console.error('評価済み約束の取得に失敗しました:', response.error);
          setEvaluatedPromises([]);
        } else {
          setEvaluatedPromises(response.data || []);
        }
      } catch (error) {
        console.error('評価済み約束の取得エラー:', error);
        setEvaluatedPromises([]);
      }
    };

    fetchEvaluatedPromises();
  }, [selectedYear, selectedMonth]);

  // 約束をタイプ別に分類
  const myPromises = evaluatedPromises.filter(
    promise => promise.type === 'my_promise'
  );
  const partnerPromises = evaluatedPromises.filter(
    promise =>
      promise.type === 'partner_promise' || promise.type === 'personal_promise'
  );

  // タイトル生成
  const getTitle = (type: string) => {
    if (type === 'my_promise') {
      return 'あなたの約束';
    } else if (type === 'partner_promise' || type === 'personal_promise') {
      return 'パートナーの約束';
    }
    return '過去の約束';
  };

  // 検索ボタンのトグル（ドロップダウンの開閉のみ）
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <div className="app-wrapper app-wrapper--no-scroll">
      <Sidebar onDissolvePartnership={() => setIsDissolveModalOpen(true)} />
      <main className="board-container board-container--no-scroll">
        {/* 検索ヘッダー */}
        <div className="yubi-past-evaluations-header">
          <div className="yubi-search-section">
            <h1 className="yubi-past-evaluations-title">
              {selectedYear}年{selectedMonth}月の過去の約束
            </h1>
            <button
              onClick={toggleSearch}
              className="yubi-search-toggle-button"
              title="年月で検索"
            >
              ▼
            </button>
          </div>

          {/* 検索ドロップダウン */}
          {isSearchOpen && (
            <div className="yubi-search-dropdown">
              <div className="yubi-search-controls">
                <div className="yubi-search-field">
                  <label htmlFor="year-input">年</label>
                  <input
                    id="year-input"
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
                  <label htmlFor="month-select">月</label>
                  <select
                    id="month-select"
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
              </div>
            </div>
          )}
        </div>

        <div className="yubi-board yubi-board--past-evaluations">
          <PromiseColumn
            title={getTitle('my_promise')}
            promises={myPromises}
            onAdd={() => {}}
            showAddButton={false}
            showEvaluationButton={false}
          />

          <PromiseColumn
            title={getTitle('partner_promise')}
            promises={partnerPromises}
            onAdd={() => {}}
            showAddButton={false}
            showEvaluationButton={false}
          />
        </div>
      </main>

      <DissolvePartnershipModal
        isOpen={isDissolveModalOpen}
        onClose={() => setIsDissolveModalOpen(false)}
      />
    </div>
  );
};

export default PastEvaluationsPage;
