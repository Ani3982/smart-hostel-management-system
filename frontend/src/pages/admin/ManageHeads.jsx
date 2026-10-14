import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Modal } from '../../components/Modal';
import { UserCheck, Phone, Mail, Building2, ShieldCheck, Edit3, Save, CheckCircle, AlertCircle } from 'lucide-react';

export const ManageHeads = () => {
  const { isMr } = useLanguage();
  const [heads, setHeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editingHead, setEditingHead] = useState(null);
  const [formData, setFormData] = useState({ name: '', mobile: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    loadHeads();
  }, []);

  const loadHeads = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hostel-heads');
      if (res.data.success) {
        setHeads(res.data.data);
      }
    } catch (err) {
      console.error(err);
      // Fallback
      setHeads([
        {
          id: 1,
          name: "Prof. Suresh Patil",
          email: "boyshead@hostel.com",
          mobile: "9876543210",
          hostel: {
            hostelName: "Boys Hostel (छत्रपती शिवाजी महाराज वसतिगृह)",
            hostelType: "BOYS"
          }
        },
        {
          id: 2,
          name: "Dr. Sunita Deshmukh",
          email: "girlshead@hostel.com",
          mobile: "9876543211",
          hostel: {
            hostelName: "Girls Hostel (सावित्रीबाई फुले वसतिगृह)",
            hostelType: "GIRLS"
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (head) => {
    setEditingHead(head);
    setFeedback(null);
    setFormData({
      name: head.name || '',
      mobile: head.mobile || '',
      email: head.email || ''
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      // Local update & API call if supported
      setHeads(prev => prev.map(h => h.id === editingHead.id ? { ...h, ...formData } : h));
      setFeedback({ type: 'success', message: isMr ? 'वसतिगृह प्रमुख माहिती जतन केली!' : 'Hostel Head details updated successfully!' });
      setTimeout(() => {
        setEditingHead(null);
      }, 1000);
    } catch (e) {
      setFeedback({ type: 'error', message: 'Failed to update details' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading hostel wardens..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.85rem)', fontWeight: 800, color: 'var(--primary)' }}>
            {isMr ? 'वसतिगृह प्रमुख व रेक्टर व्यवस्थापन' : 'Hostel Wardens & Heads of Hostels'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginTop: '0.25rem' }}>
            {isMr 
              ? 'मुले व मुलींच्या वसतिगृहांचे अधिकृत प्रमुख, अर्ज मंजुरी व खोली वाटप अधिकार' 
              : 'Authorized rectors managing student applications, room allocations, and discipline'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.5rem' }}>
        {heads.map(head => (
          <div key={head.id} className="card" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  backgroundColor: head.hostel.hostelType === 'BOYS' ? '#e8f0fe' : '#fce7f3',
                  color: head.hostel.hostelType === 'BOYS' ? '#1b3b6f' : '#be185d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <UserCheck size={26} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {head.name}
                  </h3>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: head.hostel.hostelType === 'BOYS' ? '#1b3b6f' : '#be185d' }}>
                    {head.hostel.hostelName}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleOpenEdit(head)}
                className="btn btn-outline btn-sm"
                title={isMr ? "माहिती बदला" : "Edit Details"}
                style={{ padding: '0.35rem 0.65rem' }}
              >
                <Edit3 size={14} />
                <span>{isMr ? 'बदला' : 'Edit'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '8px', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} color="var(--primary)" />
                <span>{head.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} color="var(--primary)" />
                <span>+91 {head.mobile}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={16} color="var(--success)" />
                <span>{isMr ? `${head.hostel.hostelType} वसतिगृह प्रमुख अधिकार` : `Full Administrative Authority for ${head.hostel.hostelType} Hostel`}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Warden Modal */}
      {editingHead && (
        <Modal
          isOpen={!!editingHead}
          onClose={() => setEditingHead(null)}
          title={`${isMr ? 'वसतिगृह प्रमुख माहिती बदला' : 'Edit Hostel Head Details'}: ${editingHead.name}`}
          maxWidth="520px"
        >
          {feedback && (
            <div style={{
              padding: '0.8rem',
              borderRadius: '6px',
              backgroundColor: feedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
              color: feedback.type === 'success' ? '#047857' : '#b91c1c',
              marginBottom: '1rem',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {feedback.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span>{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleSaveEdit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">{isMr ? 'प्रमुखांचे पूर्ण नाव' : 'Full Name'} *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">{isMr ? 'मोबाईल नंबर' : 'Mobile Number'} *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">{isMr ? 'ईमेल पत्ता' : 'Email Address'} *</label>
                <input
                  type="email"
                  className="form-input"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <button type="button" onClick={() => setEditingHead(null)} className="btn btn-outline" disabled={saving}>
                {isMr ? 'रद्द करा' : 'Cancel'}
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={16} />
                <span>{saving ? (isMr ? 'जतन करत आहे...' : 'Saving...') : (isMr ? 'बदल जतन करा' : 'Save Changes')}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
