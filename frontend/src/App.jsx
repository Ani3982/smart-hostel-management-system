import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { useUI } from './context/UIContext';
import { useLanguage } from './context/LanguageContext';
import { Menu, Phone, Mail, Clock } from 'lucide-react';

// Public Pages
import { Home } from './pages/Home';
import { HostelAvailability } from './pages/HostelAvailability';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { PaymentReceipt } from './pages/student/PaymentReceipt';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { HostelApplication } from './pages/student/HostelApplication';
import { ApplicationStatus } from './pages/student/ApplicationStatus';
import { RoomAllocation } from './pages/student/RoomAllocation';
import { Payment } from './pages/student/Payment';
import { StudentProfile } from './pages/student/StudentProfile';
import { StudentComplaints } from './pages/student/StudentComplaints';

// Warden & Hostel Head Pages
import { HostelHeadDashboard } from './pages/hostelHead/HostelHeadDashboard';
import { Applications } from './pages/hostelHead/Applications';
import { Beds } from './pages/hostelHead/Beds';
import { Rooms } from './pages/hostelHead/Rooms';
import { Students } from './pages/hostelHead/Students';
import { Allocations } from './pages/hostelHead/Allocations';
import { Payments as WardenPayments } from './pages/hostelHead/Payments';
import { Reports } from './pages/hostelHead/Reports';
import { Profile as WardenProfile } from './pages/hostelHead/Profile';
import { Complaints } from './pages/hostelHead/Complaints';
import { Notices } from './pages/hostelHead/Notices';
import { Attendance } from './pages/hostelHead/Attendance';
import { Enquiries } from './pages/hostelHead/Enquiries';
import { ChangePassword } from './pages/hostelHead/ChangePassword';

