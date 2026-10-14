import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { wardenPortalService, bedService } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import { Bed as BedIcon, DoorClosed, Search, User, CheckCircle, Clock, ShieldCheck, Building2 } from 'lucide-react';

export const Beds = () => {
  const { user } = useAuth();
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    loadBeds();
  }, [statusFilter]);

  const loadBeds = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;

      // Calls /api/warden/beds - strictly isolated by authenticated Warden's hostelId
      const res = await wardenPortalService.getBeds(params);
      if (res.data.success) {
        setBeds(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load beds:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bedId, newStatus) => {
    try {
      await bedService.updateStatus(bedId, newStatus);
      loadBeds();
    } catch (err) {
      alert("Failed to update bed status: " + (err.response?.data?.message || err.message));
    }
  };

  const isGirlsHostel = user?.hostelId === 2;
  const hostelTitle = isGirlsHostel ? 'Girls Hostel' : 'Boys Hostel';

  const filteredBeds = beds.filter(bed => {
    const q = search.toLowerCase();
    const rNum = (bed.room_number || '').toLowerCase();
    const bNum = (bed.bed_number || '').toLowerCase();
    const stName = (bed.student_name || '').toLowerCase();
    const stPrn = (bed.student_prn || '').toLowerCase();
    return rNum.includes(q) || bNum.includes(q) || stName.includes(q) || stPrn.includes(q);
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
        padding: '2rem',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div>
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
            <span>{hostelTitle} Bed Inventory</span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Bed Management</h1>
          <p style={{ opacity: 0.85, fontSize: '0.875rem', marginTop: '0.15rem' }}>
            Track bed occupancy, status restrictions, and resident allocations for {hostelTitle}.
          </p>
        </div>

        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          padding: '0.75rem 1.25rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Total Beds</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{beds.length}</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="card" style={{ padding: '1rem clamp(0.75rem, 2vw, 1.25rem)' }}>
        <div className="toolbar-responsive">
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Status Filter:</span>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '180px', fontSize: '0.85rem' }}
            >
              <option value="ALL">All Beds</option>
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="OCCUPIED">OCCUPIED</option>
              <option value="RESERVED">RESERVED</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
            </select>
          </div>

          <div className="toolbar-search" style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px', fontSize: '0.875rem' }}
              placeholder="Search room number, bed, or student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

        </div>
      </div>

      <div className="table-scroll-hint">👈 Swipe horizontally to view all columns 👉</div>

      {/* Beds Table */}
      {loading ? (
        <LoadingSpinner message="Loading beds..." />
      ) : filteredBeds.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <BedIcon size={48} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No Beds Found</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {search ? 'Try modifying your search filter.' : 'Beds will appear here once rooms are created.'}
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ margin: 0 }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Bed ID</th>
                  <th>Room ID / Room Number</th>
                  <th>Bed Number</th>
                  <th>Status</th>
                  <th>Allocated Resident</th>
                  <th>Student PRN</th>
                  <th style={{ textAlign: 'right' }}>Status Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBeds.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <span style={{ fontWeight: 800, color: '#1e3a8a' }}>
                        B-{String(b.id).padStart(3, '0')}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <DoorClosed size={15} color="#2563eb" />
                        <span style={{ fontWeight: 800, color: '#0f172a' }}>{b.room_number}</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>(Room ID: {b.room_id})</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <BedIcon size={15} color="#059669" />
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>Bed {b.bed_number}</span>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={b.status} />
                    </td>
                    <td>
                      {b.student_name ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <User size={14} color="#1d4ed8" />
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>{b.student_name}</span>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Vacant / Unallotted</span>
                      )}
                    </td>
                    <td>
                      {b.student_prn ? (
                        <span style={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          backgroundColor: '#f1f5f9',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px'
                        }}>
                          {b.student_prn}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>-</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <select
                        className="form-select"
                        value={b.status}
                        disabled={b.status === 'OCCUPIED'}
                        onChange={(e) => handleStatusChange(b.id, e.target.value)}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          width: '130px',
                          display: 'inline-block'
                        }}
                      >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="OCCUPIED" disabled>OCCUPIED</option>
                        <option value="RESERVED">RESERVED</option>
                        <option value="MAINTENANCE">MAINTENANCE</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
