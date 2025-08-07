import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

const Sidebar: React.FC = () => {
  const { setToken } = useAuth();

  const handleLogout = () => {
    // ログアウト処理
    setToken(null);
    
    // サイドバーを閉じる
    const navToggle = document.getElementById('yubi-nav-toggle') as HTMLInputElement;
    if (navToggle) {
      navToggle.checked = false;
    }
    
    // ページをリロードして確実にログイン画面に遷移
    window.location.href = '/';
  };

  return (
    <>
      <input type="checkbox" id="yubi-nav-toggle" className="yubi-nav-toggle" />
      <label htmlFor="yubi-nav-toggle" className="yubi-nav-button">
        <span className="yubi-nav-button__line"></span>
        <span className="yubi-nav-button__line"></span>
        <span className="yubi-nav-button__line"></span>
      </label>
      <aside className="yubi-sidebar">
        <nav className="yubi-sidebar__nav">
          <Link to="/" className="yubi-sidebar__link">約束一覧</Link>
          <a href="#" className="yubi-sidebar__link">ふたりの記録</a>
          <Link to="/past-evaluations" className="yubi-sidebar__link">過去の評価</Link>
          <a href="#" className="yubi-sidebar__link">ちょっと一言</a>
          <a href="#" className="yubi-sidebar__link">このアプリについて</a>
          <a href="#" className="yubi-sidebar__link">パートナー解消</a>
          <a href="#" className="yubi-sidebar__link" onClick={handleLogout}>ログアウト</a>
        </nav>
      </aside>
      <label htmlFor="yubi-nav-toggle" className="yubi-overlay"></label>
    </>
  );
};

export default Sidebar;