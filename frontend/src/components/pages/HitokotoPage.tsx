import { useState, useEffect } from 'react';
import { apiClient, type ApiResponse } from '../../lib/api';
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

  const fetchOneWords = async () => {
    try {
      const response: ApiResponse<OneWord[]> =
        await apiClient.get('/one_words');

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
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOneWord.trim()) return;

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
      }
    } catch (error) {
      console.error('一言の投稿エラー:', error);
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
                />
                <button type="submit" className="yubi-hitokoto-send-button">
                  手紙を送る
                </button>
              </form>
            </div>
          </div>

          <div className="yubi-hitokoto-received-messages">
            <div className="yubi-column__header">
              <span>もらった一言</span>
            </div>
            <div className="yubi-column__content">
              {oneWords.map(word => (
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
              ))}
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
