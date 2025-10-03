import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface SidebarProps {
  onDissolvePartnership?: () => void;
}

const Sidebar = ({ onDissolvePartnership }: SidebarProps) => {
  const { setToken, partner, currentUser, token } = useAuth();
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    if (token && partner) {
      fetchPendingCount();
    }
  }, [token, partner]);

  const fetchPendingCount = async (): Promise<void> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pending-evaluations`);
      setPendingCount(response.data.length);
    } catch (error) {
      console.error('評価待ち件数の取得に失敗しました:', error);
      // デモ用のダミーカウント
      setPendingCount(Math.floor(Math.random() * 5));
    }
  };

  const handleLogout = (): void => {
    setToken(null);

    const navToggle = document.getElementById(
      'yubi-nav-toggle'
    ) as HTMLInputElement;
    if (navToggle) {
      navToggle.checked = false;
    }

    window.location.href = '/';
  };

  const handleDissolvePartnership = (e: React.MouseEvent): void => {
    e.preventDefault();

    const navToggle = document.getElementById(
      'yubi-nav-toggle'
    ) as HTMLInputElement;
    if (navToggle) {
      navToggle.checked = false;
    }

    onDissolvePartnership?.();
  };

  const handleNavLinkClick = (): void => {
    const navToggle = document.getElementById(
      'yubi-nav-toggle'
    ) as HTMLInputElement;
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
              {currentUser?.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.name}
                  className="yubi-sidebar__user-avatar-img"
                />
              ) : (
                <img
                  src={
                    currentUser?.is_inviter
                      ? '/icon_user.png'
                      : '/icon_partner.png'
                  }
                  alt="デフォルトアイコン"
                  className="yubi-sidebar__user-avatar-img"
                />
              )}
            </div>
            <div className="yubi-sidebar__user-name">
              {currentUser?.name || 'ゲストユーザー'}
            </div>
          </div>
        </div>
        <nav className="yubi-sidebar__nav">
          <Link
            to="/"
            className="yubi-sidebar__link"
            onClick={handleNavLinkClick}
          >
            約束一覧
          </Link>
          <Link
            to="/record"
            className="yubi-sidebar__link"
            onClick={handleNavLinkClick}
          >
            ふたりの記録
          </Link>
          <Link
            to="/past-evaluations"
            className="yubi-sidebar__link"
            onClick={handleNavLinkClick}
          >
            過去の評価
          </Link>
          <Link
            to="/hitokoto"
            className="yubi-sidebar__link"
            onClick={handleNavLinkClick}
          >
            ちょっと一言
          </Link>
          <Link
            to="/pending-evaluations"
            className="yubi-sidebar__link"
            onClick={handleNavLinkClick}
          >
            <span>評価待ちの約束</span>
            {pendingCount > 0 && (
              <span className="yubi-sidebar__notification-badge">
                {pendingCount}
              </span>
            )}
          </Link>
          <Link
            to="/about"
            className="yubi-sidebar__link"
            onClick={handleNavLinkClick}
          >
            このアプリについて
          </Link>
          {partner ? (
            <a
              href="#"
              className="yubi-sidebar__link"
              onClick={handleDissolvePartnership}
            >
              パートナー解消
            </a>
          ) : (
            <Link
              to="/invite-partner"
              className="yubi-sidebar__link"
              onClick={handleNavLinkClick}
            >
              パートナー招待
            </Link>
          )}
          <a href="#" className="yubi-sidebar__link" onClick={handleLogout}>
            ログアウト
          </a>
        </nav>
      </aside>
      <label htmlFor="yubi-nav-toggle" className="yubi-overlay"></label>
    </>
  );
};

export default Sidebar;
