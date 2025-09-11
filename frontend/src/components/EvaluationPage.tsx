import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
import EvaluationModal from './EvaluationModal';
import type { PromiseItem } from '../types';

const EvaluationPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [promise, setPromise] = useState<PromiseItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isValidToken, setIsValidToken] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token || !id) {
      setIsValidToken(false);
      setIsLoading(false);
      return;
    }

    const fetchPromise = async (): Promise<void> => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/evaluation_pages/${id}?token=${token}`
        );

        if (response.data.valid_token) {
          setPromise(response.data.promise);
          setIsValidToken(true);
          setIsModalOpen(true);
        } else {
          setIsValidToken(false);
        }
      } catch (error) {
        console.error('約束の取得に失敗しました:', error);
        setIsValidToken(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromise();
  }, [id, searchParams]);

  const handleEvaluationSubmitted = (): void => {
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
        }}
      >
        読み込み中...
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          textAlign: 'center',
        }}
      >
        <h1 style={{ color: '#075763', marginBottom: '20px' }}>
          無効なリンクです
        </h1>
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
