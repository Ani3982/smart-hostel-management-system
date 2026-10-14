import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminWardenService } from '../../services/api';
import { 
  UserPlus, 
  ArrowLeft, 
  ShieldCheck, 
  Building2, 
  Mail, 
  Phone, 
  User, 
  Calendar, 
  Briefcase, 
  Key,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const CreateWarden = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    employeeId: '',
    email: '',
    mobile: '',
    gender: 'MALE',
    joiningDate: new Date().toISOString().substring(0, 10),
    designation: 'Hostel Warden',
    hostelAssignment: '1', // 1 = Boys Hostel, 2 = Girls Hostel
    status: 'ACTIVE',
    password: 'Warden@123'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleHostelChange = (e) => {
    const selectedHostel = e.target.value;
    const isBoys = selectedHostel === '1';
    setFormData(prev => ({
      ...prev,
      hostelAssignment: selectedHostel,
      gender: isBoys ? 'MALE' : 'FEMALE',
      employeeId: isBoys ? 'WH001' : 'WH002',
      designation: isBoys ? 'Boys Hostel Warden' : 'Girls Hostel Warden',
      email: isBoys ? (prev.email || 'boyswarden@college.com') : (prev.email || 'girlswarden@college.com')
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Form validation
    if (!formData.fullName.trim()) {
      setError('Full Name is required.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!formData.mobile.trim()) {
      setError('Mobile Number is required.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        fullName: formData.fullName.trim(),
        employeeId: formData.employeeId.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile.trim(),
        gender: formData.gender,
        joiningDate: formData.joiningDate,
        designation: formData.designation.trim(),
        hostelAssignment: Number(formData.hostelAssignment),
        status: formData.status,
        password: formData.password
      };

      const res = await adminWardenService.create(payload);
      if (res.data.success) {
        setSuccess(`Warden "${formData.fullName}" created successfully with role HOSTEL_HEAD! Redirecting...`);
        setTimeout(() => {
          navigate('/admin/wardens');
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to create warden:', err);
      setError(err.response?.data?.message || 'Failed to create warden account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Breadcrumb & Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/admin/wardens" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Wardens</span>
        </Link>
        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Central Admin / Warden Management / Create
        </div>
      </div>

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
        color: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: 'clamp(1.25rem, 3vw, 2rem)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <UserPlus size={28} />
        </div>
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
            <span>Official Portal Authorization</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.65rem)', fontWeight: 800 }}>Create Warden</h1>
          <p style={{ opacity: 0.85, fontSize: '0.875rem', marginTop: '0.15rem' }}>
            Register and commission an official Hostel Warden. The system automatically enforces security role <strong style={{ color: '#fbbf24' }}>HOSTEL_HEAD</strong> and locks hostel boundaries.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '8px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '8px',
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      {/* Create Form Card */}
      <div className="card" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Section: Hostel Assignment */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Building2 size={18} />
              1. Hostel Assignment & Designation
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1.25rem' }}>
              
              {/* Hostel Assignment Dropdown */}
              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Hostel Assignment <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  className="form-select"
                  value={formData.hostelAssignment}
                  onChange={handleHostelChange}
                  style={{ fontWeight: 600 }}
                >
                  <option value="1">Boys Hostel (छत्रपती शिवाजी महाराज वसतिगृह) [hostel_id = 1]</option>
                  <option value="2">Girls Hostel (सावित्रीबाई फुले वसतिगृह) [hostel_id = 2]</option>
                </select>
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                  Selecting Boys Hostel maps to <strong>hostel_id = 1</strong>; Girls Hostel maps to <strong>hostel_id = 2</strong>.
                </span>
              </div>

              {/* Designation */}
              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Designation <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Boys Hostel Warden"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                />
              </div>

              {/* Security Role (Read-only, automatically assigned) */}
              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Security Role (Auto-Assigned)
                </label>
                <div style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#1e293b',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span>HOSTEL_HEAD</span>
                  <span style={{ fontSize: '0.7rem', color: '#059669', backgroundColor: '#ecfdf5', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                    🔒 SYSTEM LOCKED
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                  The backend automatically assigns role = HOSTEL_HEAD. Manual role entry is forbidden.
                </span>
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0.5rem 0' }} />

          {/* Section: Personal & Contact Details */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <User size={18} />
              2. Warden Personal & Contact Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1.25rem' }}>
              
              {/* Full Name */}
              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Full Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Boys Hostel Warden"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              {/* Employee ID */}
              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Employee ID <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. WH001"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                />
              </div>

              {/* Email */}
              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Official Email <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="e.g. boyswarden@college.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Mobile Number <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="tel"
                  required
                  className="form-input"
                  placeholder="e.g. 9876543210"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
              </div>

              {/* Gender */}
              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Gender <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  className="form-select"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Joining Date */}
              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Joining Date <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                />
              </div>

              {/* Status */}
              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Status <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              {/* Default Password */}
              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Initial Password <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="e.g. Warden@123"
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                  Hashed with BCrypt before storage in MySQL.
                </span>
              </div>
            </div>
          </div>

          {/* Submission Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <Link to="/admin/wardens" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ backgroundColor: '#2563eb', padding: '0.75rem 2rem', fontSize: '0.95rem' }}
            >
              {loading ? 'Creating Warden...' : 'Create Warden Account'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
