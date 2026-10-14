import React, { useState, useEffect } from 'react';
import { roomService, hostelService } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import { DoorClosed, Plus, Edit, Trash2, Search, Building2 } from 'lucide-react';

export const ManageRooms = () => {
  const [hostels, setHostels] = useState([]);
  const [selectedHostelId, setSelectedHostelId] = useState(1);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal
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
    loadHostels();
  }, []);

  useEffect(() => {
    if (selectedHostelId) {
      loadRooms();
    }
  }, [selectedHostelId, search]);

  const loadHostels = async () => {
    try {
      const res = await hostelService.getAll();
      if (res.data.success && res.data.data.length > 0) {
        setHostels(res.data.data);
        setSelectedHostelId(res.data.data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadRooms = async () => {
    try {
      setLoading(true);
      const res = await roomService.getByHostel(selectedHostelId, search);
      if (res.data.success) {
        setRooms(res.data.data);
      }
    } catch (err) {
      console.error(err);
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
      roomNumber: room.roomNumber,
      floor: room.floor,
      capacity: room.capacity,
      roomType: room.roomType,
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
        await roomService.update(editingRoom.id, { ...formData, hostelId: selectedHostelId });
      } else {
        await roomService.create({ ...formData, hostelId: selectedHostelId });
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.85rem)', fontWeight: 800, color: 'var(--primary)' }}>
            Master Room Management (All Hostels)
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginTop: '0.25rem' }}>
            Add, edit, and configure room capacities across Boys and Girls hostels
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={18} />
          <span>Add Room to Selected Hostel</span>
        </button>
      </div>

      {/* Hostel Switcher & Search Bar */}
      <div className="card toolbar-responsive" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {hostels.map(h => (
            <button
              key={h.id}
              onClick={() => setSelectedHostelId(h.id)}
              className={`btn btn-sm ${selectedHostelId === h.id ? 'btn-primary' : 'btn-outline'}`}
            >
              <Building2 size={16} />
              <span>{h.hostelName}</span>
            </button>
          ))}
        </div>

        <div className="toolbar-search" style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '38px' }}
            placeholder="Search room number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner message="Loading rooms..." />
      ) : (
        <>
          <div className="table-scroll-hint">← Scroll horizontally to view details →</div>
          <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Room Number</th>
                <th>Floor</th>
                <th>Capacity</th>
                <th>Room Type</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(room => (
                <tr key={room.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                      <DoorClosed size={18} />
                      <span>{room.roomNumber}</span>
                    </div>
                  </td>
                  <td>Floor {room.floor}</td>
                  <td><strong>{room.capacity} Beds</strong></td>
                  <td>{room.roomType}</td>
                  <td><StatusBadge status={room.status} /></td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button onClick={() => handleOpenEdit(room)} className="btn btn-outline btn-sm">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDelete(room.id)} className="btn btn-outline btn-sm" style={{ color: 'var(--danger)', borderColor: '#fecaca' }}>
                        <Trash2 size={14} />
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

      {/* Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingRoom ? `Edit Room ${editingRoom.roomNumber}` : 'Add Room'}
        >
          {error && (
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--danger-bg)', color: '#b91c1c', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Room Number *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. B-105 or G-105"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Floor Number *</label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  max="10"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bed Capacity *</label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  max="8"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Room Type</label>
              <input
                type="text"
                className="form-input"
                value={formData.roomType}
                onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Room Status</label>
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
              <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline">Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Room'}
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
