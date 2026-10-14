import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useUI } from '../context/UIContext';
import { 
  LayoutDashboard, 
  FileText, 
  Bed, 
  DoorClosed, 
  Users, 
  CreditCard, 
  BarChart3, 
  UserCheck, 
  Settings, 
  ShieldCheck,
  User as UserIcon,
  CheckSquare,
  Building2,
  LogOut,
  Bell,
  CalendarCheck,
  AlertTriangle,
  Key,
  X
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const { t, isMr } = useLanguage();
  const { sidebarOpen, closeSidebar, isMobile } = useUI();
  const navigate = useNavigate();

  if (!user) return null;

  const rawRole = (user.role || 'STUDENT').toUpperCase().replace(/^ROLE_/, '');
  const isBoysWarden = rawRole === 'BOYS_WARDEN' || (rawRole === 'HOSTEL_HEAD' && user.hostelType === 'BOYS');
  const isGirlsWarden = rawRole === 'GIRLS_WARDEN' || (rawRole === 'HOSTEL_HEAD' && user.hostelType === 'GIRLS');
  const isWarden = isBoysWarden || isGirlsWarden || rawRole === 'HOSTEL_HEAD';
  const isStudent = rawRole === 'STUDENT';

  const handleLogout = () => {
    closeSidebar();
    logout();
    navigate('/login');
  };

  const handleLinkClick = () => {
    if (isMobile) {
      closeSidebar();
    }
  };

  // Student Links
  const studentLinks = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { to: '/student/apply', icon: FileText, label: t('applyNow') },
    { to: '/student/status', icon: CheckSquare, label: t('applicationStatus') },
    { to: '/student/allocation', icon: Bed, label: t('myRoomBed') },
    { to: '/student/payment', icon: CreditCard, label: t('feePayment') },
    { to: '/student/complaints', icon: AlertTriangle, label: isMr ? 'तक्रारी व समस्या' : 'Complaints & Grievances' },
    { to: '/student/profile', icon: UserIcon, label: t('profile') },
  ];

  // Warden Links
  const wardenDashboardUrl = isGirlsWarden ? '/warden/girls/dashboard' : '/warden/boys/dashboard';

  const wardenLinks = [
    { to: wardenDashboardUrl, icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/warden/students', icon: Users, label: 'Student Management' },
    { to: '/warden/hostel', icon: Building2, label: 'Hostel Management' },
    { to: '/warden/rooms', icon: DoorClosed, label: 'Room Management' },
    { to: '/warden/beds', icon: Bed, label: 'Bed Management' },
    { to: '/warden/applications', icon: FileText, label: 'Student Applications' },
    { to: '/warden/allocations', icon: UserCheck, label: 'Room Allocation' },
    { to: '/warden/attendance', icon: CalendarCheck, label: 'Attendance' },
    { to: '/warden/payments', icon: CreditCard, label: 'Fees & Payments' },
    { to: '/warden/complaints', icon: AlertTriangle, label: 'Complaints' },
    { to: '/warden/notices', icon: Bell, label: 'Notices' },
    { to: '/warden/reports', icon: BarChart3, label: 'Reports' },
    { to: '/warden/profile', icon: UserIcon, label: 'Profile' },
    { to: '/warden/change-password', icon: Key, label: 'Change Password' }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div 
        className={`sidebar-backdrop ${sidebarOpen ? 'active' : ''}`} 
        onClick={closeSidebar}
        aria-hidden="true"
      />

      <aside className={`app-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`} style={{
        padding: '1.25rem 0.85rem',
        borderRight: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header with College Logo, Title & Mobile Close Button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          padding: '0 0.25rem 1.25rem 0.25rem',
          borderBottom: '1px solid #1e293b',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
            <img 
              src="/college-logo-transparent.png" 
              alt="College Logo" 
              style={{ width: '42px', height: '42px', objectFit: 'contain', backgroundColor: 'white', borderRadius: '50%', padding: '2px', flexShrink: 0 }}
            />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontSize: '0.675rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontWeight: 800,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: isGirlsWarden ? '#f472b6' : isBoysWarden ? '#38bdf8' : '#94a3b8'
              }}>
                {isGirlsWarden 
                  ? '🌸 GIRLS WARDEN' 
                  : isBoysWarden 
                  ? '🛡️ BOYS WARDEN' 
                  : (isMr ? '🎓 विद्यार्थी कक्ष' : 'STUDENT PORTAL')}
              </div>
              <div style={{ fontSize: '0.925rem', fontWeight: 800, color: 'white', marginTop: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </div>
            </div>
          </div>

          {/* Close button on mobile/tablet */}
          <button
            onClick={closeSidebar}
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              padding: '0.35rem',
              color: '#94a3b8',
              cursor: 'pointer',
              display: isMobile ? 'flex' : 'none',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Close sidebar navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Links Area */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingRight: '0.2rem' }}>

          {/* WARDEN SIDEBAR */}
          {isWarden && (
            wardenLinks.map(link => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={handleLinkClick}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: isActive ? '#ffffff' : '#94a3b8',
                    backgroundColor: isActive ? (isGirlsWarden ? '#831843' : '#0369a1') : 'transparent'
                  })}
                >
                  <Icon size={17} />
                  <span>{link.label}</span>
                </NavLink>
              );
            })
          )}

          {/* STUDENT SIDEBAR */}
          {isStudent && (
            studentLinks.map(link => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/student' || link.to === '/student/dashboard'}
                  onClick={handleLinkClick}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: isActive ? '#ffffff' : '#94a3b8',
                    backgroundColor: isActive ? '#0369a1' : 'transparent'
                  })}
                >
                  <Icon size={17} />
                  <span>{link.label}</span>
                </NavLink>
              );
            })
          )}

        </div>

        {/* Logout Button */}
        <div style={{ paddingTop: '1rem', borderTop: '1px solid #1e293b', marginTop: '0.5rem' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 700,
              color: '#f87171',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>

      </aside>
    </>
  );
};
