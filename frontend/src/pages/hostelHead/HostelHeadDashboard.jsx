import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { wardenPortalService } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { DashboardCard } from '../../components/DashboardCard';
import { 
  Building2, 
  DoorClosed, 
  Bed, 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  CreditCard, 
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  BarChart3,
  UserCheck
} from 'lucide-react';

export const HostelHeadDashboard = ({ forcedHostelId, forcedHostelType }) => {
  const { user } = useAuth();
  const { t, isMr } = useLanguage();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, [forcedHostelId, forcedHostelType]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      // Calls /api/warden/dashboard - automatically isolated by the authenticated JWT session or override
      const params = forcedHostelId ? { hostelId: forcedHostelId } : {};
      const res = await wardenPortalService.getDashboard(params);
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load warden dashboard stats:', err);
      setError(err.response?.data?.message || 'Failed to connect to Warden Portal service.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading dynamic hostel data from MySQL..." />;
  }

  const isGirlsHostel = forcedHostelType === 'GIRLS' || 
                        forcedHostelId === 2 || 
                        user?.role === 'GIRLS_WARDEN' || 
                        user?.hostelType === 'GIRLS' || 
                        stats?.hostelId === 2;
  const isBoysHostel = !isGirlsHostel;

  const dashboardTitle = isGirlsHostel
    ? 'Girls Hostel Warden Dashboard'
    : 'Boys Hostel Warden Dashboard';

  const hostelDisplayName = isGirlsHostel
    ? 'Girls Hostel'
    : 'Boys Hostel';

  const marathiHostelName = isGirlsHostel
    ? 'मुलींचे वसतिगृह (क्रांतीज्योती सावित्रीबाई फुले भवन)'
    : 'मुलांचे वसतिगृह (छत्रपती शिवाजी महाराज भवन)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Warden Header Banner */}
      <div style={{
        background: isGirlsHostel 
          ? 'linear-gradient(135deg, #0f172a 0%, #831843 60%, #be185d 100%)'
          : 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1b3b6f 100%)',
        color: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: 'clamp(1.25rem, 3vw, 2.25rem)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <img 
            src="/college-logo-transparent.png" 
            alt="NACSC Logo" 
            style={{ width: '56px', height: '56px', objectFit: 'contain', backgroundColor: 'white', borderRadius: '50%', padding: '3px', flexShrink: 0 }}
          />
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'rgba(255,255,255,0.15)',
              padding: '0.2rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              marginBottom: '0.4rem'
            }}>
              <ShieldCheck size={16} />
              <span>{hostelDisplayName} • {stats?.wardenName || user?.name || 'Warden'} (ID: {stats?.employeeId || (isBoysHostel ? 'WH001' : 'WH002')})</span>
            </div>
            
            {/* Exactly "Boys Hostel Warden Dashboard" / "Girls Hostel Warden Dashboard" */}
            <h1 style={{ fontSize: 'clamp(1.25rem, 3.5vw, 1.85rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0.2rem 0' }}>
              {dashboardTitle}
            </h1>

            {/* Exactly "Boys Hostel" / "Girls Hostel" */}
            <div style={{ fontSize: '1rem', fontWeight: 700, color: isGirlsHostel ? '#fbcfe8' : '#93c5fd' }}>
              {hostelDisplayName}
            </div>

            <p style={{ opacity: 0.85, fontSize: '0.8rem', marginTop: '0.2rem' }}>
              New Arts, Commerce & Science College, Ahilyanagar • {marathiHostelName}
            </p>
          </div>
        </div>

        {/* Quick Action Navigation */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link 
            to="/warden/applications" 
            className="btn btn-secondary" 
            style={{ backgroundColor: 'white', color: isGirlsHostel ? '#be185d' : '#1e3a8a', fontWeight: 700 }}
          >
            <FileText size={18} />
            <span>Applications ({stats?.pendingApplications || 0} Pending)</span>
          </Link>
          <Link 
            to="/warden/allocations" 
            className="btn btn-outline" 
            style={{ backgroundColor: 'rgba(255,255,255,0.18)', color: 'white', borderColor: 'transparent', fontWeight: 700 }}
          >
            <UserCheck size={18} />
            <span>Allocations</span>
          </Link>
          <Link 
            to="/warden/reports" 
            className="btn btn-outline" 
            style={{ backgroundColor: 'rgba(255,255,255,0.18)', color: 'white', borderColor: 'transparent', fontWeight: 700 }}
          >
            <BarChart3 size={18} />
            <span>Reports</span>
          </Link>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Pending Application Action Notification */}
      {Number(stats?.pendingApplications) > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#fffbeb',
          border: '1px solid #fde68a',
          padding: '1.1rem 1.5rem',
          borderRadius: '12px',
          color: '#92400e',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <AlertCircle size={24} color="#d97706" />
            <div>
              <strong style={{ fontSize: '1rem' }}>
                {stats.pendingApplications} Pending Application(s) Awaiting Warden Action
              </strong>
              <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '0.15rem' }}>
                Student profiles and submitted admission forms require verification and approval/rejection.
              </div>
            </div>
          </div>
          <Link to="/warden/applications" className="btn btn-primary" style={{ backgroundColor: '#d97706', border: 'none' }}>
            Review Applications
          </Link>
        </div>
      )}

      {/* EXACT 10 METRIC CARDS REQUIRED BY USER (ALL DYNAMIC FROM MYSQL) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
            Live Hostel Statistics ({hostelDisplayName})
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
            ⚡ Updated in real-time from MySQL
          </span>
        </div>

        <div className="stat-grid-responsive">
          
          {/* 1. Total Boys / Girls Students */}
          <DashboardCard
            title={isGirlsHostel ? "TOTAL GIRLS STUDENTS" : "TOTAL BOYS STUDENTS"}
            value={stats?.totalStudents ?? 0}
            icon={Users}
            color="#1e3a8a"
            subtitle={`Allocated in ${hostelDisplayName}`}
          />

          {/* 2. Total Rooms */}
          <DashboardCard
            title={isGirlsHostel ? "TOTAL GIRLS ROOMS" : "TOTAL BOYS ROOMS"}
            value={stats?.totalRooms ?? 0}
            icon={DoorClosed}
            color="#0f172a"
            subtitle="Floor 1 & Floor 2"
          />

          {/* 3. Total Beds */}
          <DashboardCard
            title={isGirlsHostel ? "TOTAL GIRLS BEDS" : "TOTAL BOYS BEDS"}
            value={stats?.totalBeds ?? 0}
            icon={Bed}
            color="#0284c7"
            subtitle="Total student intake"
          />

          {/* 4. Occupied Beds */}
          <DashboardCard
            title="OCCUPIED BEDS"
            value={stats?.occupiedBeds ?? 0}
            icon={Bed}
            color="#8b5cf6"
            subtitle="Active student beds"
          />

          {/* 5. Available Beds */}
          <DashboardCard
            title="AVAILABLE BEDS"
            value={stats?.availableBeds ?? 0}
            icon={CheckCircle}
            color="#059669"
            subtitle="Ready for allocation"
          />

          {/* 6. Pending Applications */}
          <DashboardCard
            title="PENDING APPLICATIONS"
            value={stats?.pendingApplications ?? 0}
            icon={Clock}
            color="#f59e0b"
            subtitle="Awaiting warden review"
          />

          {/* 7. Pending Complaints */}
          <DashboardCard
            title="PENDING COMPLAINTS"
            value={stats?.pendingComplaints ?? 0}
            icon={AlertCircle}
            color="#ea580c"
            subtitle="Hostel maintenance & discipline"
          />

          {/* 8. Pending Requests */}
          <DashboardCard
            title="PENDING REQUESTS"
            value={stats?.pendingRequests ?? 0}
            icon={FileText}
            color="#0284c7"
            subtitle="Leave & night-out passes"
          />

          {/* 8. Approved Applications */}
          <DashboardCard
            title="APPROVED APPLICATIONS"
            value={stats?.approvedApplications ?? 0}
            icon={CheckCircle}
            color="#10b981"
            subtitle="Admissions confirmed"
          />

          {/* 9. Successful Payments */}
          <DashboardCard
            title="SUCCESSFUL PAYMENTS"
            value={stats?.successfulPayments ?? 0}
            icon={CreditCard}
            color="#16a34a"
            subtitle={`₹${(stats?.totalPaymentsAmount || 0).toLocaleString()} Collected`}
          />

        </div>
      </div>

      {/* Operational Modules Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        
        {/* Module: Room & Bed Status */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DoorClosed size={20} color="#1e3a8a" />
              Room & Bed Inventory
            </h3>
            <Link to="/warden/rooms" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563eb' }}>
              Manage Rooms →
            </Link>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Overview of occupancy across all {stats?.totalRooms || 0} rooms in {hostelDisplayName}.
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>OCCUPANCY RATE</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a' }}>
                {stats?.totalBeds ? Math.round(((stats.occupiedBeds || 0) / stats.totalBeds) * 100) : 0}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>VACANT BEDS</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>
                {stats?.availableBeds || 0}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
            <Link to="/warden/rooms" className="btn btn-outline" style={{ flex: 1, textAlign: 'center', fontSize: '0.85rem' }}>
              View Rooms
            </Link>
            <Link to="/warden/beds" className="btn btn-outline" style={{ flex: 1, textAlign: 'center', fontSize: '0.85rem' }}>
              View Beds
            </Link>
          </div>
        </div>

        {/* Module: Student Allocation Workflow */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck size={20} color="#059669" />
              Room & Bed Allocation
            </h3>
            <Link to="/warden/allocations" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#059669' }}>
              Allocate →
            </Link>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Assign approved students to available beds in {hostelDisplayName} with automatic conflict checks.
          </p>
          <div style={{ padding: '0.75rem', backgroundColor: '#ecfdf5', borderRadius: '8px', color: '#065f46', fontSize: '0.825rem', fontWeight: 600 }}>
            ✓ Flow: Approved Application → Select Room → Select AVAILABLE Bed → Confirm Allocation.
          </div>
          <Link to="/warden/allocations" className="btn btn-primary" style={{ backgroundColor: '#059669', textAlign: 'center', marginTop: 'auto' }}>
            Open Allocation Console
          </Link>
        </div>

        {/* Module: Fee Collection */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={20} color="#d97706" />
              Hostel Fees & Collections
            </h3>
            <Link to="/warden/payments" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#d97706' }}>
              View Payments →
            </Link>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Track settled transactions and receipts issued for {hostelDisplayName}.
          </p>
          <div style={{ padding: '0.75rem', backgroundColor: '#fffbeb', borderRadius: '8px', color: '#92400e' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>TOTAL COLLECTED REVENUE</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#b45309' }}>
              ₹{(stats?.totalPaymentsAmount || 0).toLocaleString()}
            </div>
          </div>
          <Link to="/warden/payments" className="btn btn-outline" style={{ textAlign: 'center', marginTop: 'auto' }}>
            View Payment Records
          </Link>
        </div>

      </div>

    </div>
  );
};
