import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { complaintService } from '../../services/api';
import { AlertTriangle, CheckCircle, Clock, Filter, Plus, MessageSquare, ShieldAlert, RefreshCw } from 'lucide-react';

export const Complaints = () => {
  const { user } = useAuth();
  const isGirlsHostel = user?.hostelType === 'GIRLS' || user?.role === 'GIRLS_WARDEN';
  const hostelTitle = isGirlsHostel ? 'Girls Hostel' : 'Boys Hostel';

  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [complaints, setComplaints] = useState([
    {
      id: 1,
      studentName: isGirlsHostel ? 'Snehal Kulkarni' : 'Rahul Patil',
      prn: isGirlsHostel ? 'PRN2024098' : 'PRN2024001',
      roomNumber: '102',
      bedNumber: 'A',
      category: 'Plumbing',
      description: 'Bathroom shower tap is continuously leaking and low water pressure.',
      date: '2026-09-28',
      status: 'PENDING',
      remarks: 'Maintenance plumber informed'
    },
    {
      id: 2,
      studentName: isGirlsHostel ? 'Pooja Jadhav' : 'Aditya Shinde',
      prn: isGirlsHostel ? 'PRN2024105' : 'PRN2024015',
      roomNumber: '205',
      bedNumber: 'B',
      category: 'Electrical',
      description: 'Ceiling fan regulator stuck at maximum speed.',
      date: '2026-09-27',
      status: 'IN_PROGRESS',
      remarks: 'Electrician scheduled for replacement'
    },
    {
      id: 3,
      studentName: isGirlsHostel ? 'Neha Gaikwad' : 'Omkar Deshmukh',
      prn: isGirlsHostel ? 'PRN2024112' : 'PRN2024022',
      roomNumber: '108',
      bedNumber: 'C',
      category: 'Wi-Fi / Internet',
      description: 'Floor 1 access point connectivity drops frequently in evening hours.',
      date: '2026-09-25',
      status: 'RESOLVED',
      remarks: 'Router restarted and antenna adjusted'
    }
  ]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await complaintService.getAll();
      if (res.data && res.data.data && res.data.data.length > 0) {
        setComplaints(res.data.data);
      }
    } catch (err) {
      console.warn('Could not fetch complaints from API, using default list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [user]);

  const updateStatus = async (id, newStatus) => {
    const remarkPrompt = newStatus === 'RESOLVED' 
      ? prompt('Enter resolution remarks / निराकरण टिप्पणी:', 'Issue inspected and resolved successfully')
      : newStatus === 'IN_PROGRESS'
      ? prompt('Enter warden remark / वॉर्डन टिप्पणी:', 'Maintenance work in progress')
      : '';

    // Optimistic UI update
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus, remarks: remarkPrompt || c.remarks } : c));

    try {
      await complaintService.updateStatus(id, newStatus, remarkPrompt || undefined);
    } catch (e) {
      console.warn('Could not update complaint on server:', e);
    }
  };

  const filteredComplaints = filter === 'ALL' 
    ? complaints 
    : complaints.filter(c => c.status === filter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header Banner */}
      <div style={{
        background: isGirlsHostel
          ? 'linear-gradient(135deg, #0f172a 0%, #be185d 100%)'
          : 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
        color: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: 'clamp(1.25rem, 3vw, 2rem)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', flex: '1 1 auto' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <AlertTriangle size={28} />
          </div>
          <div style={{ minWidth: 'min(100%, 250px)' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              marginBottom: '0.35rem'
            }}>
              <span>{hostelTitle} Management</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.65rem)', fontWeight: 800, margin: 0 }}>Student Grievances & Complaints</h1>
            <p style={{ opacity: 0.85, fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
              Track, inspect, and resolve student room maintenance and facility complaints.
            </p>
          </div>
        </div>

        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: 'rgba(255,255,255,0.15)', padding: '0.35rem', borderRadius: '8px', flexWrap: 'wrap' }}>
          {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED'].map(st => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              style={{
                border: 'none',
                backgroundColor: filter === st ? 'white' : 'transparent',
                color: filter === st ? (isGirlsHostel ? '#be185d' : '#1e3a8a') : 'white',
                fontWeight: 700,
                fontSize: '0.8rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredComplaints.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>No Complaints in this view</h3>
            <p style={{ fontSize: '0.875rem' }}>All student grievances in {hostelTitle} are currently resolved.</p>
          </div>
        ) : (
          filteredComplaints.map(comp => (
            <div key={comp.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{
                      backgroundColor: comp.category === 'Electrical' ? '#fef3c7' : comp.category === 'Plumbing' ? '#e0f2fe' : '#f3e8ff',
                      color: comp.category === 'Electrical' ? '#b45309' : comp.category === 'Plumbing' ? '#0369a1' : '#7e22ce',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px'
                    }}>
                      {comp.category}
                    </span>
                    <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>
                      Room {comp.roomNumber} (Bed {comp.bedNumber})
                    </strong>
                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>• {comp.date}</span>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#475569', marginTop: '0.35rem' }}>
                    Reported by: <strong>{comp.studentName}</strong> ({comp.prn})
                  </div>
                </div>

                <span style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  backgroundColor: comp.status === 'RESOLVED' ? '#ecfdf5' : comp.status === 'IN_PROGRESS' ? '#fef3c7' : '#fee2e2',
                  color: comp.status === 'RESOLVED' ? '#047857' : comp.status === 'IN_PROGRESS' ? '#b45309' : '#b91c1c'
                }}>
                  {comp.status.replace('_', ' ')}
                </span>
              </div>

              <p style={{ color: '#1e293b', fontSize: '0.925rem', margin: 0, backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '6px' }}>
                "{comp.description}"
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Warden Remark: <em>{comp.remarks}</em>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {comp.status !== 'IN_PROGRESS' && (
                    <button
                      onClick={() => updateStatus(comp.id, 'IN_PROGRESS')}
                      className="btn btn-outline"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.775rem' }}
                    >
                      Mark In Progress
                    </button>
                  )}
                  {comp.status !== 'RESOLVED' && (
                    <button
                      onClick={() => updateStatus(comp.id, 'RESOLVED')}
                      className="btn btn-primary"
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.775rem',
                        backgroundColor: '#10b981',
                        border: 'none',
                        color: 'white'
                      }}
                    >
                      Resolve Issue
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
