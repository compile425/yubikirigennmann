import React from 'react';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard'; // 新しいDashboardをインポート
import { useAuth } from './contexts/useAuth';

function App() {
  const { token } = useAuth();

  React.useEffect(() => {
    if (token) {
      document.body.className = 'page-board';
    } else {
      document.body.className = 'page-login';
    }
    return () => {
      document.body.className = '';
    };
  }, [token]);

  return (
    <div>
      {/* ログインしていれば新しいDashboard、していなければLoginFormを表示 */}
      {token ? <Dashboard /> : <LoginForm />}
    </div>
  );
}

export default App;