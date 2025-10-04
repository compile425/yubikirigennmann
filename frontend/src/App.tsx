import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/forms/LoginForm';
import Dashboard from './components/pages/Dashboard';
import EvaluationPage from './components/pages/EvaluationPage';
import PastEvaluationsPage from './components/pages/PastEvaluationsPage';
import RecordPage from './components/pages/RecordPage';
import HitokotoPage from './components/pages/HitokotoPage';
import About from './components/pages/About';
import InviteAcceptPage from './components/pages/InviteAcceptPage';
import InvitePartnerPage from './components/pages/InvitePartnerPage';
import { useAuth } from './contexts/useAuth';
import PendingEvaluationsPage from './components/pages/PendingEvaluationsPage';

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
        <Route path="/about" element={token ? <About /> : <LoginForm />} />
        <Route path="*" element={token ? <Dashboard /> : <LoginForm />} />
        <Route
          path="/pending-evaluations"
          element={token ? <PendingEvaluationsPage /> : <LoginForm />}
        />
      </Routes>
    </Router>
  );
}

export default App;
