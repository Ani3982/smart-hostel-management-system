import React, { useState, useEffect } from 'react';
import { applicationService } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import { FileText, Search, Building2, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const ManageApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  
  // Modal Review States
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const res = await applicationService.getAll();
      if (res.data.success) {
        setApplications(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectApprove = async (app) => {
    if (!window.confirm(`Confirm and approve hostel admission for student ${app.student.fullName}?`)) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await applicationService.approve(app.id);
      if (res.data.success) {
        loadApplications();
      }
    } catch (err) {
      console.error('Approval failed:', err);
      alert(err.response?.data?.message || 'Failed to approve application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedApp) return;
    setActionLoading(true);
    try {
      const res = await applicationService.approve(selectedApp.id);
      if (res.data.success) {
        setFeedback({ type: 'success', message: 'Admission application approved & confirmed successfully!' });
        loadApplications();
        setTimeout(() => {
          setSelectedApp(null);
        }, 1200);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Approval failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;
    if (!rejectionReason.trim()) {
      setFeedback({ type: 'error', message: 'Please enter a rejection reason' });
      return;
    }

    setActionLoading(true);
    try {
      const res = await applicationService.reject(selectedApp.id, rejectionReason.trim());
      if (res.data.success) {
        setFeedback({ type: 'success', message: 'Application rejected with reason.' });
        loadApplications();
        setTimeout(() => {
          setSelectedApp(null);
        }, 1200);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Rejection failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = applications.filter(app => {
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch = app.student.fullName.toLowerCase().includes(q) ||
                          app.student.studentId.toLowerCase().includes(q) ||
                          app.hostel.hostelName.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.85rem)', fontWeight: 800, color: 'var(--primary)' }}>
          Master Applications Registry
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginTop: '0.25rem' }}>
          Global log of all submitted hostel admissions applications & verification management
        </p>
      </div>

      {/* Filter Bar */}
      <div className="card toolbar-responsive" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-outline'}`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="toolbar-search" style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '38px' }}
            placeholder="Search student or hostel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner message="Loading applications..." />
      ) : (
        <>
          <div className="table-scroll-hint">← Scroll horizontally to view details →</div>
          <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>App ID</th>
                <th>PRN</th>
                <th>Student Name</th>
                <th>Hostel</th>
                <th>Date</th>
                <th>Status</th>
                <th>Approved By</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(app => (
                <tr key={app.id}>
                  <td><strong>#{app.id}</strong></td>
                  <td><span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{app.student.studentId}</span></td>
                  <td style={{ fontWeight: 700 }}>{app.student.fullName}</td>
                  <td>{app.hostel.hostelName}</td>
                  <td>{new Date(app.applicationDate).toLocaleDateString()}</td>
                  <td><StatusBadge status={app.status} /></td>
                  <td>{app.approvedBy || '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      {app.status === 'PENDING' && (
                        <button
                          onClick={() => handleDirectApprove(app)}
                          className="btn btn-success btn-sm"
                          style={{ padding: '0.35rem 0.75rem', fontWeight: 700 }}
                          title="Confirm Admission"
                          disabled={actionLoading}
                        >
                          <CheckCircle size={14} />
                          <span>Confirm</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setRejectMode(false);
                          setRejectionReason('');
                          setFeedback(null);
                        }}
                        className="btn btn-outline btn-sm"
                      >
                        <Eye size={14} />
                        <span>Details</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {/* Full Details Modal */}
      {selectedApp && (
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`Application Details #${selectedApp.id} - ${selectedApp.student.fullName}`}
          maxWidth="820px"
        >
          {feedback && (
            <div style={{
              padding: '0.85rem',
              borderRadius: '8px',
              backgroundColor: feedback.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
              color: feedback.type === 'success' ? '#047857' : '#b91c1c',
              border: `1px solid ${feedback.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
              marginBottom: '1.25rem',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span>{feedback.message}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.875rem', border: '1px solid #e2e8f0' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Student PRN: </span>
              <strong style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{selectedApp.student.studentId}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Full Name: </span>
              <strong>{selectedApp.student.fullName}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Email: </span>
              <strong>{selectedApp.student.email}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Mobile: </span>
              <strong>{selectedApp.student.mobile || '—'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Gender / DOB: </span>
              <strong>{selectedApp.student.gender} • {selectedApp.student.dob || '—'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>College: </span>
              <strong>{selectedApp.student.collegeName || 'New Arts, Commerce and Science College (Autonomous)'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Course & Dept: </span>
              <strong>{selectedApp.student.course} ({selectedApp.student.department || 'General'})</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Academic Year & Roll: </span>
              <strong>{selectedApp.student.academicYear || 'Year 1'} (Roll: {selectedApp.student.rollNumber || '—'})</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Parent / Guardian: </span>
              <strong>{selectedApp.student.parentName || '—'} ({selectedApp.student.parentMobile || '—'})</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Emergency Contact: </span>
              <strong>{selectedApp.student.emergencyContact || '—'}</strong>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <span style={{ color: 'var(--text-muted)' }}>Permanent Address: </span>
              <span>{selectedApp.student.address}, {selectedApp.student.city}, {selectedApp.student.state} - {selectedApp.student.pincode}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Hostel: </span>
              <strong>{selectedApp.hostel.hostelName}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Preferred Room: </span>
              <strong>{selectedApp.preferredRoomType || 'Standard 4-Sharing'}</strong>
            </div>
            {selectedApp.approvedBy && (
              <div style={{ gridColumn: '1 / -1', padding: '0.65rem', backgroundColor: '#ecfdf5', borderRadius: '6px', border: '1px solid #a7f3d0', color: '#047857' }}>
                <span>✅ <strong>Confirmed & Approved By:</strong> {selectedApp.approvedBy} on {new Date(selectedApp.approvedDate).toLocaleDateString()}</span>
              </div>
            )}
            {selectedApp.remarks && (
              <div style={{ gridColumn: '1 / -1', padding: '0.5rem', backgroundColor: 'white', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Application Remarks: </span>
                <em>{selectedApp.remarks}</em>
              </div>
            )}
          </div>

          {/* Rejection Form Input */}
          {rejectMode && (
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--danger-bg)', borderRadius: '8px', border: '1px solid #fecaca' }}>
              <label className="form-label" style={{ color: '#b91c1c' }}>
                Rejection Reason (will be shown on Student Portal):
              </label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handleReject}
                  className="btn btn-danger btn-sm"
                  disabled={actionLoading}
                >
                  Confirm Rejection
                </button>
                <button
                  type="button"
                  onClick={() => setRejectMode(false)}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Current Status:</span>
              <StatusBadge status={selectedApp.status} />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {selectedApp.status !== 'APPROVED' && !rejectMode && (
                <button
                  type="button"
                  onClick={handleApprove}
                  className="btn btn-success"
                  disabled={actionLoading}
                >
                  <CheckCircle size={18} />
                  <span>Confirm Admission</span>
                </button>
              )}

              {selectedApp.status !== 'REJECTED' && !rejectMode && (
                <button
                  type="button"
                  onClick={() => setRejectMode(true)}
                  className="btn btn-danger"
                  disabled={actionLoading}
                >
                  <XCircle size={18} />
                  <span>Reject</span>
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
