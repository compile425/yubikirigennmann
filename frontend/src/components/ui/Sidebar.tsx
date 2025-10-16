import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import { useHitokotoNotification } from '../../contexts/HitokotoNotificationContext';
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../lib/api';
import type { ApiResponse, PendingPromise } from '../../lib/api';

interface SidebarProps {
  onDissolvePartnership?: () => void;
}

const Sidebar = ({ onDissolvePartnership }: SidebarProps) => {
  const { setToken, partner, currentUser, token } = useAuth();
  const { hasUnreadHitokoto, markAsRead } = useHitokotoNotification();
  const [pendingCount, setPendingCount] = useState<number>(0);

  const fetchPendingCount = useCallback(async (): Promise<void> => {
    try {
      const response: ApiResponse<PendingPromise[]> = await apiClient.get(
        '/pending-evaluations'
      );

      if (response.error) {
        console.error('評価待ち件数の取得に失敗しました:', response.error);
        setPendingCount(0);
      } else {
        setPendingCount(response.data?.length || 0);
      }
    } catch (error) {
      console.error('評価待ち件数の取得に失敗しました:', error);
      setPendingCount(0);
    }
  }, []);

  useEffect(() => {
    if (token && partner) {
      fetchPendingCount();
    }
  }, [token, partner, fetchPendingCount]);

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
          {/* ログインしていない場合 */}
          {!token && (
            <>
              <Link
                to="/"
                className="yubi-sidebar__link"
                onClick={handleNavLinkClick}
              >
                ログイン
              </Link>
              <Link
                to="/about"
                className="yubi-sidebar__link"
                onClick={handleNavLinkClick}
              >
                このアプリについて
              </Link>
            </>
          )}

          {/* ログイン済み、パートナーシップなし */}
          {token && !partner && (
            <>
              <Link
                to="/about"
                className="yubi-sidebar__link"
                onClick={handleNavLinkClick}
              >
                このアプリについて
              </Link>
              <Link
                to="/invite-partner"
                className="yubi-sidebar__link"
                onClick={handleNavLinkClick}
              >
                パートナーと始める
              </Link>
              <a href="#" className="yubi-sidebar__link" onClick={handleLogout}>
                ログアウト
              </a>
            </>
          )}

          {/* ログイン済み、パートナーシップあり */}
          {token && partner && (
            <>
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
                <span>ちょっと一言</span>
                {hasUnreadHitokoto && (
                  <span className="yubi-sidebar__notification-wrapper">
                    <span className="yubi-sidebar__notification-badge">!</span>
                    <button
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        markAsRead();
                      }}
                      className="yubi-sidebar__notification-close"
                      title="通知を消す"
                    >
                      ×
                    </button>
                  </span>
                )}
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
              <a
                href="#"
                className="yubi-sidebar__link"
                onClick={handleDissolvePartnership}
              >
                パートナー解消
              </a>
              <a href="#" className="yubi-sidebar__link" onClick={handleLogout}>
                ログアウト
              </a>
            </>
          )}
        </nav>
      </aside>
      <label htmlFor="yubi-nav-toggle" className="yubi-overlay"></label>
    </>
  );
};

export default Sidebar;
