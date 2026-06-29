import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import AuthScreen from './AuthScreen';
import TravelDashboard from './TravelDashboard';
import ChatRoom from './ChatRoom';

function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [activeChatRequestId, setActiveChatRequestId] = useState(null);

  useEffect(() => {
    // Stateless architecture: Skip background cookie verification checks
    setCheckingSession(false);
  }, []);

  const handleAuthSuccess = (userData) => {
    window.currentUserEmail = userData.email; // Cache globally for api/client.js
    setUser(userData);
  };

  const handleLogout = () => {
    window.currentUserEmail = null;
    setUser(null);
    setActiveChatRequestId(null);
  };

  if (checkingSession) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="App bg-light min-vh-100">
      {!user ? (
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
      ) : (
        <>
          <nav className="navbar navbar-dark bg-dark px-4 shadow-sm sticky-top">
            <span
              className="navbar-brand mb-0 h1 fw-bold"
              style={{ cursor: 'pointer' }}
              onClick={() => setActiveChatRequestId(null)}
            >
              WanderSync
            </span>
            <div className="d-flex align-items-center">
              <span className="text-white-50 small me-3 d-none d-md-block">
                {user.email}
              </span>
              <button
                className="btn btn-outline-light btn-sm rounded-pill px-3 fw-bold"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </nav>

          <div className="container py-4">
            {activeChatRequestId ? (
              <div>
                <button
                  className="btn btn-link text-decoration-none mb-3 px-0 fw-bold"
                  onClick={() => setActiveChatRequestId(null)}
                >
                  <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
                </button>
                <ChatRoom
                  requestId={activeChatRequestId}
                  currentUserEmail={user.email}
                />
              </div>
            ) : (
              <TravelDashboard
                currentUserEmail={user.email}
                onOpenChat={(requestId) => setActiveChatRequestId(requestId)}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;