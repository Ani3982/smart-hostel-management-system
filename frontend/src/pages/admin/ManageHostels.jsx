import React, { useState, useEffect } from 'react';
import { hostelService } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatusBadge } from '../../components/StatusBadge';
import { Building2, MapPin, DoorClosed, ShieldCheck } from 'lucide-react';

export const ManageHostels = () => {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHostels();
  }, []);

  const loadHostels = async () => {
    try {
      setLoading(true);
      const res = await hostelService.getAll();
      if (res.data.success) {
        setHostels(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading hostels configuration..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.85rem)', fontWeight: 800, color: 'var(--primary)' }}>
          Campus Hostels Configuration
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginTop: '0.25rem' }}>
          Overview of Boys and Girls residential buildings at New Arts, Commerce and Science College, Ahilyanagar
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.5rem' }}>
        {hostels.map(hostel => (
          <div key={hostel.id} className="card" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', borderTop: `6px solid ${hostel.hostelType === 'BOYS' ? '#1b3b6f' : '#0284c7'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  {hostel.hostelType} HOSTEL
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.4rem', color: 'var(--text-main)' }}>
                  {hostel.hostelName}
                </h3>
              </div>
              <StatusBadge status={hostel.status} />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              <MapPin size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{hostel.address}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Rooms</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{hostel.totalRooms || 10}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Capacity</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{(hostel.totalRooms || 10) * 4} Beds</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
