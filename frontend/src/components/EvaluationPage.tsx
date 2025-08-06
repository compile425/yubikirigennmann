import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import EvaluationModal from './EvaluationModal';
import type { Promise } from '../types';

const EvaluationPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [promise, setPromise] = useState<Promise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setIsValidToken(false);
      setIsLoading(false);
      return;
    }

    const fetchPromise = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/evaluation_pages/${id}?token=${token}`);
        
        if (response.data.valid_token) {
          setPromise(response.data.promise);
          setIsValidToken(true);
          setIsModalOpen(true);
        } else {
          setIsValidToken(false);
        }
      } catch (error) {
        console.error("約束の取得に失敗しました:", error);
        setIsValidToken(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromise();
  }, [id, searchParams]);

  const handleEvaluationSubmitted = () => {
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        読み込み中...
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#075763', marginBottom: '20px' }}>無効なリンクです</h1>
        <p>このリンクは期限切れか無効です。</p>
        <p>新しい評価リンクをお待ちください。</p>
      </div>
    );
  }

  return (
    <div>
      <EvaluationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        promise={promise}
        onEvaluationSubmitted={handleEvaluationSubmitted}
      />
    </div>
  );
};

export default EvaluationPage; 