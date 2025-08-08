import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import InvitePartnerModal from './InvitePartnerModal';

interface SidebarProps {
  onDissolvePartnership?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onDissolvePartnership }) => {
  const { setToken, partner, currentUser } = useAuth();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const handleLogout = () => {
    setToken(null);
    
    const navToggle = document.getElementById('yubi-nav-toggle') as HTMLInputElement;
    if (navToggle) {
      navToggle.checked = false;
    }
    
    window.location.href = '/';
  };

  const handleDissolvePartnership = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const navToggle = document.getElementById('yubi-nav-toggle') as HTMLInputElement;
    if (navToggle) {
      navToggle.checked = false;
    }

    onDissolvePartnership?.();
  };

  const handleInvitePartner = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const navToggle = document.getElementById('yubi-nav-toggle') as HTMLInputElement;
    if (navToggle) {
      navToggle.checked = false;
    }

    setIsInviteModalOpen(true);
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
          <Link to="/" className="yubi-sidebar__link">約束一覧</Link>
          <a href="#" className="yubi-sidebar__link">ふたりの記録</a>
          <Link to="/past-evaluations" className="yubi-sidebar__link">過去の評価</Link>
          <a href="#" className="yubi-sidebar__link">ちょっと一言</a>
          <a href="#" className="yubi-sidebar__link">このアプリについて</a>
          {partner ? (
            <a
              href="#"
              className="yubi-sidebar__link"
              onClick={handleDissolvePartnership}
            >
              パートナー解消
            </a>
          ) : (
            <a
              href="#"
              className="yubi-sidebar__link"
              onClick={handleInvitePartner}
            >
              パートナー招待
            </a>
          )}
          <a href="#" className="yubi-sidebar__link" onClick={handleLogout}>ログアウト</a>
        </nav>
      </aside>
      <label htmlFor="yubi-nav-toggle" className="yubi-overlay"></label>

      <InvitePartnerModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </>
  );
};

export default Sidebar;