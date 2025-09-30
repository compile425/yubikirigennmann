import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import DissolvePartnershipModal from './DissolvePartnershipModal';
import { useAuth } from '../contexts/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface Message {
  id: number;
  content: string;
  created_at: string;
  sender_name: string;
}

const HitokotoPage = () => {
  const { partner } = useAuth();
  const [isDissolveModalOpen, setIsDissolveModalOpen] =
    useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [receivedMessages, setReceivedMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState<boolean>(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async (): Promise<void> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/one_words`);
      setReceivedMessages(response.data);
    } catch (error) {
      console.error('メッセージの取得に失敗しました:', error);
    }
  };

  const handleSendMessage = async (): Promise<void> => {
    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      await axios.post(`${API_BASE_URL}/one_words`, {
        one_word: {
          content: message,
        },
      });
      setMessage('');
      alert('手紙を送信しました！');
      await fetchMessages();
    } catch (error) {
      console.error('メッセージの送信に失敗しました:', error);
      alert('メッセージの送信に失敗しました。');
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="yubi-app">
      <Sidebar onDissolvePartnership={() => setIsDissolveModalOpen(true)} />

      <main className="yubi-main">
        <div className="yubi-hitokoto-container">
          <div className="yubi-form-section">
            <div className="yubi-column__header">
              <h2 className="yubi-column__title">
                {partner?.name || 'パートナー'}へメッセージを送る
              </h2>
            </div>
            <div className="yubi-form-panel">
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="日頃の感謝や、ふと思ったことを手紙に書いてみよう..."
              />
              <button
                type="button"
                className="yubi-send-button"
                onClick={handleSendMessage}
                disabled={isSending || !message.trim()}
              >
                {isSending ? '送信中...' : '手紙を送る'}
              </button>
            </div>
          </div>

          <div className="yubi-received-messages">
            <div className="yubi-column__header">
              <h2 className="yubi-column__title">もらった一言</h2>
            </div>
            <div className="yubi-column__content">
              {receivedMessages.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999' }}>
                  まだメッセージがありません
                </p>
              ) : (
                receivedMessages.map(msg => (
                  <div key={msg.id} className="yubi-card">
                    <div className="yubi-card__content">{msg.content}</div>
                    <footer className="yubi-card__footer">
                      {formatDate(msg.created_at)}
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
