import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import EvaluationPage from './components/EvaluationPage';
import PastEvaluationsPage from './components/PastEvaluationsPage';
import RecordPage from './components/RecordPage';
import HitokotoPage from './components/HitokotoPage';
import InviteAcceptPage from './components/InviteAcceptPage';
import InvitePartnerPage from './components/InvitePartnerPage';
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
    <Router>
      <Routes>
        <Route path="/invite/:token" element={<InviteAcceptPage />} />
        <Route
          path="/invite-partner"
          element={token ? <InvitePartnerPage /> : <LoginForm />}
        />
        <Route path="/evaluate/:id" element={<EvaluationPage />} />
        <Route
          path="/past-evaluations"
          element={token ? <PastEvaluationsPage /> : <LoginForm />}
        />
        <Route
          path="/record"
          element={token ? <RecordPage /> : <LoginForm />}
        />
        <Route
          path="/hitokoto"
          element={token ? <HitokotoPage /> : <LoginForm />}
        />
        <Route path="*" element={token ? <Dashboard /> : <LoginForm />} />
      </Routes>
    </Router>
  );
}

export default App;
