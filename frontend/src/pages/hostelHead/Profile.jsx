import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { wardenPortalService } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  ShieldCheck, 
  CheckCircle, 
  Briefcase 
} from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await wardenPortalService.getProfile();
      if (res.data.success) {
        setProfile(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading warden credentials..." />;
  }

  const isGirlsHostel = profile?.hostelId === 2 || user?.hostelId === 2;
  const hostelTitle = isGirlsHostel ? 'Girls Hostel' : 'Boys Hostel';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Banner */}
      <div style={{
        background: isGirlsHostel
          ? 'linear-gradient(135deg, #0f172a 0%, #be185d 100%)'
          : 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
        color: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: 'clamp(1.25rem, 3vw, 2.25rem)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'white',
          color: isGirlsHostel ? '#be185d' : '#1e3a8a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.75rem',
          fontWeight: 900,
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          flexShrink: 0
        }}>
          {profile?.fullName?.charAt(0) || 'W'}
        </div>
        <div style={{ minWidth: 'min(100%, 260px)', flex: '1 1 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            padding: '0.2rem 0.65rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            marginBottom: '0.35rem'
          }}>
            <ShieldCheck size={14} />
            <span>ROLE: HOSTEL_HEAD</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', fontWeight: 800 }}>{profile?.fullName || user?.name}</h1>
          <p style={{ opacity: 0.9, fontSize: '0.9rem', marginTop: '0.15rem' }}>
            {profile?.designation || 'Hostel Warden'} • Employee ID: <strong>{profile?.employeeId || (isGirlsHostel ? 'WH002' : 'WH001')}</strong>
          </p>
        </div>
      </div>

      {/* Details Card */}
      <div className="card" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Briefcase size={20} />
          Official Warden Credentials
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1.25rem' }}>
          
          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Assigned Jurisdiction</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
              {profile?.hostelName || hostelTitle}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, marginTop: '0.15rem' }}>
              Hostel ID: {profile?.hostelId || (isGirlsHostel ? 2 : 1)}
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Official Email</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginTop: '0.25rem' }}>
              {profile?.email || user?.email}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
              Primary sign-in identifier
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Contact Number</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginTop: '0.25rem' }}>
              {profile?.mobile || '9876543210'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
              Hostel emergency desk line
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Commission Status</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#059669', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle size={16} />
              <span>ACTIVE & AUTHORIZED</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
              Managed by Super Admin
            </div>
          </div>

        </div>

        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: '#eff6ff',
          borderRadius: '8px',
          border: '1px solid #bfdbfe',
          fontSize: '0.85rem',
          color: '#1e40af'
        }}>
          🛡️ <strong>Hostel Security Boundary Notice:</strong> Your account is authorized exclusively for <strong>{profile?.hostelName || hostelTitle}</strong>. Cross-hostel data access is rejected by server authorization guards.
        </div>
      </div>

    </div>
  );
};
