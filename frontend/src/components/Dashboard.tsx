import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import PromiseColumn from './PromiseColumn';
import AddPromiseModal from './AddPromiseModal';
import EditPromiseModal from './EditPromiseModal';
import EvaluationModal from './EvaluationModal';
import DissolvePartnershipModal from './DissolvePartnershipModal';
import type { PromiseItem } from '../types';
import { useAuth } from '../contexts/useAuth';

const Dashboard = () => {
  const [promises, setPromises] = useState<PromiseItem[]>([]);
  const { token, currentUser, partner } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState<boolean>(false);
  const [isDissolveModalOpen, setIsDissolveModalOpen] = useState<boolean>(false);
  const [selectedPromise, setSelectedPromise] = useState<PromiseItem | null>(null);
  const [promiseTypeToAdd, setPromiseTypeToAdd] = useState<'my_promise' | 'our_promise' | 'partner_promise' | ''>('');
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);

  const fetchPromises = useCallback(async (): Promise<void> => {
    if (!token) return;
    try {
      const response = await axios.get('http://localhost:3001/api/promises');
      setPromises(response.data);
    } catch (error) {
      console.error("約束の取得に失敗しました:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchPromises();
  }, [fetchPromises]);

  const handleOpenModal = (type: 'my_promise' | 'our_promise' | 'partner_promise'): void => {
    setPromiseTypeToAdd(type);
    setIsModalOpen(true);
  };

  const handlePromiseCreated = async (): Promise<void> => {
    await fetchPromises();
  };

  const handleEditPromise = (promise: PromiseItem): void => {
    setSelectedPromise(promise);
    setIsEditModalOpen(true);
  };

  const handleDeletePromise = async (promise: PromiseItem): Promise<void> => {
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

  const handlePromiseUpdated = async (): Promise<void> => {
    await fetchPromises();
  };

  const handleSendEvaluationEmail = async (): Promise<void> => {
    if (isSendingEmail) return;
    
    setIsSendingEmail(true);
    try {
      const response = await axios.post('http://localhost:3001/api/evaluation_emails');
      alert('評価メールを送信しました！');
      console.log('送信結果:', response.data);
    } catch (error) {
      console.error("評価メールの送信に失敗しました:", error);
      
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data;
        console.log('エラー詳細:', errorData);
        
        let errorMessage = "評価メールの送信に失敗しました。";
        if (errorData.error) {
          errorMessage += `\n\n理由: ${errorData.error}`;
        }
        if (errorData.details) {
          errorMessage += `\n\n詳細: ${errorData.details}`;
        }
        if (errorData.user_id) {
          errorMessage += `\n\nユーザーID: ${errorData.user_id}`;
        }
        if (errorData.partnership_id) {
          errorMessage += `\n\nパートナーシップID: ${errorData.partnership_id}`;
        }
        if (errorData.available_promises) {
          errorMessage += `\n\n利用可能な約束: ${JSON.stringify(errorData.available_promises)}`;
        }
        
        alert(errorMessage);
      } else {
        alert("評価メールの送信に失敗しました。");
      }
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSendDueDateEvaluations = async (): Promise<void> => {
    try {
      const response = await axios.post('http://localhost:3001/api/scheduled_tasks/send_due_date_evaluations');
      alert('期日が来た約束の評価メールを送信しました！');
      console.log('送信結果:', response.data);
    } catch (error) {
      console.error("期日評価メールの送信に失敗しました:", error);
      alert("期日評価メールの送信に失敗しました。");
    }
  };

  const handleSendWeeklyEvaluations = async (): Promise<void> => {
    try {
      const response = await axios.post('http://localhost:3001/api/scheduled_tasks/send_weekly_our_promises_evaluation');
      alert('毎週の二人の約束評価メールを送信しました！');
      console.log('送信結果:', response.data);
    } catch (error) {
      console.error("毎週評価メールの送信に失敗しました:", error);
      alert("毎週評価メールの送信に失敗しました。");
    }
  };

  const handleOpenEvaluationModal = (promise: PromiseItem): void => {
    setSelectedPromise(promise);
    setIsEvaluationModalOpen(true);
  };

  const handleEvaluationSubmitted = async (): Promise<void> => {
    await fetchPromises();
  };

  const myPromisesTitle = currentUser ? `${currentUser.name}の約束` : 'わたしの約束';
  const partnerPromisesTitle = partner ? `${partner.name}の約束` : 'パートナーの約束';

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
    <div className="yubi-app">
      <Sidebar
        onDissolvePartnership={() => setIsDissolveModalOpen(true)}
      />
      
      <main className="yubi-main">
        <div className="yubi-board">
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
        
        <div className="yubi-evaluation-email-section">
          <button
            onClick={handleSendEvaluationEmail}
            disabled={isSendingEmail}
            className="yubi-button yubi-button--primary yubi-button--email"
          >
            {isSendingEmail ? '送信中...' : '評価メールを送信'}
          </button>
          <button 
            onClick={handleSendDueDateEvaluations}
            className="yubi-button yubi-button--primary yubi-button--email"
            style={{ marginLeft: '10px' }}
          >
            期日評価メールを送信
          </button>
          <button 
            onClick={handleSendWeeklyEvaluations}
            className="yubi-button yubi-button--primary yubi-button--email"
            style={{ marginLeft: '10px' }}
          >
            毎週評価メールを送信
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

      <DissolvePartnershipModal
        isOpen={isDissolveModalOpen}
        onClose={() => setIsDissolveModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;