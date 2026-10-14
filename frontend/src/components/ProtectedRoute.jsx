import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';
import { ShieldAlert } from 'lucide-react';

export const ProtectedRoute = ({ allowedRoles }) => {
  // 1. ALL HOOKS CALLED AT TOP LEVEL BEFORE ANY RETURN
  const { user, loading } = useAuth();
  const location = useLocation();
  const [redirecting, setRedirecting] = useState(false);

  // Compute roles and permissions safely
  const rawRole = (user?.role || 'STUDENT').toUpperCase().replace(/^ROLE_/, '');
  const normalizedAllowed = allowedRoles?.map(r => r.toUpperCase().replace(/^ROLE_/, ''));

  const getUserDashboard = () => {
    if (rawRole === 'BOYS_WARDEN' || (rawRole === 'HOSTEL_HEAD' && user?.hostelType === 'BOYS')) {
      return '/warden/boys/dashboard';
    }
    if (rawRole === 'GIRLS_WARDEN' || (rawRole === 'HOSTEL_HEAD' && user?.hostelType === 'GIRLS')) {
      return '/warden/girls/dashboard';
    }
    return '/student/dashboard';
  };

  const hasAccess = Boolean(
    user && normalizedAllowed && (
      normalizedAllowed.includes(rawRole) ||
      (normalizedAllowed.includes('HOSTEL_HEAD') && (rawRole === 'BOYS_WARDEN' || rawRole === 'GIRLS_WARDEN')) ||
      (normalizedAllowed.includes('BOYS_WARDEN') && (rawRole === 'BOYS_WARDEN' || (rawRole === 'HOSTEL_HEAD' && user?.hostelType === 'BOYS'))) ||
      (normalizedAllowed.includes('GIRLS_WARDEN') && (rawRole === 'GIRLS_WARDEN' || (rawRole === 'HOSTEL_HEAD' && user?.hostelType === 'GIRLS')))
    )
  );

  // Unconditional top-level useEffect hook
  useEffect(() => {
    if (!loading && user && normalizedAllowed && !hasAccess) {
      const timer = setTimeout(() => {
        setRedirecting(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [loading, user, normalizedAllowed, hasAccess]);

  // 2. CONDITIONAL RETURNS ONLY AFTER ALL HOOKS ARE CALLED
  if (loading) {
    return <LoadingSpinner fullScreen message="Authenticating session..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (normalizedAllowed && !hasAccess) {
    const destination = getUserDashboard();

    if (redirecting) {
      return <Navigate to={destination} replace />;
    }

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1.5px solid #fecaca',
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          maxWidth: '480px',
          boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.15)'
        }}>
          <ShieldAlert size={56} color="#dc2626" style={{ margin: '0 auto 1.25rem auto' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#991b1b', marginBottom: '0.5rem' }}>
            Access Denied
          </h2>
          <p style={{ color: '#7f1d1d', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            You do not have permission to access this area. Redirecting to your dashboard...
          </p>
          <a 
            href={destination} 
            style={{
              display: 'inline-block',
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '0.65rem 1.4rem',
              borderRadius: '8px',
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: '0.875rem'
            }}
          >
            Go to My Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
