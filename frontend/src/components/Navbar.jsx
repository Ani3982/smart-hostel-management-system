import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useUI } from '../context/UIContext';
import { notificationService } from '../services/api';
import { 
  Building2, 
  Globe, 
  Bell, 
  LogOut, 
  User, 
  Menu, 
  X, 
  CheckCircle,
  Home as HomeIcon,
  Bed,
  FileText,
  ShieldCheck,
  LogIn,
  UserPlus,
  ShoppingBag,
  Sparkles
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { lang, setLang, toggleLanguage, t } = useLanguage();
  const { toggleSidebar } = useUI();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000); // refresh every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const [countRes, listRes] = await Promise.all([
        notificationService.getUnreadCount(),
        notificationService.getAll()
      ]);
      if (countRes.data.success) setUnreadCount(countRes.data.data);
      if (listRes.data.success) setNotifications(listRes.data.data.slice(0, 5));
    } catch (e) {
      console.error("Could not fetch notifications", e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    const role = (user.role || '').toUpperCase().replace(/^ROLE_/, '');
    if (role === 'GIRLS_WARDEN' || user.hostelType === 'GIRLS') return '/warden/girls/dashboard';
    if (role === 'BOYS_WARDEN' || user.hostelType === 'BOYS') return '/warden/boys/dashboard';
    return '/student/dashboard';
  };

  return (
    <header className="site-sticky-header">
      {/* Subtle Official Top Accent Strip */}
      <div className="header-accent-strip" />

      {/* Unified Single Sticky Navigation Bar */}
      <div className="container site-header-inner">
        {/* College Emblem, Non-Truncating Title & Repositioned Secondary Badges */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
            minWidth: 0,
            flex: 1
          }}
        >
          <img
            src="/college-logo-transparent.png"
            alt="NACSC Ahilyanagar Crest"
            style={{
              width: '40px',
              height: '40px',
              objectFit: 'contain',
              flexShrink: 0,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.12))'
            }}
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="brand-title-text">
              {t('collegeName')}
            </div>
            <div className="brand-meta-row">
              <span
                style={{
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  border: '1px solid #fde68a',
                  padding: '0.05rem 0.4rem',
                  borderRadius: '4px',
                  fontSize: '0.64rem',
                  fontWeight: 800,
                  letterSpacing: '0.03em',
                  whiteSpace: 'nowrap'
                }}
              >
                {t('autonomousBadge')}
              </span>
              <span
                className="hide-on-mobile"
                style={{
                  backgroundColor: '#e0f2fe',
                  color: '#0369a1',
                  padding: '0.05rem 0.4rem',
                  borderRadius: '4px',
                  fontSize: '0.64rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap'
                }}
              >
                {t('naacGrade')}
              </span>
              <span
                className="hide-on-xs"
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  fontWeight: 600
                }}
              >
                {t('hostelSystem')}
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation + Compact Marathi | EN Pill */}
        <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '1.1rem', flexShrink: 0 }}>
          <Link to="/" style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
            <HomeIcon size={16} color="var(--primary)" />
            <span>{t('home')}</span>
          </Link>

          <Link to="/availability" style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
            <Bed size={16} color="var(--primary)" />
            <span>{t('availability')}</span>
          </Link>

          {/* Compact Marathi | EN Pill Toggle */}
          <div className="lang-pill-group" role="group" aria-label="Language toggle">
            <button
              type="button"
              onClick={() => setLang('mr')}
              title="मराठी भाषेत पहा"
              className="lang-pill-btn"
              style={{
                backgroundColor: lang === 'mr' ? 'var(--primary)' : 'transparent',
                color: lang === 'mr' ? '#ffffff' : 'var(--text-muted)'
              }}
            >
              मराठी
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              title="Switch to English"
              className="lang-pill-btn"
              style={{
                backgroundColor: lang === 'en' ? 'var(--primary)' : 'transparent',
                color: lang === 'en' ? '#ffffff' : 'var(--text-muted)'
              }}
            >
              EN
            </button>
          </div>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to={getDashboardLink()} className="btn btn-primary btn-sm">
                <ShieldCheck size={16} />
                <span>{t('dashboard')}</span>
              </Link>

              {/* Notification Popover */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <Bell size={17} color="var(--text-main)" />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      backgroundColor: 'var(--danger)',
                      color: 'white',
                      fontSize: '0.7rem',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div style={{
                    position: 'absolute',
                    top: '46px',
                    right: 0,
                    width: '320px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-xl)',
                    border: '1px solid var(--border)',
                    padding: '1rem',
                    zIndex: 200
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t('notifications')}</span>
                      <button onClick={handleMarkAllRead} style={{ background: 'none', border: 'none', color: 'var(--secondary)', fontSize: '0.775rem', cursor: 'pointer', fontWeight: 600 }}>
                        {t('markAllRead')}
                      </button>
                    </div>
                    {notifications.length === 0 ? (
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>{t('noNotifications')}</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {notifications.map((n) => (
                          <div key={n.id} style={{
                            padding: '0.5rem',
                            borderRadius: '6px',
                            backgroundColor: n.isRead ? 'transparent' : '#f0f9ff',
                            borderLeft: `3px solid ${n.type === 'SUCCESS' ? 'var(--success)' : n.type === 'WARNING' ? 'var(--warning)' : 'var(--primary)'}`
                          }}>
                            <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{n.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{n.message}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Dropdown / Name badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', borderLeft: '1px solid var(--border)', paddingLeft: '0.75rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-main)', maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {(() => {
                      const r = (user.role || '').toUpperCase().replace(/^ROLE_/, '');
                      if (r === 'BOYS_WARDEN') return 'Boys Hostel Warden';
                      if (r === 'GIRLS_WARDEN') return 'Girls Hostel Warden';
                      if (r === 'HOSTEL_HEAD') return user.hostelType === 'GIRLS' ? 'Girls Hostel Warden' : 'Boys Hostel Warden';
                      return t('residentStudent');
                    })()}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title={t('logout')}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--danger)'
                  }}
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Link to="/login" className="btn btn-outline btn-sm">
                <LogIn size={15} />
                <span>{t('login')}</span>
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <UserPlus size={15} />
                <span>{t('applyNow')}</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Right Controls: Compact Pill + Hamburger Toggle */}
        <div className="mobile-toggle" style={{ display: 'none', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
          <button
            type="button"
            onClick={toggleLanguage}
            aria-label="Switch language"
            style={{
              backgroundColor: '#f1f5f9',
              color: 'var(--primary)',
              border: '1px solid #cbd5e1',
              borderRadius: '9999px',
              padding: '0.28rem 0.55rem',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {lang === 'mr' ? 'मराठी | EN' : 'EN | मराठी'}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              cursor: 'pointer'
            }}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu-drawer" style={{
          backgroundColor: '#ffffff',
          borderBottom: '2px solid var(--primary)',
          boxShadow: 'var(--shadow-lg)',
          padding: '1.1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          animation: 'slideDown 0.2s ease-out'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, lineHeight: 1.4 }}>
            {t('societyName')} • {t('naacGrade')}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>
              {user ? `${user.name}` : t('hostelSystem')}
            </span>

            {/* Segmented Language Pills in Mobile Drawer */}
            <div className="lang-pill-group">
              <button
                type="button"
                onClick={() => setLang('mr')}
                className="lang-pill-btn"
                style={{
                  backgroundColor: lang === 'mr' ? 'var(--primary)' : 'transparent',
                  color: lang === 'mr' ? 'white' : 'var(--text-main)'
                }}
              >
                मराठी
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className="lang-pill-btn"
                style={{
                  backgroundColor: lang === 'en' ? 'var(--primary)' : 'transparent',
                  color: lang === 'en' ? 'white' : 'var(--text-main)'
                }}
              >
                EN
              </button>
            </div>
          </div>

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.4rem 0', fontWeight: 600, color: 'var(--text-main)', textDecoration: 'none' }}
          >
            <HomeIcon size={18} color="var(--primary)" />
            <span>{t('home')}</span>
          </Link>

          <Link
            to="/availability/boys"
            onClick={() => setMobileMenuOpen(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.4rem 0', fontWeight: 600, color: 'var(--text-main)', textDecoration: 'none' }}
          >
            <Bed size={18} color="var(--primary)" />
            <span>{t('boysHostelShort')} — {t('availability')}</span>
          </Link>

          <Link
            to="/availability/girls"
            onClick={() => setMobileMenuOpen(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.4rem 0', fontWeight: 600, color: 'var(--text-main)', textDecoration: 'none' }}
          >
            <Bed size={18} color="#0284c7" />
            <span>{t('girlsHostelShort')} — {t('availability')}</span>
          </Link>

          {user ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  toggleSidebar();
                }}
                className="btn btn-outline"
                style={{ width: '100%', justifyContent: 'center', borderColor: 'var(--primary)', color: 'var(--primary)', fontWeight: 700 }}
              >
                <Menu size={18} />
                <span>{user.role?.includes('WARDEN') ? 'Open Warden Navigation Drawer' : 'Open Student Navigation Drawer'}</span>
              </button>

              <Link 
                to={getDashboardLink()} 
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <ShieldCheck size={18} />
                <span>{t('dashboard')}</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="btn btn-danger"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <LogOut size={18} />
                <span>{t('logout')}</span>
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Link 
                to="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-outline"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <LogIn size={18} />
                <span>{t('login')}</span>
              </Link>
              <Link 
                to="/register" 
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <UserPlus size={18} />
                <span>{t('applyNow')}</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
