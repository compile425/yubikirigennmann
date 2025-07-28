import React from 'react';
import { useAuth } from '../contexts/useAuth';

const Dashboard: React.FC = () => {
  const { setToken } = useAuth();

  const handleLogout = () => {
    setToken(null);
  };

  return (
    <div className="app-wrapper">
      {/* ----- サイドバーここから ----- */}
      <input type="checkbox" id="menu-toggle" />
      <label htmlFor="menu-toggle" className="menu-button">
        <span></span>
        <span></span>
        <span></span>
      </label>
      <aside className="sidebar">
        <nav className="sidebar-nav">
          <a href="#">約束一覧</a>
          <a href="#">ふたりの記録</a>
          <a href="#">過去の評価</a>
          <a href="#">ちょっと一言</a>
          <a href="#">このアプリについて</a>
          <a href="#">パートナー解消</a>
          {/* ログアウト機能はReactのイベントで処理する */}
          <a href="#" onClick={handleLogout}>ログアウト</a>
        </nav>
      </aside>
      <label htmlFor="menu-toggle" className="overlay"></label>
      {/* ----- サイドバーここまで ----- */}

      <main className="board-container">
        <div className="board-columns">
          {/* TODO: ここに各カラムコンポーネントを配置する */}
          <div className="column">
            <h2 className="column-title">
              <span>わたしの約束</span>
              <a href="#" className="add-promise-button">+</a>
            </h2>
            <div className="post-it-container">
                {/* TODO: ここに付箋コンポーネントを配置する */}
                <div className="post-it">
                    週末は、美味しいごはんを作ります！
                    <footer className="post-it-footer">
                        <div className="card-actions">
                            <a href="#" className="action-button">✏️</a>
                            <a href="#" className="action-button">🗑️</a>
                        </div>
                        <span>期限: 2025/8/10</span>
                    </footer>
                </div>
            </div>
          </div>

          <div className="column">
            <h2 className="column-title">
              <span>ふたりの約束</span>
              <a href="#" className="add-promise-button">+</a>
            </h2>
            <div className="post-it-container">
            </div>
          </div>

          <div className="column">
            <h2 className="column-title">
              <span>パートナーの約束</span>
              <a href="#" className="add-promise-button">+</a>
            </h2>
            <div className="post-it-container">
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;