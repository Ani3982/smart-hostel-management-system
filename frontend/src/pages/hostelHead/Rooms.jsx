import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { wardenPortalService, roomService } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import { DoorClosed, Plus, Edit, Trash2, Search, Building2, Bed, CheckCircle } from 'lucide-react';

export const Rooms = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Add/Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    roomNumber: '',
    floor: 1,
    capacity: 4,
    roomType: 'Standard Shared (4 Beds)',
    status: 'AVAILABLE'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      // Calls /api/warden/rooms - strictly isolated to the authenticated Warden's hostel
      const res = await wardenPortalService.getRooms();
      if (res.data.success) {
        setRooms(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setFormData({
      roomNumber: '',
      floor: 1,
      capacity: 4,
      roomType: 'Standard Shared (4 Beds)',
      status: 'AVAILABLE'
    });
    setError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.room_number || room.roomNumber,
      floor: room.floor,
      capacity: room.capacity,
      roomType: room.room_type || room.roomType || 'Standard Shared (4 Beds)',
      status: room.status
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editingRoom) {
        await roomService.update(editingRoom.id, { ...formData, hostelId: user?.hostelId || 1 });
      } else {
        await roomService.create({ ...formData, hostelId: user?.hostelId || 1 });
      }
      setModalOpen(false);
      loadRooms();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room and all its beds?")) return;
    try {
      await roomService.delete(id);
      loadRooms();
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  const isGirlsHostel = user?.hostelId === 2;
  const hostelTitle = isGirlsHostel ? 'Girls Hostel' : 'Boys Hostel';

  const filteredRooms = rooms.filter(room => {
    const rNum = (room.room_number || room.roomNumber || '').toLowerCase();
    const rType = (room.room_type || room.roomType || '').toLowerCase();
    const matchesSearch = rNum.includes(search.toLowerCase()) || rType.includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || room.status === statusFilter;
    return matchesSearch && matchesStatus;
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
            <span>{hostelTitle} Room Inventory</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.65rem)', fontWeight: 800 }}>Room Management</h1>
          <p style={{ opacity: 0.85, fontSize: '0.875rem', marginTop: '0.15rem' }}>
            Manage room allocations, bed capacities, and maintenance statuses for {hostelTitle}.
          </p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="btn btn-primary"
          style={{ backgroundColor: isGirlsHostel ? '#db2777' : '#2563eb', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
        >
          <Plus size={18} />
          <span>Add New Room</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="card" style={{ padding: '1rem' }}>
        <div className="toolbar-responsive">
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', flex: '1 1 auto' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Filter Status:</span>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto', minWidth: '150px', flex: '1 1 auto', fontSize: '0.85rem' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="PARTIALLY_OCCUPIED">PARTIALLY_OCCUPIED</option>
              <option value="FULL">FULL</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
            </select>
          </div>

          <div className="toolbar-search">
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px', fontSize: '0.875rem', width: '100%' }}
              placeholder="Search room number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

        </div>
      </div>

      {/* Rooms Table */}
      {loading ? (
        <LoadingSpinner message="Loading rooms..." />
      ) : filteredRooms.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <DoorClosed size={48} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No Rooms Found</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {search ? 'Try modifying your search criteria.' : 'Create rooms for this hostel to begin allocating students.'}
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-scroll-hint">← Scroll horizontally to view all room details →</div>
          <div className="table-container" style={{ margin: 0 }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Room ID</th>
                  <th>Hostel ID</th>
                  <th>Room Number</th>
                  <th>Floor</th>
                  <th>Capacity</th>
                  <th>Occupied Beds</th>
                  <th>Available Beds</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map((r) => {
                  const rId = r.id;
                  const hId = r.hostel_id || user?.hostelId || 1;
                  const rNum = r.room_number || r.roomNumber;
                  const capacity = r.capacity || 4;
                  const occBeds = r.occupied_beds !== undefined ? Number(r.occupied_beds) : 0;
                  const availBeds = r.available_beds !== undefined ? Number(r.available_beds) : Math.max(0, capacity - occBeds);

                  return (
                    <tr key={rId}>
                      <td>
                        <span style={{ fontWeight: 800, color: '#1e3a8a' }}>
                          R-{String(rId).padStart(3, '0')}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          backgroundColor: '#f1f5f9',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px'
                        }}>
                          {hId}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <DoorClosed size={16} color="#2563eb" />
                          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                            {rNum}
                          </span>
                        </div>
                      </td>
                      <td style={{ color: '#334155', fontWeight: 600 }}>Floor {r.floor}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{capacity} Beds</span>
                      </td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          color: occBeds > 0 ? '#b45309' : '#64748b',
                          backgroundColor: occBeds > 0 ? '#fef3c7' : '#f1f5f9',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px'
                        }}>
                          {occBeds} Occupied
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          color: availBeds > 0 ? '#047857' : '#991b1b',
                          backgroundColor: availBeds > 0 ? '#ecfdf5' : '#fef2f2',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px'
                        }}>
                          {availBeds} Available
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                          <button 
                            className="btn btn-outline btn-sm"
                            title="Edit Room"
                            onClick={() => handleOpenEdit(r)}
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            className="btn btn-outline btn-sm"
                            title="Delete Room"
                            style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                            onClick={() => handleDelete(rId)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT ROOM MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRoom ? "Edit Room Details" : "Create New Room"}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && (
            <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '6px', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <div>
            <label className="form-label">Room Number *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder={isGirlsHostel ? "e.g. G-101, G-102" : "e.g. B-101, B-102"}
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
            />
          </div>

          <div className="responsive-grid-2" style={{ gap: '1rem' }}>
            <div>
              <label className="form-label">Floor *</label>
              <select
                className="form-select"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
              >
                <option value={1}>Floor 1</option>
                <option value={2}>Floor 2</option>
                <option value={3}>Floor 3</option>
              </select>
            </div>
            <div>
              <label className="form-label">Bed Capacity *</label>
              <input
                type="number"
                min="1"
                max="8"
                required
                className="form-input"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Room Type</label>
            <input
              type="text"
              className="form-input"
              value={formData.roomType}
              onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label">Status *</label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="PARTIALLY_OCCUPIED">PARTIALLY_OCCUPIED</option>
              <option value="FULL">FULL</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editingRoom ? 'Save Changes' : 'Create Room'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
