import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import PromiseColumn from './PromiseColumn';
import AddPromiseModal from './AddPromiseModal';
import EditPromiseModal from './EditPromiseModal';
import EvaluationModal from './EvaluationModal';
import type { Promise } from '../types';
import { useAuth } from '../contexts/useAuth';

const Dashboard = () => {
  const [promises, setPromises] = useState<Promise[]>([]);
  const { token, currentUser, partner } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [selectedPromise, setSelectedPromise] = useState<Promise | null>(null);
  const [promiseTypeToAdd, setPromiseTypeToAdd] = useState<'my_promise' | 'our_promise' | 'partner_promise' | ''>('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const fetchPromises = async () => {
    if (!token) return;
    try {
      const response = await axios.get('http://localhost:3001/api/promises');
      setPromises(response.data);
    } catch (error) {
      console.error("約束の取得に失敗しました:", error);
    }
  };

  useEffect(() => {
    fetchPromises();
  }, [token]);

  const handleOpenModal = (type: 'my_promise' | 'our_promise' | 'partner_promise') => {
    setPromiseTypeToAdd(type);
    setIsModalOpen(true);
  };

  const handlePromiseCreated = async () => {
    // 新しい約束を作成した後に、約束の一覧を再取得
    await fetchPromises();
  };

  const handleEditPromise = (promise: Promise) => {
    setSelectedPromise(promise);
    setIsEditModalOpen(true);
  };

  const handleDeletePromise = async (promise: Promise) => {
    if (!confirm('この約束を削除しますか？')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3001/api/promises/${promise.id}`);
      await fetchPromises();
    } catch (error) {
      console.error("約束の削除に失敗しました:", error);
      alert("約束の削除に失敗しました。");
    }
  };

  const handlePromiseUpdated = async () => {
    await fetchPromises();
  };

  const handleSendEvaluationEmail = async () => {
    if (isSendingEmail) return;
    
    setIsSendingEmail(true);
    try {
      const response = await axios.post('http://localhost:3001/api/evaluation_emails');
      alert('評価メールを送信しました！');
      console.log('送信結果:', response.data);
    } catch (error) {
      console.error("評価メールの送信に失敗しました:", error);
      alert("評価メールの送信に失敗しました。");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleOpenEvaluationModal = (promise: Promise) => {
    setSelectedPromise(promise);
    setIsEvaluationModalOpen(true);
  };

  const handleEvaluationSubmitted = async () => {
    await fetchPromises();
  };

  // 動的なタイトルを生成
  const myPromisesTitle = currentUser ? `${currentUser.name}の約束` : 'わたしの約束';
  const partnerPromisesTitle = partner ? `${partner.name}の約束` : 'パートナーの約束';

  // creator_idを使ってフィルタリング
  const myPromises = promises.filter(p => {
    console.log('Filtering promise:', p);
    console.log('Current user ID:', currentUser?.id);
    console.log('Promise creator_id:', p.creator_id);
    console.log('Is match:', currentUser && p.creator_id === currentUser.id);
    return currentUser && p.creator_id === currentUser.id;
  });
  const partnerPromises = promises.filter(p => partner && p.creator_id === partner.id);
  const ourPromises = promises.filter(p => p.type === 'our_promise');

  return (
    <div className="app-wrapper">
      <Sidebar />
      <main className="board-container">
        <div className="board-columns">
          <PromiseColumn 
            title={myPromisesTitle} 
            promises={myPromises} 
            onAdd={() => handleOpenModal('my_promise')} 
            showAddButton={true}
            onEdit={handleEditPromise}
            onDelete={handleDeletePromise}
          />
          <PromiseColumn 
            title="ふたりの約束" 
            promises={ourPromises} 
            onAdd={() => handleOpenModal('our_promise')} 
            showAddButton={true}
            onEdit={handleEditPromise}
            onDelete={handleDeletePromise}
            onEvaluate={handleOpenEvaluationModal}
            showEvaluationButton={true}
          />
          <PromiseColumn 
            title={partnerPromisesTitle} 
            promises={partnerPromises} 
            onAdd={() => handleOpenModal('partner_promise')} 
            showAddButton={false}
            onEdit={handleEditPromise}
            onDelete={handleDeletePromise}
          />
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button 
            onClick={handleSendEvaluationEmail}
            disabled={isSendingEmail}
            style={{
              padding: '10px 20px',
              backgroundColor: isSendingEmail ? '#ccc' : '#075763',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isSendingEmail ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {isSendingEmail ? '送信中...' : '評価メールを送信'}
          </button>
        </div>
      </main>
      
      <AddPromiseModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        promiseType={promiseTypeToAdd}
        onPromiseCreated={handlePromiseCreated}
      />

      <EditPromiseModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        promise={selectedPromise}
        onPromiseUpdated={handlePromiseUpdated}
      />

      <EvaluationModal
        isOpen={isEvaluationModalOpen}
        onClose={() => setIsEvaluationModalOpen(false)}
        promise={selectedPromise}
        onEvaluationSubmitted={handleEvaluationSubmitted}
      />
    </div>
  );
};

export default Dashboard;