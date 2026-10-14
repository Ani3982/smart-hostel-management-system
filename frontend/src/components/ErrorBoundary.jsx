import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
          padding: '2rem',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          <div style={{
            maxWidth: '540px',
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '2.5rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
            textAlign: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
              fontSize: '1.75rem'
            }}>
              ⚠️
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>
              Portal Display Recovered
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.925rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              A rendering issue was intercepted. Click below to refresh your session and return to the portal.
            </p>

            {this.state.error && (
              <div style={{
                marginBottom: '1.5rem',
                padding: '0.75rem 1rem',
                backgroundColor: '#fef2f2',
                borderRadius: '8px',
                border: '1px solid #fecaca',
                textAlign: 'left',
                fontSize: '0.8rem',
                color: '#991b1b',
                maxHeight: '120px',
                overflowY: 'auto',
                fontFamily: 'monospace'
              }}>
                <strong>Detail:</strong> {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  let targetUrl = '/student/dashboard';
                  try {
                    const storedUser = localStorage.getItem('hostel_user');
                    if (storedUser) {
                      const u = JSON.parse(storedUser);
                      const r = (u?.role || '').toUpperCase().replace(/^ROLE_/, '');
                      if (r === 'BOYS_WARDEN' || (r === 'HOSTEL_HEAD' && u?.hostelType === 'BOYS')) {
                        targetUrl = '/warden/boys/dashboard';
                      } else if (r === 'GIRLS_WARDEN' || (r === 'HOSTEL_HEAD' && u?.hostelType === 'GIRLS')) {
                        targetUrl = '/warden/girls/dashboard';
                      }
                    }
                  } catch (e) {}
                  window.location.href = targetUrl;
                }}
                style={{
                  backgroundColor: '#1b3b6f',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Reload Dashboard
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('hostel_token');
                  localStorage.removeItem('hostel_user');
                  window.location.href = '/login';
                }}
                style={{
                  backgroundColor: 'white',
                  color: '#64748b',
                  border: '1px solid #cbd5e1',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Return to Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
