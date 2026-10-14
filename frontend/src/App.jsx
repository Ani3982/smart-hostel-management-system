import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { useUI } from './context/UIContext';
import { Menu } from 'lucide-react';

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

      {/* College Footer */}
      {!isPortalRoute && (
        <footer style={{
          backgroundColor: '#0f172a',
          color: '#94a3b8',
          padding: '2.5rem 1.5rem',
          borderTop: '1px solid #1e293b',
          fontSize: '0.85rem'
        }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img 
                src="/college-logo-transparent.png" 
                alt="NACSC Logo" 
                style={{ width: '54px', height: '54px', objectFit: 'contain', backgroundColor: 'white', borderRadius: '50%', padding: '2px' }} 
              />
              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>
                  Ahilyanagar Jilha Maratha Vidya Prasarak Samaj's Ahilyanagar
                </div>
                <div style={{ color: 'white', fontWeight: 800, fontSize: '1.05rem', margin: '0.15rem 0' }}>
                  NEW ARTS, COMMERCE & SCIENCE COLLEGE, AHILYANAGAR (AUTONOMOUS)
                </div>
                <div style={{ color: '#f59e0b', fontSize: '0.785rem', fontWeight: 700 }}>
                  अहिल्यानगर जिल्हा मराठा विद्या प्रसारक समाज संचलित न्यू आर्ट्स, कॉमर्स अँड सायन्स कॉलेज • बोधवाक्य: "तेजो सि तेजो मे देही"
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, color: '#e2e8f0' }}>Online Hostel Admission & Management System</div>
              <div style={{ color: '#64748b', fontSize: '0.775rem', marginTop: '0.25rem' }}>
                मुलांचे वसतिगृह (छत्रपती शिवाजी महाराज भवन) व मुलींचे वसतिगृह (सावित्रीबाई फुले भवन)
              </div>
              <div style={{ color: '#38bdf8', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                🌐 द्विभाषिक प्रणाली (मराठी & English) • वसतिगृह भांडार सुविधा उपलब्ध
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
