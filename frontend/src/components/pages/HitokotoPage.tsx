import { useState, useEffect } from 'react';
import { apiClient, type ApiResponse } from '../../lib/api';
import Sidebar from '../ui/Sidebar';
import DissolvePartnershipModal from '../modals/DissolvePartnershipModal';
import { useAuth } from '../../contexts/useAuth';

interface OneWord {
  id: number;
  content: string;
  created_at: string;
}

const HitokotoPage = () => {
  const [oneWords, setOneWords] = useState<OneWord[]>([]);
  const [newOneWord, setNewOneWord] = useState<string>('');
  const [isDissolveModalOpen, setIsDissolveModalOpen] = useState<boolean>(false);
  const { partner } = useAuth();

  const fetchOneWords = async () => {
    try {
      const response: ApiResponse<OneWord[]> = await apiClient.get('/one_words');

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
      const response: ApiResponse<OneWord> = await apiClient.post('/one_words', {
        content: newOneWord,
      });

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
    <div className="yubi-app">
      <Sidebar />
      <main className="yubi-main">
        <div className="hitokoto-page">
          <h1>ちょっと一言</h1>
          
          <form onSubmit={handleSubmit} className="hitokoto-form">
            <textarea
              value={newOneWord}
              onChange={(e) => setNewOneWord(e.target.value)}
              placeholder="パートナーに一言メッセージを送りましょう"
              className="hitokoto-textarea"
              rows={3}
            />
            <button type="submit" className="yubi-button yubi-button--primary">
              送信
            </button>
          </form>

          <div className="hitokoto-list">
            {oneWords.map((word) => (
              <div key={word.id} className="hitokoto-item">
                <p>{word.content}</p>
                <small>{new Date(word.created_at).toLocaleString()}</small>
              </div>
            ))}
          </div>

          {partner && (
            <button
              onClick={() => setIsDissolveModalOpen(true)}
              className="yubi-button yubi-button--danger"
            >
              パートナーシップを解除
            </button>
          )}
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
