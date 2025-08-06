import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import type { EvaluatedPromise } from '../types';
import { useAuth } from '../contexts/useAuth';

const PastEvaluationsPage = () => {
  const [evaluatedPromises, setEvaluatedPromises] = useState<EvaluatedPromise[]>([]);
  const { token, currentUser, partner } = useAuth();
  const [loading, setLoading] = useState(true);

  const fetchEvaluatedPromises = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/evaluated-promises');
      setEvaluatedPromises(response.data);
    } catch (error) {
      console.error("評価済み約束の取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluatedPromises();
  }, [token]);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-yellow-400 text-xl">★</span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400 text-xl">☆</span>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300 text-xl">★</span>
      );
    }

    return stars;
  };

  const getTypeTitle = (type: string) => {
    switch (type) {
      case 'my_promise':
        return 'わたしの過去の評価';
      case 'our_promise':
        return 'ふたりの過去の評価';
      case 'partner_promise':
        return 'パートナーの過去の評価';
      default:
        return '過去の評価';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'my_promise':
        return 'bg-teal-600';
      case 'our_promise':
        return 'bg-teal-700';
      case 'partner_promise':
        return 'bg-teal-800';
      default:
        return 'bg-teal-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">過去の約束</h1>
          
          {evaluatedPromises.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">まだ評価済みの約束がありません</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {evaluatedPromises.map((promise) => (
                <div key={promise.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* ヘッダー */}
                  <div className={`${getTypeColor(promise.type)} px-4 py-3`}>
                    <h3 className="text-white font-semibold text-lg">
                      {getTypeTitle(promise.type)}
                    </h3>
                  </div>
                  
                  {/* コンテンツ */}
                  <div className="p-6 bg-amber-50">
                    <p className="text-gray-800 text-lg mb-4 leading-relaxed">
                      {promise.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {renderStars(promise.rating)}
                        <span className="text-gray-600 font-medium ml-2">
                          {promise.rating.toFixed(1)}
                        </span>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          評価者: {promise.evaluator_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(promise.evaluation_date).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PastEvaluationsPage; 