export function App() {
  const { user } = useAuth();
  const { toggleSidebar } = useUI();
  const { t, lang } = useLanguage();
  const location = useLocation();

  const isPortalRoute = location.pathname.startsWith('/student') ||
                        location.pathname.startsWith('/warden');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <div className="app-layout" style={{ flex: 1, minHeight: 0 }}>
        {user && isPortalRoute && <Sidebar />}

        <main className={isPortalRoute ? "app-content" : ""} style={{ flex: 1, minWidth: 0 }}>
          {user && isPortalRoute && (
            <div className="mobile-portal-bar">
              <button
                type="button"
                onClick={toggleSidebar}
                className="mobile-portal-toggle-btn"
                aria-label="Open portal navigation menu"
              >
                <Menu size={16} />
                <span>{user.role?.includes('WARDEN') ? 'Warden Menu' : 'Student Menu'}</span>
              </button>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                {user.role?.includes('WARDEN') 
                  ? (user.hostelType === 'GIRLS' ? '🌸 Girls Hostel' : '🛡️ Boys Hostel') 
                  : '🎓 Student Portal'}
              </div>
            </div>
          )}

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/availability" element={<HostelAvailability />} />
            <Route path="/availability/:hostelType" element={<HostelAvailability />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/student/receipt/:receiptNumber" element={<PaymentReceipt />} />

            {/* Student Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/apply" element={<HostelApplication />} />
              <Route path="/student/status" element={<ApplicationStatus />} />
              <Route path="/student/allocation" element={<RoomAllocation />} />
              <Route path="/student/payment" element={<Payment />} />
              <Route path="/student/complaints" element={<StudentComplaints />} />
              <Route path="/student/profile" element={<StudentProfile />} />
            </Route>

            {/* Boys Warden Specific Protected Route */}
            <Route element={<ProtectedRoute allowedRoles={['BOYS_WARDEN']} />}>
              <Route path="/warden/boys/dashboard" element={<HostelHeadDashboard forcedHostelId={1} forcedHostelType="BOYS" />} />
            </Route>

            {/* Girls Warden Specific Protected Route */}
            <Route element={<ProtectedRoute allowedRoles={['GIRLS_WARDEN']} />}>
              <Route path="/warden/girls/dashboard" element={<HostelHeadDashboard forcedHostelId={2} forcedHostelType="GIRLS" />} />
            </Route>

            {/* Hostel Head / Warden Common Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['BOYS_WARDEN', 'GIRLS_WARDEN', 'HOSTEL_HEAD']} />}>
              <Route path="/warden" element={<HostelHeadDashboard />} />
              <Route path="/warden/dashboard" element={<HostelHeadDashboard />} />
              <Route path="/warden/hostel" element={<HostelHeadDashboard />} />
              <Route path="/warden/applications" element={<Applications />} />
              <Route path="/warden/applications/:id" element={<Applications />} />
              <Route path="/warden/rooms" element={<Rooms />} />
              <Route path="/warden/beds" element={<Beds />} />
              <Route path="/warden/students" element={<Students />} />
              <Route path="/warden/allocations" element={<Allocations />} />
              <Route path="/warden/allocation" element={<Allocations />} />
              <Route path="/warden/payments" element={<WardenPayments />} />
              <Route path="/warden/complaints" element={<Complaints />} />
              <Route path="/warden/notices" element={<Notices />} />
              <Route path="/warden/attendance" element={<Attendance />} />
              <Route path="/warden/enquiries" element={<Enquiries />} />
              <Route path="/warden/reports" element={<Reports />} />
              <Route path="/warden/profile" element={<WardenProfile />} />
              <Route path="/warden/change-password" element={<ChangePassword />} />
              <Route path="/warden/notifications" element={<Notices />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* College Footer with Official Helpdesk & Warden Contacts */}
      {!isPortalRoute && (
        <footer style={{
          backgroundColor: '#0f172a',
          color: '#94a3b8',
          padding: '2.5rem 1.25rem 2rem',
          borderTop: '1px solid #1e293b',
          fontSize: '0.85rem'
        }}>
          <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Warden & Technical Support Helpdesk Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
              gap: '1.25rem',
              paddingBottom: '1.75rem',
              borderBottom: '1px solid rgba(148, 163, 184, 0.2)'
            }}>
              {/* Boys Warden Helpdesk */}
              <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', padding: '1rem 1.15rem', borderRadius: '12px', border: '1px solid rgba(148,163,184,0.15)' }}>
                <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: '0.92rem', marginBottom: '0.4rem' }}>
                  {lang === 'mr' ? 'मुलांचे वसतिगृह हेल्पडेस्क (वॉर्डन)' : "Boys' Hostel Warden Helpdesk"}
                </div>
                <div style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                  {lang === 'mr' ? 'प्रा. सुरेश पाटील (रेक्टर)' : 'Prof. Suresh Patil (Rector)'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Phone size={14} color="#38bdf8" />
                    <a href="tel:+919876543210" style={{ color: '#e2e8f0' }}>+91 98765 43210</a>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Mail size={14} color="#38bdf8" />
                    <a href="mailto:boyshead@hostel.com" style={{ color: '#e2e8f0' }}>boyshead@hostel.com</a>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#94a3b8' }}>
                    <Clock size={14} color="#f59e0b" />
                    <span>{t('officeHoursText')}</span>
                  </div>
                </div>
              </div>

              {/* Girls Warden Helpdesk */}
              <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', padding: '1rem 1.15rem', borderRadius: '12px', border: '1px solid rgba(148,163,184,0.15)' }}>
                <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: '0.92rem', marginBottom: '0.4rem' }}>
                  {lang === 'mr' ? 'मुलींचे वसतिगृह हेल्पडेस्क (वॉर्डन)' : "Girls' Hostel Warden Helpdesk"}
                </div>
                <div style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                  {lang === 'mr' ? 'डॉ. सुनिता देशमुख (महिला रेक्टर)' : 'Dr. Sunita Deshmukh (Lady Rector)'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Phone size={14} color="#38bdf8" />
                    <a href="tel:+919876543211" style={{ color: '#e2e8f0' }}>+91 98765 43211</a>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Mail size={14} color="#38bdf8" />
                    <a href="mailto:girlshead@hostel.com" style={{ color: '#e2e8f0' }}>girlshead@hostel.com</a>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#94a3b8' }}>
                    <Clock size={14} color="#f59e0b" />
                    <span>{t('officeHoursText')}</span>
                  </div>
                </div>
              </div>

              {/* Technical & Portal Support */}
              <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', padding: '1rem 1.15rem', borderRadius: '12px', border: '1px solid rgba(148,163,184,0.15)' }}>
                <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: '0.92rem', marginBottom: '0.4rem' }}>
                  {t('helpdeskTitle')}
                </div>
                <div style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                  {lang === 'mr' ? 'तांत्रिक व प्रवेश सहाय्य कक्ष' : 'Technical & Admission Support Desk'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Phone size={14} color="#38bdf8" />
                    <a href="tel:+9102412324024" style={{ color: '#e2e8f0' }}>+91 0241-2324024</a>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Mail size={14} color="#38bdf8" />
                    <a href="mailto:support.hostel@nacsc.edu.in" style={{ color: '#e2e8f0' }}>support.hostel@nacsc.edu.in</a>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#94a3b8' }}>
                    <Clock size={14} color="#f59e0b" />
                    <span>{lang === 'mr' ? 'सोम–शनि: १०:०० ते ५:०० (शासकीय सुट्टी वगळून)' : 'Mon–Sat: 10:00 AM – 5:00 PM (Excl. Public Holidays)'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* College Branding Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img 
                  src="/college-logo-transparent.png" 
                  alt="NACSC Logo" 
                  style={{ width: '52px', height: '52px', objectFit: 'contain', backgroundColor: 'white', borderRadius: '50%', padding: '2px', flexShrink: 0 }} 
                />
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600 }}>
                    Ahilyanagar Jilha Maratha Vidya Prasarak Samaj's Ahilyanagar
                  </div>
                  <div style={{ color: 'white', fontWeight: 800, fontSize: '1rem', margin: '0.15rem 0' }}>
                    NEW ARTS, COMMERCE & SCIENCE COLLEGE, AHILYANAGAR (AUTONOMOUS)
                  </div>
                  <div style={{ color: '#f59e0b', fontSize: '0.78rem', fontWeight: 700 }}>
                    अहिल्यानगर जिल्हा मराठा विद्या प्रसारक समाज संचलित न्यू आर्ट्स, कॉमर्स अँड सायन्स कॉलेज • बोधवाक्य: "तेजो सि तेजो मे देही"
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, color: '#e2e8f0' }}>Online Hostel Admission & Management System</div>
                <div style={{ color: '#64748b', fontSize: '0.775rem', marginTop: '0.25rem' }}>
                  मुलांचे वसतिगृह (छत्रपती शिवाजी महाराज भवन) व मुलींचे वसतिगृह (सावित्रीबाई फुले भवन)
                </div>
                <div style={{ color: '#38bdf8', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                  🌐 द्विभाषिक प्रणाली (मराठी & English) • {t('cityAddress')}
                </div>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
