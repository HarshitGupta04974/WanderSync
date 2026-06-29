import React, { useState } from 'react';
import './AuthScreen.css';
import { api } from './api/client';

const AuthScreen = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    gender: 'FEMALE'
  });

  const handleInputChange = (e) => {
    setError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ name: '', email: '', password: '', gender: 'FEMALE' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/v1/auth/login' : '/api/v1/auth/register';
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : formData;

    try {
      const response = await api.post(endpoint, payload);

      if (response.ok) {
        const data = await response.json();
        if (onAuthSuccess) onAuthSuccess(data);
      } else if (response.status === 401) {
        setError('Incorrect email or password.');
      } else if (response.status === 409) {
        setError('An account with this email already exists.');
      } else if (response.status === 400) {
        const errorData = await response.json().catch(() => null);
        setError(errorData?.message || 'Invalid input. Please check your details.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('Cannot reach the server. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper d-flex align-items-center justify-content-center min-vh-100">
      <div className="auth-card shadow-lg overflow-hidden d-flex flex-column flex-md-row">

        <div className="auth-brand-panel p-5 text-white d-flex flex-column justify-content-center align-items-start">
          <h1 className="fw-bold display-5 mb-3 brand-title">WanderSync</h1>
          <p className="lead brand-subtitle">
            {isLogin
              ? 'Welcome back. Your next journey awaits.'
              : 'Join the ultimate network for solo travelers.'}
          </p>
          <div className="mt-auto d-none d-md-block brand-graphic">
            <i className="bi bi-globe-americas display-1 opacity-50"></i>
          </div>
        </div>

        <div className="auth-form-panel p-5 bg-white position-relative">
          <div className="form-header mb-4">
            <h2 className="fw-bold">{isLogin ? 'Sign In' : 'Create Account'}</h2>
            <p className="text-muted">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                type="button"
                className="btn btn-link p-0 ms-2 fw-semibold text-decoration-none toggle-btn"
                onClick={toggleMode}
              >
                {isLogin ? 'Register' : 'Log In'}
              </button>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" key={isLogin ? 'login' : 'register'}>
            {!isLogin && (
              <div className="form-floating mb-3 slide-in">
                <input
                  type="text"
                  className="form-control bg-light border-0"
                  id="nameInput"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                <label htmlFor="nameInput">Full Name</label>
              </div>
            )}

            <div className="form-floating mb-3 slide-in" style={{ animationDelay: '0.1s' }}>
              <input
                type="email"
                className="form-control bg-light border-0"
                id="emailInput"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <label htmlFor="emailInput">Email address</label>
            </div>

            <div className="form-floating mb-4 slide-in" style={{ animationDelay: '0.2s' }}>
              <input
                type="password"
                className="form-control bg-light border-0"
                id="passwordInput"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <label htmlFor="passwordInput">Password</label>
            </div>

            {!isLogin && (
              <div className="mb-4 slide-in" style={{ animationDelay: '0.3s' }}>
                <label className="form-label text-muted small fw-bold mb-2 d-block">Gender</label>
                <div className="btn-group w-100 shadow-sm" role="group">
                  <input
                    type="radio"
                    className="btn-check"
                    name="gender"
                    id="genderFemale"
                    value="FEMALE"
                    checked={formData.gender === 'FEMALE'}
                    onChange={handleInputChange}
                  />
                  <label className="btn btn-outline-primary" htmlFor="genderFemale">Female</label>

                  <input
                    type="radio"
                    className="btn-check"
                    name="gender"
                    id="genderMale"
                    value="MALE"
                    checked={formData.gender === 'MALE'}
                    onChange={handleInputChange}
                  />
                  <label className="btn btn-outline-primary" htmlFor="genderMale">Male</label>
                </div>
              </div>
            )}

            {error && (
              <div className="alert alert-danger py-2 mb-3 rounded-3 small" role="alert">
                <i className="bi bi-exclamation-circle me-2"></i>{error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-100 py-3 rounded-3 fw-bold auth-submit-btn d-flex justify-content-center align-items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="spinner-border spinner-border-sm text-white" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;