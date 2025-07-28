import React from 'react';
import LoginForm from './components/LoginForm';
import { useAuth } from './contexts/useAuth';

const Dashboard: React.FC = () => {
  const { setToken } = useAuth();
  
  const handleLogout = () => {
    setToken(null);
  };

  return (
    <div>
      <h2>ボード画面</h2>
      <p>ログインに成功しました！</p>
      <button onClick={handleLogout}>ログアウト</button>
    </div>
  );
};


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
      {token ? <Dashboard /> : <LoginForm />}
    </div>
  );
}

export default App;