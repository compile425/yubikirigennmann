import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/forms/LoginForm';
import Dashboard from './components/pages/Dashboard';
import EvaluationPage from './components/pages/EvaluationPage';
import PastEvaluationsPage from './components/pages/PastEvaluationsPage';
import RecordPage from './components/pages/RecordPage';
import HitokotoPage from './components/pages/HitokotoPage';
import About from './components/pages/About';
import InvitePartnerPage from './components/pages/InvitePartnerPage';
import { useAuth } from './contexts/useAuth';
import { HitokotoNotificationProvider } from './contexts/HitokotoNotificationContext';
import PendingEvaluationsPage from './components/pages/PendingEvaluationsPage';

function App() {
  const { token, currentUser } = useAuth();

  React.useEffect(() => {
    const setBodyClass = () => {
      const path = window.location.pathname;
      if (token && currentUser) {
        if (path === '/record') {
          document.body.className = 'page-report';
        } else {
          document.body.className = 'page-board';
        }
      } else {
        document.body.className = 'page-login';
      }
    };

    setBodyClass();

    // ルート変更時のリスナーを追加
    const handleRouteChange = () => {
      setBodyClass();
    };

    window.addEventListener('popstate', handleRouteChange);

    return () => {
      document.body.className = '';
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [token, currentUser]);

  return (
    <Router>
      <HitokotoNotificationProvider>
        <Routes>
          <Route
            path="/invite-partner"
            element={
              token && currentUser ? <InvitePartnerPage /> : <LoginForm />
            }
          />
          <Route path="/evaluate/:id" element={<EvaluationPage />} />
          <Route
            path="/past-evaluations"
            element={
              token && currentUser ? <PastEvaluationsPage /> : <LoginForm />
            }
          />
          <Route
            path="/record"
            element={token && currentUser ? <RecordPage /> : <LoginForm />}
          />
          <Route
            path="/hitokoto"
            element={token && currentUser ? <HitokotoPage /> : <LoginForm />}
          />
          <Route
            path="/about"
            element={token && currentUser ? <About /> : <LoginForm />}
          />
          <Route
            path="*"
            element={token && currentUser ? <Dashboard /> : <LoginForm />}
          />
          <Route
            path="/pending-evaluations"
            element={
              token && currentUser ? <PendingEvaluationsPage /> : <LoginForm />
            }
          />
        </Routes>
      </HitokotoNotificationProvider>
    </Router>
  );
}

export default App;
