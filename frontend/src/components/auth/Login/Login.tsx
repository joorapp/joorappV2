import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import './Login.scss';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success && result.user) {
        // Store remember me preference
        if (formData.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');
        }

        // Redirect based on user role
        if (result.user.role === 'superadmin') {
          navigate('/superadmin/dashboard');
        } else if (result.user.role === 'company') {
          navigate('/company/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = (role: 'superadmin' | 'company') => {
    if (role === 'superadmin') {
      setFormData({
        email: 'superadmin@example.com',
        password: 'admin123',
        rememberMe: false,
      });
    } else {
      setFormData({
        email: 'company@example.com',
        password: 'company123',
        rememberMe: false,
      });
    }
  };

  return (
    <div className="login">
      <div className="login__container">
        <div className="login__card">
          <div className="login__header">
            <div className="login__logo">
              <span className="login__logo-icon">🚀</span>
              <h1 className="login__title">JoorApp</h1>
            </div>
            <p className="login__subtitle">{t('Login.title')}</p>
          </div>

          <form className="login__form" onSubmit={handleSubmit}>
            {error && (
              <div className="login__error">
                <span className="login__error-icon">⚠️</span>
                <span className="login__error-text">{error}</span>
              </div>
            )}

            <div className="login__field">
              <label htmlFor="email" className="login__label">
                {t('Login.email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="login__input"
                placeholder="Enter your email"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="login__field">
              <label htmlFor="password" className="login__label">
                {t('Login.password')}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="login__input"
                placeholder="Enter your password"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="login__options">
              <label className="login__checkbox">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
                <span className="login__checkbox-text">{t('Login.rememberMe')}</span>
              </label>
              <a href="#" className="login__forgot-link">
                {t('Login.forgotPassword')}
              </a>
            </div>

            <button
              type="submit"
              className="login__submit"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? (
                <>
                  <span className="login__spinner"></span>
                  {t('Common.loading')}
                </>
              ) : (
                t('Login.submit')
              )}
            </button>
          </form>

          <div className="login__demo">
            <p className="login__demo-title">Demo Accounts:</p>
            <div className="login__demo-buttons">
              <button
                type="button"
                className="login__demo-btn login__demo-btn--superadmin"
                onClick={() => handleDemoLogin('superadmin')}
                disabled={isSubmitting}
              >
                👑 Super Admin
              </button>
              <button
                type="button"
                className="login__demo-btn login__demo-btn--company"
                onClick={() => handleDemoLogin('company')}
                disabled={isSubmitting}
              >
                🏢 Company
              </button>
            </div>
          </div>

          <div className="login__footer">
            <p className="login__footer-text">
              &copy; 2024 JoorApp. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
