import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

const Sidebar: React.FC = () => {
  const { setToken } = useAuth();

  const handleLogout = () => {
    setToken(null);
  };

  return (
    <>
      <input type="checkbox" id="menu-toggle" />
      <label htmlFor="menu-toggle" className="menu-button">
        <span></span>
        <span></span>
        <span></span>
      </label>
      <aside className="sidebar">
        <nav className="sidebar-nav">
          <Link to="/">約束一覧</Link>
          <Link to="/past-evaluations">過去の約束</Link>
          <a href="#">ふたりの記録</a>
          <a href="#">過去の評価</a>
          <a href="#">ちょっと一言</a>
          <a href="#">このアプリについて</a>
          <a href="#">パートナー解消</a>
          <a href="#" onClick={handleLogout}>ログアウト</a>
        </nav>
      </aside>
      <label htmlFor="menu-toggle" className="overlay"></label>
    </>
  );
};

export default Sidebar;