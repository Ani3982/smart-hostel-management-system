import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { adminWardenService } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Modal } from '../../components/Modal';
import { 
  ShieldCheck, 
  UserPlus, 
  Search, 
  Key, 
  Edit3, 
  Power, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Building2, 
  Mail, 
  Phone, 
  Calendar,
  AlertCircle
} from 'lucide-react';

export const AllWardens = () => {
  const location = useLocation();
  const [wardens, setWardens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterHostel, setFilterHostel] = useState('ALL'); // ALL, 1, 2
  const [message, setMessage] = useState(null);

  // Modals state
  const [viewWarden, setViewWarden] = useState(null);
  const [editWarden, setEditWarden] = useState(null);
  const [resetWarden, setResetWarden] = useState(null);
  const [newPassword, setNewPassword] = useState('Warden@123');
  const [actionLoading, setActionLoading] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    fullName: '',
    employeeId: '',
    email: '',
    mobile: '',
    gender: 'MALE',
    designation: '',
    joiningDate: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    // Check if query string has hostel filter (e.g. ?hostel=1)
    const params = new URLSearchParams(location.search);
    const h = params.get('hostel');
    if (h) {
      setFilterHostel(h);
    }
    loadWardens();
  }, [location.search]);

  const loadWardens = async () => {
    try {
      setLoading(true);
      const res = await adminWardenService.getAll();
      if (res.data.success) {
        setWardens(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load wardens:', err);
      setMessage({ type: 'danger', text: 'Failed to load wardens list.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (w) => {
    setEditWarden(w);
    setEditForm({
      fullName: w.fullName || w.name,
      employeeId: w.employeeId || '',
      email: w.email || '',
      mobile: w.mobile || '',
      gender: w.gender || 'MALE',
      designation: w.designation || '',
      joiningDate: w.joiningDate ? w.joiningDate.substring(0, 10) : '',
      status: w.status || 'ACTIVE'
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editWarden) return;
    try {
      setActionLoading(true);
      const res = await adminWardenService.update(editWarden.id, editForm);
      if (res.data.success) {
        setMessage({ type: 'success', text: `Warden ${editForm.fullName} updated successfully!` });
        setEditWarden(null);
        loadWardens();
      }
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to update warden.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (w) => {
    const isActivating = w.status !== 'ACTIVE';
    const confirmMsg = isActivating 
      ? `Are you sure you want to ACTIVATE ${w.fullName}?` 
      : `Are you sure you want to DEACTIVATE ${w.fullName}?`;
    
    if (!window.confirm(confirmMsg)) return;

    try {
      setActionLoading(true);
      if (isActivating) {
        await adminWardenService.activate(w.id);
        setMessage({ type: 'success', text: `Warden ${w.fullName} activated successfully.` });
      } else {
        await adminWardenService.deactivate(w.id);
        setMessage({ type: 'warning', text: `Warden ${w.fullName} deactivated successfully.` });
      }
      loadWardens();
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Action failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetWarden) return;
    try {
      setActionLoading(true);
      const res = await adminWardenService.resetPassword(resetWarden.id, newPassword);
      if (res.data.success) {
        setMessage({ type: 'success', text: res.data.message });
        setResetWarden(null);
        setNewPassword('Warden@123');
      }
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to reset password.' });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredWardens = wardens.filter(w => {
    const matchesSearch = 
      (w.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (w.employeeId || '').toLowerCase().includes(search.toLowerCase()) ||
      (w.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (w.hostelName || '').toLowerCase().includes(search.toLowerCase());

    const matchesHostel = filterHostel === 'ALL' || String(w.hostelId) === String(filterHostel);
    return matchesSearch && matchesHostel;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
        color: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: 'clamp(1.25rem, 3vw, 2rem)',
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
            alt="College Logo" 
            style={{ width: '56px', height: '56px', objectFit: 'contain', backgroundColor: 'white', borderRadius: '50%', padding: '3px' }}
          />
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'rgba(245, 158, 11, 0.2)',
              color: '#fbbf24',
              padding: '0.2rem 0.65rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              marginBottom: '0.35rem'
            }}>
              <ShieldCheck size={14} />
              <span>Super Admin Management Console</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.65rem)', fontWeight: 800 }}>Warden Management (All Wardens)</h1>
            <p style={{ opacity: 0.85, fontSize: '0.875rem', marginTop: '0.15rem' }}>
              Authorize, configure, and monitor Boys Hostel and Girls Hostel Wardens.
            </p>
          </div>
        </div>

        <Link to="/admin/wardens/create" className="btn btn-primary" style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserPlus size={18} />
          <span>Create New Warden</span>
        </Link>
      </div>

      {/* Alert Notifications */}
      {message && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: message.type === 'success' ? '#ecfdf5' : message.type === 'warning' ? '#fffbeb' : '#fef2f2',
          border: `1px solid ${message.type === 'success' ? '#a7f3d0' : message.type === 'warning' ? '#fde68a' : '#fecaca'}`,
          color: message.type === 'success' ? '#065f46' : message.type === 'warning' ? '#92400e' : '#991b1b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* Filter Tabs and Search Bar */}
      <div className="card toolbar-responsive" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', width: '100%' }}>
          
          {/* Hostel Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#f1f5f9', padding: '0.3rem', borderRadius: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilterHostel('ALL')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                backgroundColor: filterHostel === 'ALL' ? '#1e3a8a' : 'transparent',
                color: filterHostel === 'ALL' ? 'white' : '#64748b'
              }}
            >
              All Wardens ({wardens.length})
            </button>
            <button
              onClick={() => setFilterHostel('1')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                backgroundColor: filterHostel === '1' ? '#1e3a8a' : 'transparent',
                color: filterHostel === '1' ? 'white' : '#64748b'
              }}
            >
              Boys Hostel Warden
            </button>
            <button
              onClick={() => setFilterHostel('2')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                backgroundColor: filterHostel === '2' ? '#1e3a8a' : 'transparent',
                color: filterHostel === '2' ? 'white' : '#64748b'
              }}
            >
              Girls Hostel Warden
            </button>
          </div>

          {/* Search Box */}
          <div className="toolbar-search" style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px', fontSize: '0.875rem' }}
              placeholder="Search by name, ID, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Wardens Table */}
      {loading ? (
        <LoadingSpinner message="Loading Wardens List..." />
      ) : filteredWardens.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <ShieldCheck size={48} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No Wardens Found</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {search ? 'Try modifying your search query.' : 'Create the official Boys & Girls Hostel Wardens.'}
          </p>
          <Link to="/admin/wardens/create" className="btn btn-primary" style={{ marginTop: '1.25rem', display: 'inline-flex' }}>
            Create Warden Now
          </Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-scroll-hint">← Scroll horizontally to view details →</div>
          <div className="table-container" style={{ margin: 0 }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>ID</th>
                  <th>Warden Name</th>
                  <th>Employee ID</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Assigned Hostel</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', minWidth: '220px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWardens.map((w, idx) => (
                  <tr key={w.id}>
                    <td>
                      <span style={{ fontWeight: 800, color: '#1e3a8a' }}>
                        W00{w.id}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: w.hostelId === 1 ? '#eff6ff' : '#fdf2f8',
                          color: w.hostelId === 1 ? '#1d4ed8' : '#be185d',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.875rem'
                        }}>
                          {w.fullName?.charAt(0) || 'W'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{w.fullName || w.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{w.designation || 'Hostel Warden'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        backgroundColor: '#f1f5f9',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px'
                      }}>
                        {w.employeeId || `WH00${w.id}`}
                      </span>
                    </td>
                    <td style={{ color: '#334155' }}>{w.email}</td>
                    <td style={{ color: '#334155' }}>{w.mobile}</td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        backgroundColor: w.hostelId === 1 ? '#eff6ff' : '#fdf2f8',
                        color: w.hostelId === 1 ? '#1e40af' : '#9d174d'
                      }}>
                        <Building2 size={13} />
                        {w.hostelName}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        backgroundColor: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        color: '#334155',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px'
                      }}>
                        HOSTEL_HEAD
                      </span>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '9999px',
                        backgroundColor: w.status === 'ACTIVE' ? '#ecfdf5' : '#fef2f2',
                        color: w.status === 'ACTIVE' ? '#047857' : '#b91c1c'
                      }}>
                        {w.status === 'ACTIVE' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {w.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                        
                        {/* View Details */}
                        <button
                          title="View Warden Profile"
                          onClick={() => setViewWarden(w)}
                          style={{
                            padding: '0.35rem 0.6rem',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: 'white',
                            color: '#0f172a',
                            cursor: 'pointer'
                          }}
                        >
                          <Eye size={15} />
                        </button>

                        {/* Edit Warden */}
                        <button
                          title="Edit Warden Information"
                          onClick={() => handleOpenEdit(w)}
                          style={{
                            padding: '0.35rem 0.6rem',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: 'white',
                            color: '#1d4ed8',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit3 size={15} />
                        </button>

                        {/* Reset Password */}
                        <button
                          title="Reset Password"
                          onClick={() => setResetWarden(w)}
                          style={{
                            padding: '0.35rem 0.6rem',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: 'white',
                            color: '#d97706',
                            cursor: 'pointer'
                          }}
                        >
                          <Key size={15} />
                        </button>

                        {/* Activate / Deactivate */}
                        <button
                          title={w.status === 'ACTIVE' ? 'Deactivate Warden' : 'Activate Warden'}
                          onClick={() => handleToggleStatus(w)}
                          style={{
                            padding: '0.35rem 0.6rem',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: w.status === 'ACTIVE' ? '#fff1f2' : '#f0fdf4',
                            color: w.status === 'ACTIVE' ? '#e11d48' : '#16a34a',
                            cursor: 'pointer'
                          }}
                        >
                          <Power size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW WARDEN MODAL */}
      {viewWarden && (
        <Modal
          isOpen={!!viewWarden}
          onClose={() => setViewWarden(null)}
          title={`Warden Details: ${viewWarden.fullName || viewWarden.name}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '8px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: viewWarden.hostelId === 1 ? '#1e40af' : '#9d174d',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 800
              }}>
                {(viewWarden.fullName || viewWarden.name)?.charAt(0)}
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{viewWarden.fullName || viewWarden.name}</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{viewWarden.designation} • {viewWarden.employeeId}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Assigned Hostel</div>
                <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>{viewWarden.hostelName} (ID: {viewWarden.hostelId})</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Security Role</div>
                <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>HOSTEL_HEAD</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Official Email</div>
                <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '0.2rem' }}>{viewWarden.email}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Contact Mobile</div>
                <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '0.2rem' }}>{viewWarden.mobile}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Gender</div>
                <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '0.2rem' }}>{viewWarden.gender}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Joining Date</div>
                <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '0.2rem' }}>
                  {viewWarden.joiningDate ? new Date(viewWarden.joiningDate).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Account Status</div>
                <div style={{ fontWeight: 700, color: viewWarden.status === 'ACTIVE' ? '#059669' : '#dc2626', marginTop: '0.2rem' }}>
                  {viewWarden.status}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Hostel Type</div>
                <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '0.2rem' }}>{viewWarden.hostelType}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setViewWarden(null)}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* EDIT WARDEN MODAL */}
      {editWarden && (
        <Modal
          isOpen={!!editWarden}
          onClose={() => setEditWarden(null)}
          title={`Edit Warden: ${editWarden.fullName || editWarden.name}`}
        >
          <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem' }}>
              <div>
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label">Employee ID *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={editForm.employeeId}
                  onChange={(e) => setEditForm({ ...editForm, employeeId: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label">Official Email *</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label">Mobile Number *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={editForm.mobile}
                  onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label">Gender</label>
                <select
                  className="form-select"
                  value={editForm.gender}
                  onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
              <div>
                <label className="form-label">Designation</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.designation}
                  onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label">Joining Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={editForm.joiningDate}
                  onChange={(e) => setEditForm({ ...editForm, joiningDate: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            <div style={{
              padding: '0.75rem',
              backgroundColor: '#eff6ff',
              borderRadius: '6px',
              fontSize: '0.825rem',
              color: '#1e40af'
            }}>
              ℹ️ Assigned Hostel: <strong>{editWarden.hostelName} (hostel_id = {editWarden.hostelId})</strong>. Security role is locked to <strong>HOSTEL_HEAD</strong>.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setEditWarden(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* RESET PASSWORD MODAL */}
      {resetWarden && (
        <Modal
          isOpen={!!resetWarden}
          onClose={() => setResetWarden(null)}
          title={`Reset Password for ${resetWarden.fullName || resetWarden.name}`}
        >
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ fontSize: '0.9rem', color: '#475569' }}>
              Enter the new temporary password for <strong>{resetWarden.email}</strong>. The warden will use this to sign in.
            </p>

            <div>
              <label className="form-label">New Password *</label>
              <input
                type="text"
                required
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="e.g. Warden@123"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setResetWarden(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                {actionLoading ? 'Resetting...' : 'Confirm Reset Password'}
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
