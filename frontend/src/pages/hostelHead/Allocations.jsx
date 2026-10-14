import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { wardenPortalService, applicationService } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  UserCheck, 
  DoorClosed, 
  Bed, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  Building2, 
  User, 
  PlusCircle, 
  CreditCard,
  ArrowRight
} from 'lucide-react';

export const Allocations = () => {
  const { user } = useAuth();
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState(null);

  // New Allocation Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [approvedStudents, setApprovedStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [loadingBeds, setLoadingBeds] = useState(false);

  // Form selections
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedBedId, setSelectedBedId] = useState('');
  const [allocating, setAllocating] = useState(false);

  useEffect(() => {
    loadAllocations();
  }, []);

  const loadAllocations = async () => {
    try {
      setLoading(true);
      // Calls /api/warden/allocations - isolated by authenticated Warden's hostel
      const res = await wardenPortalService.getAllocations();
      if (res.data.success) {
        setAllocations(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load allocations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAllocationModal = async () => {
    setFeedback(null);
    setSelectedStudentId('');
    setSelectedRoomId('');
    setSelectedBedId('');
    setBeds([]);

    try {
      // 1. Fetch approved applications for this warden's hostel
      const appRes = await wardenPortalService.getApplications({ status: 'APPROVED' });
      const approvedApps = appRes.data.success ? appRes.data.data : [];

      // Filter out students who already have an active allocation
      const allocatedStudentIds = new Set(allocations.filter(a => a.status === 'ACTIVE').map(a => a.student_id));
      const unallocatedApproved = approvedApps.filter(app => !allocatedStudentIds.has(app.student.id));
      setApprovedStudents(unallocatedApproved);

      // 2. Fetch rooms in this hostel
      const roomRes = await wardenPortalService.getRooms();
      if (roomRes.data.success) {
        setRooms(roomRes.data.data.filter(r => r.status !== 'FULL'));
      }

      setModalOpen(true);
    } catch (err) {
      console.error('Failed to initialize allocation modal:', err);
      alert('Failed to load student or room data for allocation.');
    }
  };

  const handleRoomSelect = async (roomId) => {
    setSelectedRoomId(roomId);
    setSelectedBedId('');
    if (!roomId) {
      setBeds([]);
      return;
    }

    try {
      setLoadingBeds(true);
      // Fetch only beds for this room
      const res = await wardenPortalService.getBeds({ roomId });
      if (res.data.success) {
        setBeds(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch room beds:', err);
      setBeds([]);
    } finally {
      setLoadingBeds(false);
    }
  };

  const handleConfirmAllocation = async (e) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedRoomId || !selectedBedId) {
      setFeedback({ type: 'danger', message: 'Please select an Approved Student, Room, and AVAILABLE Bed.' });
      return;
    }

    try {
      setAllocating(true);
      setFeedback(null);

      const payload = {
        studentId: Number(selectedStudentId),
        roomId: Number(selectedRoomId),
        bedId: Number(selectedBedId)
      };

      const res = await wardenPortalService.createAllocation(payload);
      if (res.data.success) {
        setFeedback({
          type: 'success',
          message: `Allocation Confirmed! Bed is now OCCUPIED. Student has been notified and hostel payment is now unlocked.`
        });
        loadAllocations();
        setTimeout(() => {
          setModalOpen(false);
        }, 1500);
      }
    } catch (err) {
      console.error('Allocation error:', err);
      setFeedback({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to allocate room and bed.'
      });
    } finally {
      setAllocating(false);
    }
  };

  const isGirlsHostel = user?.hostelId === 2;
  const hostelTitle = isGirlsHostel ? 'Girls Hostel' : 'Boys Hostel';

  const filteredAllocations = allocations.filter(al => {
    const q = search.toLowerCase();
    const stName = (al.student_name || '').toLowerCase();
    const stPrn = (al.student_prn || '').toLowerCase();
    const rNum = (al.room_number || '').toLowerCase();
    const bNum = (al.bed_number || '').toLowerCase();
    return stName.includes(q) || stPrn.includes(q) || rNum.includes(q) || bNum.includes(q);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Banner */}
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
        gap: '1.25rem'
      }}>
        <div style={{ minWidth: 'min(100%, 280px)', flex: '1 1 auto' }}>
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
            <span>{hostelTitle} Allocation Desk</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.65rem)', fontWeight: 800 }}>Room & Bed Allocation</h1>
          <p style={{ opacity: 0.85, fontSize: '0.875rem', marginTop: '0.15rem' }}>
            Allocate approved students to vacant beds with real-time occupancy enforcement.
          </p>
        </div>

        <button 
          onClick={handleOpenAllocationModal}
          className="btn btn-primary"
          style={{ backgroundColor: isGirlsHostel ? '#db2777' : '#2563eb', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
        >
          <PlusCircle size={18} />
          <span>New Student Allocation</span>
        </button>
      </div>

      {/* Global Feedback Banner */}
      {feedback && !modalOpen && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          backgroundColor: feedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${feedback.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          color: feedback.type === 'success' ? '#065f46' : '#991b1b'
        }}>
          {feedback.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="card" style={{ padding: '1rem' }}>
        <div className="toolbar-responsive">
          <div className="toolbar-search">
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px', fontSize: '0.875rem', width: '100%' }}
              placeholder="Search by student PRN, name, or room..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap' }}>
            Showing <strong>{filteredAllocations.length}</strong> active allocations
          </div>
        </div>
      </div>

      {/* Allocations Table */}
      {loading ? (
        <LoadingSpinner message="Loading allocations..." />
      ) : filteredAllocations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <UserCheck size={48} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No Allocations Found</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {search ? 'Try modifying your search filter.' : 'Approved students who are assigned rooms and beds will appear here.'}
          </p>
          <button onClick={handleOpenAllocationModal} className="btn btn-primary" style={{ marginTop: '1.25rem', display: 'inline-flex' }}>
            Allocate Student Now
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-scroll-hint">← Scroll horizontally to view all allocation details →</div>
          <div className="table-container" style={{ margin: 0 }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Allocation ID</th>
                  <th>Student Name</th>
                  <th>Student PRN</th>
                  <th>Course</th>
                  <th>Allocated Room</th>
                  <th>Allocated Bed</th>
                  <th>Allocation Date</th>
                  <th>Status</th>
                  <th>Fee Payment</th>
                </tr>
              </thead>
              <tbody>
                {filteredAllocations.map((al) => (
                  <tr key={al.id}>
                    <td>
                      <span style={{ fontWeight: 800, color: '#1e3a8a' }}>
                        ALC-{String(al.id).padStart(4, '0')}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{al.student_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{al.mobile}</div>
                    </td>
                    <td>
                      <span style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        backgroundColor: '#f1f5f9',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px'
                      }}>
                        {al.student_prn}
                      </span>
                    </td>
                    <td style={{ color: '#334155', fontWeight: 600 }}>{al.course}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <DoorClosed size={15} color="#2563eb" />
                        <span style={{ fontWeight: 800, color: '#0f172a' }}>{al.room_number}</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>(Fl. {al.floor})</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Bed size={15} color="#059669" />
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>Bed {al.bed_number}</span>
                      </div>
                    </td>
                    <td style={{ color: '#334155' }}>
                      {al.allocation_date ? new Date(al.allocation_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      <StatusBadge status={al.status || 'ACTIVE'} />
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
                        backgroundColor: al.payment_status === 'SUCCESS' ? '#ecfdf5' : '#fffbeb',
                        color: al.payment_status === 'SUCCESS' ? '#047857' : '#b45309'
                      }}>
                        <CreditCard size={11} />
                        {al.payment_status === 'SUCCESS' ? 'PAID' : 'PENDING'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ALLOCATION WORKFLOW MODAL */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={`Allocate Room & Bed (${hostelTitle})`}
        >
          <form onSubmit={handleConfirmAllocation} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Modal Feedback Alert */}
            {feedback && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                backgroundColor: feedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
                border: `1px solid ${feedback.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
                color: feedback.type === 'success' ? '#065f46' : '#991b1b',
                fontSize: '0.85rem'
              }}>
                {feedback.message}
              </div>
            )}

            {/* Workflow steps visualization */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
              backgroundColor: '#f8fafc',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.785rem',
              fontWeight: 700,
              color: '#475569'
            }}>
              <span style={{ color: selectedStudentId ? '#059669' : '#1e3a8a' }}>1. Approved Student</span>
              <ArrowRight size={14} />
              <span style={{ color: selectedRoomId ? '#059669' : selectedStudentId ? '#1e3a8a' : '#94a3b8' }}>2. Select Room</span>
              <ArrowRight size={14} />
              <span style={{ color: selectedBedId ? '#059669' : selectedRoomId ? '#1e3a8a' : '#94a3b8' }}>3. AVAILABLE Bed</span>
            </div>

            {/* Step 1: Select Approved Student */}
            <div>
              <label className="form-label" style={{ fontWeight: 700 }}>
                1. Select Approved Student <span style={{ color: '#dc2626' }}>*</span>
              </label>
              {approvedStudents.length === 0 ? (
                <div style={{ padding: '0.75rem', backgroundColor: '#fffbeb', borderRadius: '6px', fontSize: '0.85rem', color: '#92400e' }}>
                  ⚠️ No unallocated approved students found. Please verify and approve pending applications in <strong>Applications</strong> first.
                </div>
              ) : (
                <select
                  required
                  className="form-select"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                >
                  <option value="">-- Choose Approved Student --</option>
                  {approvedStudents.map((app) => (
                    <option key={app.student.id} value={app.student.id}>
                      {app.student.fullName} (PRN: {app.student.studentId} • {app.student.course})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Step 2: Select Room */}
            <div>
              <label className="form-label" style={{ fontWeight: 700 }}>
                2. Select Room in {hostelTitle} <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                required
                className="form-select"
                value={selectedRoomId}
                disabled={!selectedStudentId}
                onChange={(e) => handleRoomSelect(e.target.value)}
              >
                <option value="">-- Choose Room --</option>
                {rooms.map((r) => {
                  const rNum = r.room_number || r.roomNumber;
                  const avail = r.available_beds !== undefined ? r.available_beds : 0;
                  return (
                    <option key={r.id} value={r.id}>
                      Room {rNum} (Floor {r.floor} • Capacity: {r.capacity} Beds • {avail} Available)
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Step 3: Show and Select AVAILABLE Beds */}
            <div>
              <label className="form-label" style={{ fontWeight: 700 }}>
                3. Choose Bed (Only AVAILABLE Beds Permitted) <span style={{ color: '#dc2626' }}>*</span>
              </label>
              {loadingBeds ? (
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Loading available beds...</div>
              ) : selectedRoomId && beds.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: '#dc2626' }}>No beds found for this room.</div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: '0.75rem',
                  marginTop: '0.5rem'
                }}>
                  {beds.map((b) => {
                    const isAvailable = b.status === 'AVAILABLE';
                    const isSelected = String(selectedBedId) === String(b.id);

                    return (
                      <button
                        type="button"
                        key={b.id}
                        disabled={!isAvailable}
                        onClick={() => setSelectedBedId(b.id)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          padding: '0.75rem 0.5rem',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                          backgroundColor: isSelected ? '#eff6ff' : isAvailable ? 'white' : '#f1f5f9',
                          cursor: isAvailable ? 'pointer' : 'not-allowed',
                          opacity: isAvailable ? 1 : 0.6
                        }}
                      >
                        <Bed size={22} color={isSelected ? '#2563eb' : isAvailable ? '#059669' : '#94a3b8'} />
                        <span style={{ fontWeight: 800, fontSize: '0.85rem', marginTop: '0.25rem', color: '#0f172a' }}>
                          Bed {b.bed_number}
                        </span>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          marginTop: '0.2rem',
                          color: isAvailable ? '#059669' : '#dc2626'
                        }}>
                          {b.status}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Workflow notes */}
            <div style={{
              padding: '0.75rem',
              backgroundColor: '#f0fdf4',
              borderRadius: '6px',
              fontSize: '0.8rem',
              color: '#166534',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle size={16} color="#16a34a" />
              <span>
                On confirmation: Bed becomes <strong>OCCUPIED</strong>, student receives instant portal notification, and hostel fee payment is enabled.
              </span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={allocating || !selectedStudentId || !selectedRoomId || !selectedBedId}
                style={{ backgroundColor: '#059669', border: 'none' }}
              >
                {allocating ? 'Allocating Bed...' : 'Confirm Allocation'}
              </button>
            </div>

          </form>
        </Modal>
      )}

    </div>
  );
};
