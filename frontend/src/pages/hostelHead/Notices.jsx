import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, Plus, Calendar, Pin, AlertCircle, CheckCircle } from 'lucide-react';

export const Notices = () => {
  const { user } = useAuth();
  const isGirlsHostel = user?.hostelType === 'GIRLS' || user?.role === 'GIRLS_WARDEN';
  const hostelTitle = isGirlsHostel ? 'Girls Hostel' : 'Boys Hostel';

  const [notices, setNotices] = useState([
    {
      id: 1,
      title: 'Hostel Night Curfew & Roll-Call Timing Reminder',
      category: 'Discipline',
      date: '2026-09-29',
      priority: 'HIGH',
      content: `All residents of ${hostelTitle} are strictly required to report inside hostel premises before 9:30 PM. The night biometric and manual roll-call will begin promptly at 9:45 PM.`
    },
    {
      id: 2,
      title: 'Term 1 Hostel Maintenance & Fee Settlement Deadline',
      category: 'Fees',
      date: '2026-09-25',
      priority: 'MEDIUM',
      content: 'Students with pending semester hostel dues must complete payment via the online portal by October 10th to avoid late verification charges.'
    },
    {
      id: 3,
      title: 'Weekly Mess Committee Meeting & Special Sunday Menu',
      category: 'Mess',
      date: '2026-09-20',
      priority: 'NORMAL',
      content: 'The resident student mess representatives will meet the warden this Friday at 5:00 PM to review nutritional standards and approve the festive menu.'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [newPriority, setNewPriority] = useState('NORMAL');
  const [newContent, setNewContent] = useState('');
  const [postSuccess, setPostSuccess] = useState(false);

  const handlePostNotice = (e) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    const noticeObj = {
      id: Date.now(),
      title: newTitle,
      category: newCategory,
      date: new Date().toISOString().split('T')[0],
      priority: newPriority,
      content: newContent
    };

    setNotices([noticeObj, ...notices]);
    setNewTitle('');
    setNewContent('');
    setShowAddForm(false);
    setPostSuccess(true);
    setTimeout(() => setPostSuccess(false), 3000);
  };

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
            <Bell size={28} />
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
              <span>{hostelTitle} Notice Board</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.65rem)', fontWeight: 800, margin: 0 }}>Official Notices & Circulars</h1>
            <p style={{ opacity: 0.85, fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
              Publish announcements, curfew timings, and administrative notices to resident students.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-secondary"
          style={{
            backgroundColor: 'white',
            color: isGirlsHostel ? '#be185d' : '#1e3a8a',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap'
          }}
        >
          <Plus size={18} />
          <span>{showAddForm ? 'Cancel' : 'Post New Notice'}</span>
        </button>
      </div>

      {postSuccess && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '1rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <CheckCircle size={20} color="#059669" />
          <span>Notice has been broadcasted to {hostelTitle} students!</span>
        </div>
      )}

      {/* Add Notice Form */}
      {showAddForm && (
        <div className="card" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
            Broadcast New Notice to {hostelTitle}
          </h3>
          <form onSubmit={handlePostNotice} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="label" style={{ fontWeight: 600 }}>Notice Subject / Title</label>
              <input
                type="text"
                className="input"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Night Gate Closure and Attendance Verification"
                required
              />
            </div>

            <div className="responsive-grid-2" style={{ gap: '1rem' }}>
              <div>
                <label className="label" style={{ fontWeight: 600 }}>Category</label>
                <select className="input" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                  <option value="General">General Notice</option>
                  <option value="Discipline">Discipline & Curfew</option>
                  <option value="Fees">Fees & Payment</option>
                  <option value="Mess">Mess & Canteen</option>
                  <option value="Maintenance">Maintenance & Power</option>
                </select>
              </div>

              <div>
                <label className="label" style={{ fontWeight: 600 }}>Priority Level</label>
                <select className="input" value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
                  <option value="NORMAL">Normal Priority</option>
                  <option value="MEDIUM">Important</option>
                  <option value="HIGH">Urgent / Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label" style={{ fontWeight: 600 }}>Notice Content & Instructions</label>
              <textarea
                className="input"
                rows={4}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Enter detailed notice description for students..."
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                backgroundColor: isGirlsHostel ? '#be185d' : '#1e3a8a',
                color: 'white',
                fontWeight: 700,
                alignSelf: 'flex-start',
                padding: '0.65rem 1.5rem'
              }}
            >
              Publish Notice
            </button>
          </form>
        </div>
      )}

      {/* Notice Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {notices.map(notice => (
          <div key={notice.id} className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  backgroundColor: notice.priority === 'HIGH' ? '#fee2e2' : notice.priority === 'MEDIUM' ? '#fef3c7' : '#f1f5f9',
                  color: notice.priority === 'HIGH' ? '#b91c1c' : notice.priority === 'MEDIUM' ? '#b45309' : '#475569',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px'
                }}>
                  {notice.category} • {notice.priority}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Posted on {notice.date}
                </span>
              </div>
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0' }}>
              {notice.title}
            </h3>

            <p style={{ color: '#334155', fontSize: '0.925rem', lineHeight: 1.6, margin: 0 }}>
              {notice.content}
            </p>

            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
              Issued by: <strong>Warden, {hostelTitle}</strong> (New Arts, Commerce & Science College, Ahilyanagar)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
