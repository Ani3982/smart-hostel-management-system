import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { HelpCircle, Phone, Mail, Calendar, CheckCircle, Search, Filter } from 'lucide-react';

export const Enquiries = () => {
  const { user } = useAuth();
  const isGirlsHostel = user?.hostelType === 'GIRLS' || user?.role === 'GIRLS_WARDEN';
  const hostelTitle = isGirlsHostel ? 'Girls Hostel' : 'Boys Hostel';

  const [search, setSearch] = useState('');
  const [enquiries, setEnquiries] = useState([
    {
      id: 1,
      name: isGirlsHostel ? 'Kavita More' : 'Ramesh Jagtap',
      relation: 'Parent',
      studentName: isGirlsHostel ? 'Tanvi More' : 'Kunal Jagtap',
      course: 'First Year B.Sc Computer Science',
      phone: '9822334455',
      email: 'parent.enquiry@gmail.com',
      date: '2026-09-28',
      query: `Enquiring about admission vacancy in ${hostelTitle}, annual mess fees, and security arrangements.`,
      status: 'NEW'
    },
    {
      id: 2,
      name: isGirlsHostel ? 'Vaishnavi Shinde' : 'Prashant Kale',
      relation: 'Student',
      studentName: isGirlsHostel ? 'Vaishnavi Shinde' : 'Prashant Kale',
      course: 'M.Com Term 1',
      phone: '9877112233',
      email: 'student.kale@gmail.com',
      date: '2026-09-26',
      query: 'Wanted to know when the second merit list for postgraduate hostel seats will be released.',
      status: 'RESPONDED'
    }
  ]);

  const toggleResponded = (id) => {
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: e.status === 'NEW' ? 'RESPONDED' : 'NEW' } : e));
  };

  const filtered = enquiries.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.studentName.toLowerCase().includes(search.toLowerCase()) ||
    e.phone.includes(search)
  );

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
            <HelpCircle size={28} />
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
              <span>{hostelTitle} Helpdesk</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.65rem)', fontWeight: 800, margin: 0 }}>Admission & Visitor Enquiries</h1>
            <p style={{ opacity: 0.85, fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
              Inquiries submitted by parents and prospective students regarding {hostelTitle}.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', borderRadius: '8px', padding: '0.4rem 0.8rem', width: 'auto', minWidth: '220px', flex: '0 1 280px' }}>
          <Search size={18} color="#64748b" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: '0.875rem', color: '#0f172a', width: '100%' }}
          />
        </div>
      </div>

      {/* Enquiries List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filtered.map(item => (
          <div key={item.id} className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{item.name}</strong>
                  <span style={{ fontSize: '0.775rem', backgroundColor: '#f1f5f9', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                    {item.relation}
                  </span>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>• {item.date}</span>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#475569', marginTop: '0.25rem' }}>
                  Prospective Candidate: <strong>{item.studentName}</strong> • {item.course}
                </div>
              </div>

              <span style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 800,
                backgroundColor: item.status === 'RESPONDED' ? '#ecfdf5' : '#fef3c7',
                color: item.status === 'RESPONDED' ? '#047857' : '#b45309'
              }}>
                {item.status}
              </span>
            </div>

            <p style={{ color: '#1e293b', fontSize: '0.925rem', backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '6px', margin: 0 }}>
              "{item.query}"
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem', color: '#64748b' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Phone size={14} />
                  <strong>{item.phone}</strong>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Mail size={14} />
                  <span>{item.email}</span>
                </span>
              </div>

              <button
                onClick={() => toggleResponded(item.id)}
                className="btn btn-outline"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              >
                {item.status === 'NEW' ? 'Mark Responded' : 'Mark as New'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
