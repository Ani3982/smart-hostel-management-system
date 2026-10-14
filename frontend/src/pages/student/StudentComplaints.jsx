import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { complaintService, allocationService } from '../../services/api';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Plus, 
  MessageSquare, 
  ShieldAlert, 
  Wrench, 
  Zap, 
  Wifi, 
  Sparkles, 
  X,
  Send,
  Building2,
  Bed,
  Check,
  Info
} from 'lucide-react';

export const StudentComplaints = () => {
  const { user } = useAuth();
  const { t, lang, isMr } = useLanguage();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [allocation, setAllocation] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    category: 'Plumbing',
    urgency: 'MEDIUM',
    title: '',
    description: '',
    roomNumber: '',
    bedNumber: ''
  });

  const categories = [
    { value: 'Plumbing', label: isMr ? '💧 नळ / पाणी समस्या (Plumbing)' : '💧 Plumbing & Water' },
    { value: 'Electrical', label: isMr ? '⚡ विद्युत / लाईट / पंखा (Electrical)' : '⚡ Electrical & Appliances' },
    { value: 'Wi-Fi / Internet', label: isMr ? '📶 वाय-फाय / इंटरनेट (Wi-Fi)' : '📶 Wi-Fi & Internet' },
    { value: 'Cleanliness', label: isMr ? '🧹 स्वच्छता व साफसफाई (Cleanliness)' : '🧹 Cleanliness & Sanitation' },
    { value: 'Furniture', label: isMr ? '🪑 कपाट / खाट / टेबल (Furniture)' : '🪑 Furniture & Carpentry' },
    { value: 'Mess / Food', label: isMr ? '🍽️ मेस व भोजन (Mess / Food)' : '🍽️ Mess & Food' },
    { value: 'Other', label: isMr ? '❓ इतर समस्या (Other)' : '❓ Other Facility' }
  ];

  const fetchComplaintsAndAllocation = async () => {
    setLoading(true);
    try {
      // Fetch complaints
      const compRes = await complaintService.getAll();
      if (compRes.data && compRes.data.data) {
        setComplaints(compRes.data.data);
      }

      // Fetch active allocation to prefill room & bed
      const allocRes = await allocationService.getMyAllocation();
      if (allocRes.data && allocRes.data.data) {
        const alloc = allocRes.data.data;
        setAllocation(alloc);
        setFormData(prev => ({
          ...prev,
          roomNumber: alloc.room?.roomNumber || '',
          bedNumber: alloc.bed?.bedNumber || ''
        }));
      }
    } catch (err) {
      console.warn('Could not load complaints or allocation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintsAndAllocation();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      setErrorMsg(isMr ? 'कृपया तक्रारीचा तपशील प्रविष्ट करा' : 'Please provide complaint details');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        category: formData.category,
        urgency: formData.urgency,
        title: formData.title.trim() || `${formData.category} Issue`,
        description: formData.description.trim(),
        roomNumber: formData.roomNumber || (allocation?.room?.roomNumber || 'General'),
        bedNumber: formData.bedNumber || (allocation?.bed?.bedNumber || '—')
      };

      const res = await complaintService.create(payload);
      if (res.data && res.data.success) {
        setSuccessMsg(isMr ? 'आपली तक्रार वॉर्डन यांच्याकडे यशस्वीरित्या नोंदवली गेली आहे!' : 'Your complaint has been successfully lodged with the Warden!');
        setShowForm(false);
        setFormData(prev => ({
          ...prev,
          category: 'Plumbing',
          urgency: 'MEDIUM',
          title: '',
          description: ''
        }));
        await fetchComplaintsAndAllocation();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || (isMr ? 'तक्रार नोंदवण्यात त्रुटी आली' : 'Failed to lodge complaint'));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredComplaints = filter === 'ALL'
    ? complaints
    : complaints.filter(c => c.status === filter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0369a1 100%)',
        color: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: 'clamp(1.25rem, 3vw, 2rem)',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.25)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', flex: '1 1 auto' }}>
          <div style={{
            width: '58px',
            height: '58px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: '2px solid rgba(255,255,255,0.3)'
          }}>
            <AlertTriangle size={30} color="#facc15" />
          </div>
          <div style={{ minWidth: 'min(100%, 250px)' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: '0.2rem 0.65rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              marginBottom: '0.4rem'
            }}>
              <span>{isMr ? 'वसतिगृह विद्यार्थी तक्रार निवारण' : 'Hostel Grievance & Maintenance'}</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.65rem)', fontWeight: 800, margin: 0 }}>
              {isMr ? 'खोली व वसतिगृह तक्रारी (Grievances)' : 'Student Grievances & Complaints'}
            </h1>
            <p style={{ opacity: 0.9, fontSize: '0.875rem', margin: '0.35rem 0 0 0' }}>
              {isMr
                ? 'आपल्या खोलीतील दुरुस्ती, विद्युत, नळ अथवा वसतिगृह सुविधांबाबत थेट वॉर्डन यांच्याकडे तक्रार नोंदवा व स्थिती ट्रॅक करा.'
                : 'Lodge room maintenance, electrical, plumbing, or facility complaints directly to your Warden and track real-time resolution.'}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            setShowForm(!showForm);
            setErrorMsg('');
            setSuccessMsg('');
          }}
          className="btn"
          style={{
            backgroundColor: showForm ? '#ef4444' : '#f59e0b',
            color: showForm ? '#ffffff' : '#000000',
            fontWeight: 800,
            padding: '0.75rem 1.4rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          <span>{showForm ? (isMr ? 'फॉर्म बंद करा' : 'Close Form') : (isMr ? '+ नवीन तक्रार नोंदवा' : '+ Lodge New Complaint')}</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1.5px solid #10b981',
          color: '#065f46',
          padding: '1rem 1.25rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontWeight: 600,
          animation: 'fadeIn 0.3s ease'
        }}>
          <CheckCircle size={22} color="#10b981" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1.5px solid #ef4444',
          color: '#991b1b',
          padding: '1rem 1.25rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontWeight: 600
        }}>
          <ShieldAlert size={22} color="#ef4444" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Complaint Submission Form Card */}
      {showForm && (
        <div className="card" style={{
          padding: 'clamp(1.25rem, 3vw, 2rem)',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '2px solid #0284c7',
          animation: 'fadeIn 0.25s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wrench size={22} color="#0284c7" />
              <span>{isMr ? 'नवीन तक्रार नोंदणी फॉर्म' : 'Lodge New Grievance / Maintenance Request'}</span>
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {isMr ? 'वॉर्डन यांच्याकडे तात्काळ पाठवले जाईल' : 'Will be forwarded directly to Warden'}
            </span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Auto Room & Bed Info */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
              gap: '1rem',
              backgroundColor: '#f8fafc',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {isMr ? 'खोली क्रमांक (Room Number)' : 'Room Number'}
                </label>
                <input
                  type="text"
                  name="roomNumber"
                  className="form-input"
                  value={formData.roomNumber || (allocation?.room?.roomNumber ? `Room ${allocation.room.roomNumber}` : 'General / Common Area')}
                  onChange={handleInputChange}
                  placeholder="e.g. 102 or B-110"
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {isMr ? 'खाट क्रमांक (Bed Number)' : 'Bed Number'}
                </label>
                <input
                  type="text"
                  name="bedNumber"
                  className="form-input"
                  value={formData.bedNumber || (allocation?.bed?.bedNumber ? `Bed ${allocation.bed.bedNumber}` : '—')}
                  onChange={handleInputChange}
                  placeholder="e.g. Bed A or 01"
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {isMr ? 'गंभीरता / प्राधान्य (Urgency)' : 'Priority / Urgency Level'}
                </label>
                <select
                  name="urgency"
                  className="form-select"
                  value={formData.urgency}
                  onChange={handleInputChange}
                >
                  <option value="LOW">{isMr ? '🟢 कमी (Low Priority)' : '🟢 Low Priority'}</option>
                  <option value="MEDIUM">{isMr ? '🟡 मध्यम / सामान्य (Normal / Medium)' : '🟡 Normal / Medium'}</option>
                  <option value="HIGH">{isMr ? '🟠 उच्च / तातडीने (High Urgency)' : '🟠 High Urgency'}</option>
                  <option value="EMERGENCY">{isMr ? '🔴 अत्यंत तातडीने (Emergency)' : '🔴 Emergency'}</option>
                </select>
              </div>
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, color: '#0f172a' }}>
                {isMr ? 'तक्रारीचा प्रकार / वर्ग (Category) *' : 'Grievance Category *'}
              </label>
              <select
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleInputChange}
                required
                style={{ fontSize: '0.95rem', fontWeight: 600 }}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Short Title */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, color: '#0f172a' }}>
                {isMr ? 'विषय / सारांश (Subject / Title)' : 'Subject / Issue Title'}
              </label>
              <input
                type="text"
                name="title"
                className="form-input"
                placeholder={isMr ? 'उदा. पंख्याचा वेग कमी होत नाही / नळाची गळती' : 'e.g. Ceiling fan speed regulator broken / Bathroom tap leaking'}
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>

            {/* Detailed Description */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, color: '#0f172a' }}>
                {isMr ? 'तक्रारीचा सविस्तर तपशील (Detailed Description) *' : 'Detailed Complaint Description *'}
              </label>
              <textarea
                name="description"
                className="form-input"
                rows="4"
                placeholder={isMr ? 'कृपया समस्येचे संपूर्ण वर्णन करा जेणेकरून वॉर्डन दुरुस्तीची व्यवस्था करू शकतील...' : 'Please describe the problem clearly with any specific location or observation...'}
                value={formData.description}
                onChange={handleInputChange}
                required
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Form actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
                disabled={submitting}
              >
                {isMr ? 'रद्द करा' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
              >
                <Send size={18} />
                <span>{submitting ? (isMr ? 'नोंदवत आहे...' : 'Submitting...') : (isMr ? 'तक्रार सबमिट करा' : 'Submit Grievance')}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs and Count Summary */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '0.75rem'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: isMr ? 'सर्व तक्रारी' : 'All Grievances' },
            { id: 'PENDING', label: isMr ? 'प्रलंबित (Pending)' : 'Pending' },
            { id: 'IN_PROGRESS', label: isMr ? 'प्रगतीत (In Progress)' : 'In Progress' },
            { id: 'RESOLVED', label: isMr ? 'निवारण झाले (Resolved)' : 'Resolved' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              style={{
                border: 'none',
                backgroundColor: filter === tab.id ? '#0284c7' : '#f1f5f9',
                color: filter === tab.id ? '#ffffff' : '#475569',
                fontWeight: 700,
                fontSize: '0.825rem',
                padding: '0.45rem 0.9rem',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
          {isMr 
            ? `एकूण नोंदी: ${filteredComplaints.length}` 
            : `Showing ${filteredComplaints.length} complaint${filteredComplaints.length === 1 ? '' : 's'}`}
        </div>
      </div>

      {/* Complaints List Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <Clock size={36} color="#0284c7" style={{ margin: '0 auto 1rem auto', animation: 'spin 1.5s linear infinite' }} />
            <p>{isMr ? 'तक्रारींची यादी लोड होत आहे...' : 'Loading grievances...'}</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', backgroundColor: '#f8fafc', border: '1.5px dashed #cbd5e1' }}>
            <CheckCircle size={52} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
              {isMr ? 'या फिल्टरमध्ये कोणतीही तक्रार नाही' : 'No Grievances in this view'}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
              {isMr
                ? 'आपल्या खोलीत अथवा वसतिगृहात सर्व सुविधा व्यवस्थित आहेत. काही समस्या असल्यास वरील बटनावर क्लिक करून नवीन तक्रार नोंदवू शकता.'
                : 'No grievances reported. If you face any maintenance or facility issues, click the button above to lodge a complaint.'}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
              style={{ fontWeight: 700, margin: '0 auto' }}
            >
              <Plus size={18} />
              <span>{isMr ? 'पहिली तक्रार नोंदवा' : 'Lodge a Complaint'}</span>
            </button>
          </div>
        ) : (
          filteredComplaints.map(comp => {
            const isPending = comp.status === 'PENDING';
            const isInProgress = comp.status === 'IN_PROGRESS';
            const isResolved = comp.status === 'RESOLVED';

            return (
              <div 
                key={comp.id} 
                className="card" 
                style={{ 
                  padding: '1.5rem 1.75rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '1rem',
                  borderLeft: isResolved 
                    ? '4px solid #10b981' 
                    : isInProgress 
                    ? '4px solid #0284c7' 
                    : '4px solid #f59e0b',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                {/* Header row: category, room, date, status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                      <span style={{
                        backgroundColor: comp.category === 'Electrical' ? '#fef3c7' : comp.category === 'Plumbing' ? '#e0f2fe' : comp.category === 'Wi-Fi / Internet' ? '#f3e8ff' : '#f1f5f9',
                        color: comp.category === 'Electrical' ? '#b45309' : comp.category === 'Plumbing' ? '#0369a1' : comp.category === 'Wi-Fi / Internet' ? '#7e22ce' : '#334155',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.65rem',
                        borderRadius: '6px'
                      }}>
                        {comp.category}
                      </span>

                      <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>
                        Room {comp.roomNumber} {comp.bedNumber && comp.bedNumber !== '—' ? `(Bed ${comp.bedNumber})` : ''}
                      </strong>

                      <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>• {comp.date || (comp.createdAt ? new Date(comp.createdAt).toLocaleDateString() : '')}</span>
                    </div>

                    <h4 style={{ fontSize: '0.975rem', fontWeight: 700, color: '#1e293b', margin: '0.25rem 0' }}>
                      {comp.title || `${comp.category} Issue`}
                    </h4>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isPending && (
                      <span style={{
                        backgroundColor: '#fef3c7',
                        color: '#b45309',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '0.35rem 0.75rem',
                        borderRadius: '999px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        border: '1px solid #fde68a'
                      }}>
                        <Clock size={14} />
                        <span>{isMr ? 'प्रलंबित (PENDING)' : 'PENDING REVIEW'}</span>
                      </span>
                    )}

                    {isInProgress && (
                      <span style={{
                        backgroundColor: '#e0f2fe',
                        color: '#0369a1',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '0.35rem 0.75rem',
                        borderRadius: '999px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        border: '1px solid #bae6fd'
                      }}>
                        <Wrench size={14} />
                        <span>{isMr ? 'कामात आहे (IN PROGRESS)' : 'IN PROGRESS'}</span>
                      </span>
                    )}

                    {isResolved && (
                      <span style={{
                        backgroundColor: '#ecfdf5',
                        color: '#047857',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '0.35rem 0.75rem',
                        borderRadius: '999px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        border: '1px solid #a7f3d0'
                      }}>
                        <CheckCircle size={14} />
                        <span>{isMr ? 'निवारण झाले (RESOLVED)' : 'RESOLVED'}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div style={{
                  backgroundColor: '#f8fafc',
                  padding: '0.9rem 1.15rem',
                  borderRadius: '6px',
                  color: '#334155',
                  fontSize: '0.9rem',
                  lineHeight: '1.5'
                }}>
                  "{comp.description}"
                </div>

                {/* Warden Remark (if present) */}
                {comp.remarks && (
                  <div style={{
                    backgroundColor: isResolved ? '#f0fdf4' : '#f0f9ff',
                    border: isResolved ? '1px solid #bbf7d0' : '1px solid #bfdbfe',
                    borderRadius: '6px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    fontSize: '0.85rem'
                  }}>
                    <MessageSquare size={16} color={isResolved ? '#16a34a' : '#0284c7'} />
                    <span style={{ color: '#475569' }}>
                      <strong style={{ color: isResolved ? '#166534' : '#0369a1' }}>
                        {isMr ? 'वॉर्डन टिप्पणी (Warden Remark):' : 'Warden Remark:'}
                      </strong>{' '}
                      {comp.remarks}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default StudentComplaints;
