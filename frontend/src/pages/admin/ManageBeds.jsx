import React, { useState, useEffect } from 'react';
import { bedService, hostelService } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatusBadge } from '../../components/StatusBadge';
import { Bed as BedIcon, Building2 } from 'lucide-react';

export const ManageBeds = () => {
  const [hostels, setHostels] = useState([]);
  const [selectedHostelId, setSelectedHostelId] = useState(1);
  const [beds, setBeds] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHostels();
  }, []);

  useEffect(() => {
    if (selectedHostelId) {
      loadBeds();
    }
  }, [selectedHostelId]);

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

  const loadBeds = async () => {
    try {
      setLoading(true);
      const res = await bedService.getByHostel(selectedHostelId);
      if (res.data.success) {
        setBeds(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredBeds = beds.filter(b => {
    if (statusFilter === 'ALL') return true;
    return b.status === statusFilter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.85rem)', fontWeight: 800, color: 'var(--primary)' }}>
          Master Bed Inventory & Availability
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginTop: '0.25rem' }}>
          Inspect all physical bed allocations across campus residences
        </p>
      </div>

      {/* Switcher & Filter */}
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

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['ALL', 'AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-outline'}`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Beds */}
      {loading ? (
        <LoadingSpinner message="Loading beds..." />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
          gap: '1rem'
        }}>
          {filteredBeds.map(bed => {
            const isAvail = bed.status === 'AVAILABLE';
            return (
              <div key={bed.id} className="card" style={{
                textAlign: 'center',
                padding: '1.25rem',
                border: isAvail ? '1px solid #10b981' : '1px solid var(--border)'
              }}>
                <BedIcon size={32} color={isAvail ? '#10b981' : '#f59e0b'} style={{ margin: '0 auto 0.5rem auto' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{bed.bedNumber}</h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Room {bed.room.roomNumber} (Floor {bed.room.floor})
                </div>
                <StatusBadge status={bed.status} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
