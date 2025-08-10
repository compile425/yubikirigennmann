import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

interface SidebarProps {
  onDissolvePartnership?: () => void;
}

const Sidebar = ({ onDissolvePartnership }: SidebarProps) => {
  const { setToken, partner, currentUser } = useAuth();

  const handleLogout = (): void => {
    setToken(null);
    
    const navToggle = document.getElementById('yubi-nav-toggle') as HTMLInputElement;
    if (navToggle) {
      navToggle.checked = false;
    }
    
    window.location.href = '/';
  };

  const handleDissolvePartnership = (e: React.MouseEvent): void => {
    e.preventDefault();
    
    const navToggle = document.getElementById('yubi-nav-toggle') as HTMLInputElement;
    if (navToggle) {
      navToggle.checked = false;
    }

    onDissolvePartnership?.();
  };

  const handleNavLinkClick = (): void => {
    const navToggle = document.getElementById('yubi-nav-toggle') as HTMLInputElement;
    if (navToggle) {
      navToggle.checked = false;
    }
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
        <div className="yubi-sidebar__header">
          <div className="yubi-sidebar__user-icon">
            <div className="yubi-sidebar__user-avatar">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
        <nav className="yubi-sidebar__nav">
          <Link to="/" className="yubi-sidebar__link" onClick={handleNavLinkClick}>約束一覧</Link>
          <Link to="/" className="yubi-sidebar__link" onClick={handleNavLinkClick}>ふたりの記録</Link>
          <Link to="/past-evaluations" className="yubi-sidebar__link" onClick={handleNavLinkClick}>過去の評価</Link>
          <Link to="/" className="yubi-sidebar__link" onClick={handleNavLinkClick}>ちょっと一言</Link>
          <Link to="/" className="yubi-sidebar__link" onClick={handleNavLinkClick}>このアプリについて</Link>
          {partner ? (
            <a
              href="#"
              className="yubi-sidebar__link"
              onClick={handleDissolvePartnership}
            >
              パートナー解消
            </a>
          ) : (
            <Link to="/invite-partner" className="yubi-sidebar__link" onClick={handleNavLinkClick}>
              パートナー招待
            </Link>
          )}
          <a href="#" className="yubi-sidebar__link" onClick={handleLogout}>ログアウト</a>
        </nav>
      </aside>
      <label htmlFor="yubi-nav-toggle" className="yubi-overlay"></label>
    </>
  );
};

export default Sidebar;
