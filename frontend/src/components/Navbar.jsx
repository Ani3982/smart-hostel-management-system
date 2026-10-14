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
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Official College Masthead Top Bar */}
      <div style={{
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        padding: '0.35rem clamp(0.65rem, 2vw, 1.25rem)',
        fontSize: '0.785rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* Society & College Title with Emblem */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
          <img 
            src="/college-logo-transparent.png" 
            alt="NACSC Logo" 
            style={{ 
              width: '24px', 
              height: '24px', 
              objectFit: 'contain',
              backgroundColor: 'white',
              borderRadius: '50%',
              padding: '1px',
              flexShrink: 0
            }} 
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', minWidth: 0 }}>
            <span style={{ 
              backgroundColor: '#f59e0b', 
              color: '#0f172a',
              padding: '0.1rem 0.4rem', 
              borderRadius: '4px', 
              fontSize: '0.65rem', 
              fontWeight: 900,
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap'
            }}>
              {t('autonomousBadge')}
            </span>
            <span className="hide-on-mobile" style={{ fontWeight: 700, color: '#f1f5f9' }}>
              {t('societyName')}
            </span>
            <span className="hide-on-mobile" style={{ color: '#94a3b8' }}>•</span>
            <span style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {t('collegeName')}
            </span>
          </div>
        </div>

        {/* Language Switcher Bar: Persistent Store Toggle (मराठी & English) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <span className="hide-on-mobile" style={{ color: '#cbd5e1', fontSize: '0.75rem', fontWeight: 600 }}>
            {t('switchLanguagePrompt')}
          </span>

          {/* Segmented Bilingual Selector */}
          <div style={{
            display: 'inline-flex',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            padding: '2px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.22)'
          }}>
            <button 
              onClick={() => setLang('mr')}
              title="मराठी भाषेत संपूर्ण वेबसाईट पहा (Full Marathi Website)"
              style={{
                backgroundColor: lang === 'mr' ? '#f59e0b' : 'transparent',
                color: lang === 'mr' ? '#0f172a' : '#cbd5e1',
                fontWeight: 800,
                fontSize: '0.725rem',
                padding: '0.2rem 0.6rem',
                borderRadius: '16px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                transition: 'all 0.18s ease'
              }}
            >
              <span>🇮🇳 मराठी</span>
              {lang === 'mr' && <CheckCircle size={11} />}
            </button>

            <button 
              onClick={() => setLang('en')}
              title="View in English"
              style={{
                backgroundColor: lang === 'en' ? '#ffffff' : 'transparent',
                color: lang === 'en' ? '#0f172a' : '#cbd5e1',
                fontWeight: 800,
                fontSize: '0.725rem',
                padding: '0.2rem 0.6rem',
                borderRadius: '16px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                transition: 'all 0.18s ease'
              }}
            >
              <span>🇬🇧 English</span>
              {lang === 'en' && <CheckCircle size={11} />}
            </button>
          </div>

          <span className="hide-on-mobile" style={{ color: '#64748b' }}>|</span>
          <span className="hide-on-mobile" style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>
            {t('naacGrade')}
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 'var(--header-height, 72px)',
        padding: '0 clamp(0.5rem, 2vw, 1rem)'
      }}>
        {/* College Logo and Brand Header */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none', minWidth: 0 }}>
          <img 
            src="/college-logo-transparent.png" 
            alt="NACSC Ahilyanagar Crest" 
            style={{
              width: '44px',
              height: '44px',
              objectFit: 'contain',
              flexShrink: 0,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))'
            }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontWeight: 800,
              fontSize: 'clamp(0.85rem, 2.5vw, 1.05rem)',
              color: 'var(--primary)',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {t('collegeName')}
            </div>
            <div className="hide-on-xs" style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {t('hostelSystem')} • {t('portalSubtitle')}
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '1.35rem' }}>
          <Link to="/" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <HomeIcon size={16} color="var(--primary)" />
            <span>{t('home')}</span>
          </Link>

          <Link to="/availability" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Bed size={16} color="var(--primary)" />
            <span>{t('availability')}</span>
          </Link>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
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
                    width: '38px',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <Bell size={18} color="var(--text-main)" />
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
                    top: '48px',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderLeft: '1px solid var(--border)', paddingLeft: '0.85rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
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
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--danger)'
                  }}
                >
                  <LogOut size={17} />
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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

        {/* Mobile Hamburger Toggle Button */}
        <div className="mobile-toggle" style={{ display: 'none' }}>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '0.45rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              cursor: 'pointer'
            }}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu-drawer" style={{
          backgroundColor: '#ffffff',
          borderBottom: '2px solid var(--primary)',
          boxShadow: 'var(--shadow-lg)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          animation: 'slideDown 0.2s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>
              {user ? `${user.name}` : t('hostelSystem')}
            </span>

            {/* Language Pills in Mobile Drawer */}
            <div style={{
              display: 'inline-flex',
              backgroundColor: '#f1f5f9',
              padding: '2px',
              borderRadius: '20px',
              border: '1px solid #cbd5e1'
            }}>
              <button 
                onClick={() => setLang('mr')}
                style={{
                  backgroundColor: lang === 'mr' ? 'var(--primary)' : 'transparent',
                  color: lang === 'mr' ? 'white' : 'var(--text-main)',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '16px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                मराठी
              </button>
              <button 
                onClick={() => setLang('en')}
                style={{
                  backgroundColor: lang === 'en' ? 'var(--primary)' : 'transparent',
                  color: lang === 'en' ? 'white' : 'var(--text-main)',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '16px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                English
              </button>
            </div>
          </div>

          <Link 
            to="/" 
            onClick={() => setMobileMenuOpen(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', fontWeight: 600, color: 'var(--text-main)', textDecoration: 'none' }}
          >
            <HomeIcon size={18} color="var(--primary)" />
            <span>{t('home')}</span>
          </Link>

          <Link 
            to="/availability" 
            onClick={() => setMobileMenuOpen(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', fontWeight: 600, color: 'var(--text-main)', textDecoration: 'none' }}
          >
            <Bed size={18} color="var(--primary)" />
            <span>{t('availability')}</span>
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
