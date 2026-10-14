import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { LogIn, Key, Mail, AlertCircle, CheckCircle } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(() => location.state?.email || '');
  const [password, setPassword] = useState(() => location.state?.password || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(() => !!location.state?.registered);
  const registeredName = location.state?.studentName || '';

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
    if (location.state?.password) {
      setPassword(location.state.password);
    }
    if (location.state?.registered) {
      setRegisteredSuccess(true);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const authData = await login(email.trim(), password.trim());
      const role = (authData.role || '').toUpperCase().replace(/^ROLE_/, '');

      // Automatic Role-Based Navigation
      if (role === 'BOYS_WARDEN' || (role === 'HOSTEL_HEAD' && authData.hostelType === 'BOYS')) {
        navigate('/warden/boys/dashboard');
      } else if (role === 'GIRLS_WARDEN' || (role === 'HOSTEL_HEAD' && authData.hostelType === 'GIRLS')) {
        navigate('/warden/girls/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message || err.message || '';

      if (status === 403 || serverMsg.toLowerCase().includes('inactive')) {
        setError(
          lang === 'mr'
            ? 'तुमचे खाते निष्क्रिय आहे. कृपया प्रशासकाशी संपर्क साधा.'
            : 'Your account is inactive. Please contact the administrator.'
        );
      } else if (status === 401 || serverMsg.toLowerCase().includes('invalid')) {
        setError(
          lang === 'mr'
            ? 'अवैध ईमेल किंवा पासवर्ड.'
            : 'Invalid email or password.'
        );
      } else {
        setError(
          lang === 'mr'
            ? 'लॉगिन करण्यात अक्षम. कृपया नंतर पुन्हा प्रयत्न करा.'
            : 'Unable to login. Please try again later.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }}>
      <div style={{ maxWidth: '440px', width: '100%' }}>
        
        {/* College & Hostel Official Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <img 
              src="/college-logo-transparent.png" 
              alt="NACSC Crest" 
              style={{
                width: '74px',
                height: '74px',
                objectFit: 'contain',
                backgroundColor: 'white',
                borderRadius: '50%',
                padding: '4px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                border: '2px solid #f59e0b'
              }}
            />
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            Ahilyanagar Jilha Maratha Vidya Prasarak Samaj's
          </div>
          <h2 style={{ fontSize: 'clamp(1.1rem, 3.5vw, 1.35rem)', fontWeight: 900, color: 'var(--primary)', marginTop: '0.2rem' }}>
            New Arts, Commerce & Science College, Ahilyanagar
          </h2>
          <div style={{ 
            display: 'inline-block', 
            backgroundColor: 'var(--primary-light)', 
            color: 'var(--primary)', 
            padding: '0.25rem 0.85rem', 
            borderRadius: '9999px', 
            fontSize: '0.75rem', 
            fontWeight: 800, 
            marginTop: '0.5rem' 
          }}>
            Online Hostel Management System • Boys & Girls Hostel Official Portal
          </div>
        </div>

        {/* Login Card */}
        <div className="card" style={{ padding: 'clamp(1.25rem, 3vw, 2.25rem) clamp(1rem, 2.5vw, 2rem)' }}>
          
          {registeredSuccess && (
            <div style={{
              backgroundColor: '#ecfdf5',
              border: '1.5px solid #10b981',
              borderRadius: '12px',
              padding: '1rem 1.15rem',
              marginBottom: '1.5rem',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.12)'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <CheckCircle size={22} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#065f46' }}>
                    {lang === 'mr' ? 'नोंदणी यशस्वीरित्या पूर्ण झाली!' : 'Registration Completed Successfully!'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#047857', marginTop: '0.25rem', lineHeight: 1.5 }}>
                    {registeredName ? `Welcome ${registeredName}! ` : ''}
                    {lang === 'mr' 
                      ? 'कृपया तुमचे युझरनेम आणि पासवर्ड वापरून साइन इन करा.' 
                      : 'Please sign in using your registered credentials.'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.85rem 1rem',
              backgroundColor: '#fef2f2',
              color: '#b91c1c',
              borderRadius: '8px',
              border: '1px solid #fecaca',
              fontSize: '0.875rem',
              marginBottom: '1.5rem'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Email Address */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 700 }}>
                {lang === 'mr' ? 'ईमेल पत्ता' : 'Email Address'}
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder={lang === 'mr' ? 'तुमचा नोंदणीकृत ईमेल प्रविष्ट करा' : 'Enter your registered email'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 700 }}>
                {lang === 'mr' ? 'पासवर्ड' : 'Password'}
              </label>
              <div style={{ position: 'relative' }}>
                <Key size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem', fontWeight: 800, fontSize: '0.95rem' }}
              disabled={loading}
            >
              <LogIn size={18} />
              <span>{loading ? (lang === 'mr' ? 'साइन इन करत आहे...' : 'Signing In...') : (lang === 'mr' ? 'साइन इन करा' : 'Sign In')}</span>
            </button>
          </form>

          {/* Register / Apply for Hostel link */}
          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>
              {lang === 'mr' ? 'वसतिगृह प्रवेश हवा आहे?' : "Don't have an account?"}{' '}
            </span>
            <Link to="/register" style={{ fontWeight: 700, color: 'var(--primary)' }}>
              {lang === 'mr' ? 'वसतिगृहासाठी अर्ज करा' : 'Apply for Hostel'}
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
