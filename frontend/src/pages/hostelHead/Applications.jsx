import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { wardenPortalService, documentService } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import { 
  FileText, 
  Search, 
  CheckCircle, 
  XCircle, 
  Eye, 
  AlertCircle, 
  Bed, 
  User, 
  GraduationCap,
  Calendar,
  Building2,
  FileCheck,
  Phone,
  Mail,
  MapPin,
  ExternalLink
} from 'lucide-react';

export const Applications = () => {
  const { user } = useAuth();
  const { t, isMr } = useLanguage();

  const [activeTab, setActiveTab] = useState('PENDING'); // PENDING, APPROVED, REJECTED, ALL
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [hostelInfo, setHostelInfo] = useState({ name: 'Hostel', id: user?.hostelId || 1 });

  // Modal Review States
  const [selectedApp, setSelectedApp] = useState(null);
  const [appDocs, setAppDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const quickReasons = [
    'Incomplete academic credentials',
    'Discrepancy in submitted documents',
    'Hostel seats exhausted for current batch',
    'Distance criteria not fulfilled',
    'Fee payment verification pending'
  ];

  useEffect(() => {
    loadApplications();
  }, [search]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) {
        params.search = search.trim();
      }

      // Calls /api/warden/applications - strictly isolated to the authenticated warden's hostel
      const res = await wardenPortalService.getApplications(params);
      if (res.data.success) {
        setApplications(res.data.data);
        if (res.data.data.length > 0 && res.data.data[0].hostel) {
          setHostelInfo(res.data.data[0].hostel);
        }
      }
    } catch (err) {
      console.error('Failed to load warden applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = async (app) => {
    setSelectedApp(app);
    setRejectMode(false);
    setRejectionReason('');
    setFeedback(null);

    // Fetch student documents if available
    try {
      setLoadingDocs(true);
      const docRes = await documentService.getByStudent(app.student.id);
      if (docRes.data.success) {
        setAppDocs(docRes.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch student documents:', err);
      setAppDocs([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleApprove = async (appId) => {
    try {
      setActionLoading(true);
      setFeedback(null);
      const res = await wardenPortalService.approveApplication(appId);
      if (res.data.success) {
        setFeedback({ type: 'success', message: 'Application approved successfully! Admission confirmed and student notified.' });
        await loadApplications();
        setTimeout(() => {
          setSelectedApp(null);
        }, 1200);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to approve application.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDirectApprove = async (e, app) => {
    e.stopPropagation();
    if (!window.confirm(`Confirm and grant official Warden Admission Approval for ${app.student?.fullName || 'this student'}?`)) {
      return;
    }
    try {
      setActionLoading(true);
      const res = await wardenPortalService.approveApplication(app.id);
      if (res.data.success) {
        await loadApplications();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve application.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDirectReject = (e, app) => {
    e.stopPropagation();
    setSelectedApp(app);
    setRejectMode(true);
    setRejectionReason('');
    setFeedback(null);
  };

  const handleReject = async (appId) => {
    if (!rejectionReason.trim()) {
      setFeedback({ type: 'error', message: 'Rejection reason is mandatory.' });
      return;
    }
    try {
      setActionLoading(true);
      setFeedback(null);
      const res = await wardenPortalService.rejectApplication(appId, rejectionReason.trim());
      if (res.data.success) {
        setFeedback({ type: 'success', message: 'Application rejected with reason. Student notified.' });
        await loadApplications();
        setTimeout(() => {
          setSelectedApp(null);
        }, 1200);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to reject application.' });
    } finally {
      setActionLoading(false);
    }
  };

  const pendingCount = applications.filter(a => a.status === 'PENDING').length;
  const approvedCount = applications.filter(a => a.status === 'APPROVED').length;
  const rejectedCount = applications.filter(a => a.status === 'REJECTED').length;
  const totalCount = applications.length;

  const filteredApps = applications.filter(app => {
    if (activeTab === 'ALL') return true;
    return app.status === activeTab;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header Banner */}
      <div style={{
        background: user?.hostelId === 2
          ? 'linear-gradient(135deg, #0f172a 0%, #be185d 100%)'
          : 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
        color: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div>
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
            <Building2 size={14} />
            <span>{user?.hostelId === 2 ? 'Girls Hostel' : 'Boys Hostel'} • Admission Management</span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Hostel Applications</h1>
          <p style={{ opacity: 0.85, fontSize: '0.875rem', marginTop: '0.15rem' }}>
            Review, verify documents, and grant admission approvals or rejections for your hostel.
          </p>
        </div>

        <Link to="/warden/allocations" className="btn btn-secondary" style={{ backgroundColor: 'white', color: '#1e3a8a', fontWeight: 700 }}>
          <Bed size={16} />
          <span>Allocate Approved Students</span>
        </Link>
      </div>

      {/* Tabs and Search Bar */}
      <div className="card" style={{ padding: '1rem clamp(0.75rem, 2vw, 1.25rem)' }}>
        <div className="toolbar-responsive">
          
          {/* Status Tabs: Pending, Approved, Rejected, All */}
          <div className="toolbar-tabs" style={{ backgroundColor: '#f1f5f9', padding: '0.3rem', borderRadius: '8px' }}>
            <button
              onClick={() => setActiveTab('PENDING')}
              style={{
                padding: '0.45rem 1.15rem',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                backgroundColor: activeTab === 'PENDING' ? '#f59e0b' : 'transparent',
                color: activeTab === 'PENDING' ? 'white' : '#64748b',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span>Pending</span>
              <span style={{
                backgroundColor: activeTab === 'PENDING' ? 'rgba(255,255,255,0.3)' : '#e2e8f0',
                color: activeTab === 'PENDING' ? 'white' : '#475569',
                borderRadius: '9999px',
                padding: '0.1rem 0.45rem',
                fontSize: '0.75rem',
                fontWeight: 800
              }}>
                {pendingCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('APPROVED')}
              style={{
                padding: '0.45rem 1.15rem',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                backgroundColor: activeTab === 'APPROVED' ? '#10b981' : 'transparent',
                color: activeTab === 'APPROVED' ? 'white' : '#64748b',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span>Approved</span>
              <span style={{
                backgroundColor: activeTab === 'APPROVED' ? 'rgba(255,255,255,0.3)' : '#e2e8f0',
                color: activeTab === 'APPROVED' ? 'white' : '#475569',
                borderRadius: '9999px',
                padding: '0.1rem 0.45rem',
                fontSize: '0.75rem',
                fontWeight: 800
              }}>
                {approvedCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('REJECTED')}
              style={{
                padding: '0.45rem 1.15rem',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                backgroundColor: activeTab === 'REJECTED' ? '#ef4444' : 'transparent',
                color: activeTab === 'REJECTED' ? 'white' : '#64748b',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span>Rejected</span>
              <span style={{
                backgroundColor: activeTab === 'REJECTED' ? 'rgba(255,255,255,0.3)' : '#e2e8f0',
                color: activeTab === 'REJECTED' ? 'white' : '#475569',
                borderRadius: '9999px',
                padding: '0.1rem 0.45rem',
                fontSize: '0.75rem',
                fontWeight: 800
              }}>
                {rejectedCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('ALL')}
              style={{
                padding: '0.45rem 1.15rem',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                backgroundColor: activeTab === 'ALL' ? '#1e3a8a' : 'transparent',
                color: activeTab === 'ALL' ? 'white' : '#64748b',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span>All</span>
              <span style={{
                backgroundColor: activeTab === 'ALL' ? 'rgba(255,255,255,0.3)' : '#e2e8f0',
                color: activeTab === 'ALL' ? 'white' : '#475569',
                borderRadius: '9999px',
                padding: '0.1rem 0.45rem',
                fontSize: '0.75rem',
                fontWeight: 800
              }}>
                {totalCount}
              </span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="toolbar-search" style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px', fontSize: '0.875rem' }}
              placeholder="Search student PRN, name, course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

        </div>
      </div>

      <div className="table-scroll-hint">👈 Swipe horizontally to view all columns 👉</div>

      {/* Applications Table */}
      {loading ? (
        <LoadingSpinner message="Loading applications..." />
      ) : filteredApps.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <FileText size={48} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No {activeTab.toLowerCase()} applications found</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {search ? 'Try modifying your search filter.' : 'All incoming applications for your assigned hostel will appear here.'}
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ margin: 0 }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Student Name</th>
                  <th>Student ID</th>
                  <th>Course</th>
                  <th>Application Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', minWidth: '220px' }}>Warden Authority Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <span style={{ fontWeight: 800, color: '#1e3a8a' }}>
                        APP-{String(app.id).padStart(4, '0')}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{app.student?.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{app.student?.email}</div>
                    </td>
                    <td>
                      <span style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        backgroundColor: '#f1f5f9',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px'
                      }}>
                        {app.student?.studentId || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#334155' }}>{app.student?.course}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Year: {app.student?.academicYear || '1st Year'}</div>
                    </td>
                    <td style={{ color: '#334155' }}>
                      {app.applicationDate ? new Date(app.applicationDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      <StatusBadge status={app.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        
                        {/* View / Review Action */}
                        <button
                          onClick={() => handleOpenReview(app)}
                          className="btn btn-outline btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.65rem' }}
                          title="View student dossier and documents"
                        >
                          <Eye size={14} />
                          <span>Review</span>
                        </button>

                        {/* PENDING: Approve and Reject */}
                        {app.status === 'PENDING' && (
                          <>
                            <button
                              onClick={(e) => handleDirectApprove(e, app)}
                              disabled={actionLoading}
                              className="btn btn-sm"
                              style={{
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.35rem 0.65rem',
                                fontWeight: 700
                              }}
                              title="Directly confirm and approve admission"
                            >
                              <CheckCircle size={14} />
                              <span>Approve</span>
                            </button>

                            <button
                              onClick={(e) => handleDirectReject(e, app)}
                              disabled={actionLoading}
                              className="btn btn-sm"
                              style={{
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.35rem 0.65rem',
                                fontWeight: 700
                              }}
                              title="Reject application with mandatory reason"
                            >
                              <XCircle size={14} />
                              <span>Reject</span>
                            </button>
                          </>
                        )}

                        {/* APPROVED: Link to Allocate Bed and option to Revoke */}
                        {app.status === 'APPROVED' && (
                          <>
                            <Link
                              to="/warden/allocations"
                              className="btn btn-sm"
                              style={{
                                backgroundColor: '#0284c7',
                                color: 'white',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.35rem 0.65rem',
                                fontWeight: 700
                              }}
                              title="Allocate room & bed to this approved student"
                            >
                              <Bed size={14} />
                              <span>Allocate</span>
                            </Link>

                            <button
                              onClick={(e) => handleDirectReject(e, app)}
                              disabled={actionLoading}
                              className="btn btn-sm btn-outline"
                              style={{
                                borderColor: '#fca5a5',
                                color: '#dc2626',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.35rem 0.65rem'
                              }}
                              title="Revoke admission approval"
                            >
                              <XCircle size={14} />
                              <span>Revoke</span>
                            </button>
                          </>
                        )}

                        {/* REJECTED: Option to Re-evaluate and Approve */}
                        {app.status === 'REJECTED' && (
                          <button
                            onClick={(e) => handleDirectApprove(e, app)}
                            disabled={actionLoading}
                            className="btn btn-sm btn-outline"
                            style={{
                              borderColor: '#86efac',
                              color: '#15803d',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.35rem 0.65rem',
                              fontWeight: 700
                            }}
                            title="Re-evaluate and confirm admission"
                          >
                            <CheckCircle size={14} />
                            <span>Re-Approve</span>
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE APPLICATION REVIEW MODAL */}
      {selectedApp && (
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`Application Details - APP-${String(selectedApp.id).padStart(4, '0')}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '75vh', overflowY: 'auto', paddingRight: '0.25rem' }}>
            
            {/* Feedback Alert */}
            {feedback && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                backgroundColor: feedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
                border: `1px solid ${feedback.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
                color: feedback.type === 'success' ? '#065f46' : '#991b1b',
                fontSize: '0.875rem'
              }}>
                {feedback.message}
              </div>
            )}

            {/* Application Overview Banner */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Applied Hostel</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e3a8a' }}>{selectedApp.hostel?.hostelName}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Submission Date</div>
                <div style={{ fontWeight: 700 }}>{selectedApp.applicationDate ? new Date(selectedApp.applicationDate).toLocaleDateString() : 'N/A'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Current Status</div>
                <div><StatusBadge status={selectedApp.status} /></div>
              </div>
            </div>

            {/* 1. Student Details */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                <User size={16} />
                1. Student Details
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div><strong>Full Name:</strong> {selectedApp.student?.fullName}</div>
                <div><strong>Student PRN:</strong> {selectedApp.student?.studentId}</div>
                <div><strong>Mobile:</strong> {selectedApp.student?.mobile}</div>
                <div><strong>Email:</strong> {selectedApp.student?.email}</div>
              </div>
            </div>

            {/* 2. Personal Details */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                <MapPin size={16} />
                2. Personal Details & Address
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div><strong>Gender:</strong> {selectedApp.student?.gender}</div>
                <div><strong>Date of Birth:</strong> {selectedApp.student?.dob || 'N/A'}</div>
                <div><strong>Address:</strong> {selectedApp.student?.address || 'N/A'}</div>
                <div><strong>City / State / Pincode:</strong> {selectedApp.student?.city}, {selectedApp.student?.state} - {selectedApp.student?.pincode}</div>
              </div>
            </div>

            {/* 3. Parent Details */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                <Phone size={16} />
                3. Parent & Guardian Details
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div><strong>Parent / Guardian Name:</strong> {selectedApp.student?.parentName || 'N/A'}</div>
                <div><strong>Parent Mobile:</strong> {selectedApp.student?.parentMobile || 'N/A'}</div>
                <div><strong>Emergency Contact:</strong> {selectedApp.student?.emergencyContact || 'N/A'}</div>
              </div>
            </div>

            {/* 4. Course Details */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                <GraduationCap size={16} />
                4. Academic & Course Details
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div><strong>College Name:</strong> {selectedApp.student?.collegeName || "New Arts, Commerce & Science College, Ahilyanagar"}</div>
                <div><strong>Course:</strong> {selectedApp.student?.course}</div>
                <div><strong>Department:</strong> {selectedApp.student?.department || 'Science'}</div>
                <div><strong>Academic Year:</strong> {selectedApp.student?.academicYear || '1st Year'}</div>
                <div><strong>Roll Number:</strong> {selectedApp.student?.rollNumber || 'N/A'}</div>
              </div>
            </div>

            {/* 5. Documents */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                <FileCheck size={16} />
                5. Uploaded Verification Documents
              </h4>
              {loadingDocs ? (
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Loading documents...</div>
              ) : appDocs.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  No uploaded document files found in storage.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {appDocs.map((doc) => (
                    <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{doc.documentType}</span>
                      <a href={doc.fileUrl || '#'} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        View File <ExternalLink size={12} />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 6. Application Details & Remarks */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                <FileText size={16} />
                6. Application Details & Warden Remarks
              </h4>
              <div style={{ fontSize: '0.875rem' }}>
                <div><strong>Preferred Room Type:</strong> {selectedApp.preferredRoomType || 'STANDARD'}</div>
                {selectedApp.remarks && <div style={{ marginTop: '0.35rem' }}><strong>Student Remarks:</strong> {selectedApp.remarks}</div>}
                {selectedApp.approvedBy && <div style={{ marginTop: '0.35rem', color: '#059669' }}><strong>Approved By:</strong> {selectedApp.approvedBy} ({new Date(selectedApp.approvedDate).toLocaleDateString()})</div>}
                {selectedApp.rejectionReason && <div style={{ marginTop: '0.35rem', color: '#dc2626' }}><strong>Rejection Reason:</strong> {selectedApp.rejectionReason}</div>}
              </div>
            </div>

            {/* Rejection Form Input if in Reject Mode */}
            {rejectMode && (
              <div style={{ backgroundColor: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '8px', padding: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 800, color: '#991b1b', marginBottom: '0.4rem' }}>
                  Mandatory Rejection / Revocation Reason *
                </label>
                
                {/* Quick reason suggestions */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.65rem' }}>
                  {quickReasons.map((qr) => (
                    <button
                      key={qr}
                      type="button"
                      onClick={() => setRejectionReason(qr)}
                      style={{
                        fontSize: '0.725rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #f87171',
                        backgroundColor: rejectionReason === qr ? '#ef4444' : '#fff',
                        color: rejectionReason === qr ? '#fff' : '#b91c1c',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      + {qr}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  required
                  className="form-input"
                  placeholder="State the official reason for declining or revoking admission..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            )}

            {/* Action Buttons: Full Warden Authority */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedApp(null)}>
                Close
              </button>

              {/* PENDING ACTIONS */}
              {!rejectMode && selectedApp.status === 'PENDING' && (
                <>
                  <button
                    className="btn"
                    style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', fontWeight: 700 }}
                    onClick={() => setRejectMode(true)}
                  >
                    Reject Application
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ backgroundColor: '#10b981', border: 'none', fontWeight: 700 }}
                    disabled={actionLoading}
                    onClick={() => handleApprove(selectedApp.id)}
                  >
                    {actionLoading ? 'Approving...' : 'Approve Admission'}
                  </button>
                </>
              )}

              {/* APPROVED ACTIONS */}
              {!rejectMode && selectedApp.status === 'APPROVED' && (
                <>
                  <button
                    className="btn btn-outline"
                    style={{ borderColor: '#ef4444', color: '#ef4444', fontWeight: 600 }}
                    onClick={() => setRejectMode(true)}
                  >
                    Revoke / Reject Admission
                  </button>
                  <Link
                    to="/warden/allocations"
                    className="btn"
                    style={{ backgroundColor: '#0284c7', color: 'white', textDecoration: 'none', fontWeight: 700 }}
                  >
                    Allocate Room & Bed
                  </Link>
                </>
              )}

              {/* REJECTED ACTIONS */}
              {!rejectMode && selectedApp.status === 'REJECTED' && (
                <button
                  className="btn"
                  style={{ backgroundColor: '#10b981', color: 'white', border: 'none', fontWeight: 700 }}
                  disabled={actionLoading}
                  onClick={() => handleApprove(selectedApp.id)}
                >
                  {actionLoading ? 'Approving...' : 'Re-evaluate & Approve Admission'}
                </button>
              )}

              {/* REJECT CONFIRMATION */}
              {rejectMode && (
                <>
                  <button className="btn btn-outline" onClick={() => setRejectMode(false)}>
                    Cancel
                  </button>
                  <button
                    className="btn"
                    style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', fontWeight: 700 }}
                    disabled={actionLoading || !rejectionReason.trim()}
                    onClick={() => handleReject(selectedApp.id)}
                  >
                    {actionLoading ? 'Processing...' : 'Confirm Decision'}
                  </button>
                </>
              )}

            </div>

          </div>
        </Modal>
      )}

    </div>
  );
};
