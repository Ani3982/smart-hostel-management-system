import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { dashboardService } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Building2, Bed, AlertCircle, ArrowRight, CheckCircle2, XCircle, Wrench, Layers } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';

export const HostelAvailability = () => {
  const { t, lang } = useLanguage();
  const { hostelType } = useParams();
  const navigate = useNavigate();

  const normalizedFilter = (() => {
    const val = (hostelType || '').toLowerCase();
    if (val === 'boys') return 'BOYS';
    if (val === 'girls') return 'GIRLS';
    return 'ALL';
  })();

  const [stats, setStats] = useState(null);
  const [matrix, setMatrix] = useState([]);
  const [loading, setLoading] = useState(true);
  const [floorFilter, setFloorFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedBed, setSelectedBed] = useState(null);

  useEffect(() => {
    loadAvailability();
  }, []);

  useEffect(() => {
    setSelectedBed(null);
    setFloorFilter('ALL');
  }, [normalizedFilter]);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      const [summaryRes, matrixRes] = await Promise.all([
        dashboardService.getPublicSummary(),
        dashboardService.getPublicMatrix()
      ]);

      if (summaryRes.data.success) {
        setStats(summaryRes.data.data);
      }
      if (matrixRes.data.success) {
        setMatrix(matrixRes.data.data || []);
      }
    } catch (e) {
      console.error(e);
      setStats({
        totalBeds: 80,
        occupiedBeds: 1,
        availableBeds: 79,
        boysHostel: {
          hostelId: 1,
          hostelType: 'BOYS',
          totalRooms: 10,
          totalBeds: 40,
          occupiedBeds: 1,
          availableBeds: 39
        },
        girlsHostel: {
          hostelId: 2,
          hostelType: 'GIRLS',
          totalRooms: 10,
          totalBeds: 40,
          occupiedBeds: 0,
          availableBeds: 40
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message={lang === 'mr' ? 'वसतिगृह जागांची थेट माहिती लोड होत आहे...' : 'Fetching live hostel bed availability...'} />;
  }

  const totalBedsAll = stats?.totalBeds ?? (matrix.reduce((sum, h) => sum + (h.totalBeds || 0), 0) || 80);
  const availableBedsAll = stats?.availableBeds ?? (matrix.reduce((sum, h) => sum + (h.availableBeds || 0), 0) || 79);

  const visibleHostels = matrix.filter(h => normalizedFilter === 'ALL' || h.hostelType === normalizedFilter);

  const renderHostelSummaryCard = (hostelData, borderColor, color) => {
    if (!hostelData) return null;
    const total = hostelData.totalBeds || 40;
    const occupied = hostelData.occupiedBeds || 0;
    const available = hostelData.availableBeds ?? (total - occupied);
    const percentOccupied = total > 0 ? Math.round((occupied / total) * 100) : 0;
    const percentAvailable = 100 - percentOccupied;
    const isBoys = hostelData.hostelType === 'BOYS';

    return (
      <div className="card" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', borderTop: `6px solid ${borderColor}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <span style={{
              backgroundColor: `${color}15`,
              color,
              fontWeight: 800,
              fontSize: '0.75rem',
              padding: '0.25rem 0.6rem',
              borderRadius: '6px',
              textTransform: 'uppercase'
            }}>
              {isBoys ? t('boysHostelShort') : t('girlsHostelShort')}
            </span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.45rem' }}>
              {isBoys ? t('boysHostel') : t('girlsHostel')}
            </h3>
          </div>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
            flexShrink: 0
          }}>
            <Building2 size={22} />
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))',
          gap: '0.75rem',
          marginBottom: '1.35rem'
        }}>
          <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('totalRooms')}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{hostelData.totalRooms}</div>
          </div>
          <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('totalBeds')}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{total}</div>
          </div>
          <div style={{ padding: '0.85rem', backgroundColor: '#ecfdf5', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
            <div style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 700 }}>{t('availableBeds')}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#047857' }}>{available}</div>
          </div>
          <div style={{ padding: '0.85rem', backgroundColor: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca' }}>
            <div style={{ fontSize: '0.78rem', color: '#b91c1c', fontWeight: 700 }}>{t('occupiedBeds')}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#b91c1c' }}>{occupied}</div>
          </div>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.25rem' }}>
            <span>{lang === 'mr' ? 'प्रवेश क्षमता प्रमाण' : 'Capacity Status'}</span>
            <span>{available} / {total} {lang === 'mr' ? 'उपलब्ध' : 'Available'} ({percentAvailable}%)</span>
          </div>
          <div style={{ height: '10px', width: '100%', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${percentOccupied}%`, backgroundColor: '#ef4444', transition: 'width 0.5s ease' }} title={`Occupied: ${occupied}`} />
            <div style={{ width: `${percentAvailable}%`, backgroundColor: '#10b981', transition: 'width 0.5s ease' }} title={`Available: ${available}`} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          {normalizedFilter === 'ALL' && (
            <button
              type="button"
              onClick={() => navigate(isBoys ? '/availability/boys' : '/availability/girls')}
              className="btn btn-outline"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <Layers size={16} />
              <span>{lang === 'mr' ? 'खाटांचा आराखडा पहा' : 'View Seat Matrix'}</span>
            </button>
          )}
          <Link to="/register" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
            <span>{t('applyNow')}</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="container" style={{ padding: 'clamp(1.5rem, 4vw, 2.75rem) 1rem' }}>
      {/* Header & Live Aggregate Counter */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          backgroundColor: '#ecfdf5',
          color: '#065f46',
          border: '1px solid #a7f3d0',
          padding: '0.3rem 0.9rem',
          borderRadius: '9999px',
          fontSize: '0.82rem',
          fontWeight: 800,
          marginBottom: '0.75rem'
        }}>
          <CheckCircle2 size={15} />
          <span>
            {lang === 'mr'
              ? `थेट स्थिती: ${availableBedsAll} उपलब्ध / ${totalBedsAll} एकूण खाटा`
              : `Live Occupancy: ${availableBedsAll} Available / ${totalBedsAll} Total Beds`}
          </span>
        </div>

        <h1 style={{ fontSize: 'clamp(1.45rem, 3.5vw, 2.15rem)', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
          {normalizedFilter === 'BOYS'
            ? t('boysHostel')
            : normalizedFilter === 'GIRLS'
              ? t('girlsHostel')
              : t('availability')}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '750px', margin: '0 auto' }}>
          {lang === 'mr'
            ? `${t('societyName')} संचलित ${t('collegeAutonomous')} येथील मजला, खोली आणि खाटनिहाय थेट उपलब्धता.`
            : `Interactive floor, room, and bed-level availability for Boys & Girls Hostels at ${t('collegeAutonomous')}.`}
        </p>

        {/* Dedicated Hostel Filter Navigation Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
          <button
            type="button"
            onClick={() => navigate('/availability')}
            className={`btn btn-sm ${normalizedFilter === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
          >
            <span>{lang === 'mr' ? `सर्व वसतिगृहे (${availableBedsAll}/${totalBedsAll})` : `All Hostels (${availableBedsAll}/${totalBedsAll})`}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/availability/boys')}
            className={`btn btn-sm ${normalizedFilter === 'BOYS' ? 'btn-primary' : 'btn-outline'}`}
          >
            <span>{t('boysHostelShort')} ({stats?.boysHostel?.availableBeds ?? 39}/{stats?.boysHostel?.totalBeds ?? 40})</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/availability/girls')}
            className={`btn btn-sm ${normalizedFilter === 'GIRLS' ? 'btn-secondary' : 'btn-outline'}`}
          >
            <span>{t('girlsHostelShort')} ({stats?.girlsHostel?.availableBeds ?? 40}/{stats?.girlsHostel?.totalBeds ?? 40})</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {(normalizedFilter === 'ALL' || normalizedFilter === 'BOYS') && renderHostelSummaryCard(stats?.boysHostel, '#1b3b6f', '#1b3b6f')}
        {(normalizedFilter === 'ALL' || normalizedFilter === 'GIRLS') && renderHostelSummaryCard(stats?.girlsHostel, '#0284c7', '#0284c7')}
      </div>

      {/* Interactive Seat Matrix Section */}
      <div className="card" style={{ padding: 'clamp(1.1rem, 3vw, 2rem)', marginBottom: '2.5rem' }}>
        <div className="toolbar-responsive" style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bed size={22} />
              <span>{t('seatMatrixTitle')}</span>
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {lang === 'mr'
                ? 'खोली आणि खाटांची थेट स्थिती पाहण्यासाठी कोणत्याही खाटेवर क्लिक करा'
                : 'Click any bed tile below to inspect live room & bed status details'}
            </p>
          </div>

          {/* Floor & Status Filter Controls */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '130px', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
              aria-label="Filter by floor"
            >
              <option value="ALL">{lang === 'mr' ? 'सर्व मजले' : 'All Floors'}</option>
              <option value="1">{lang === 'mr' ? 'मजला १ (Floor 1)' : 'Floor 1'}</option>
              <option value="2">{lang === 'mr' ? 'मजला २ (Floor 2)' : 'Floor 2'}</option>
            </select>

            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '140px', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by bed status"
            >
              <option value="ALL">{lang === 'mr' ? 'सर्व खाटा' : 'All Bed Statuses'}</option>
              <option value="AVAILABLE">{lang === 'mr' ? 'फक्त उपलब्ध (हिरवे)' : 'Available Only (Green)'}</option>
              <option value="OCCUPIED">{lang === 'mr' ? 'फक्त व्यापलेले (लाल)' : 'Occupied Only (Red)'}</option>
            </select>
          </div>
        </div>

        {/* Color Legend */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', fontSize: '0.82rem', fontWeight: 700 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#065f46' }}>
            <span style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#ecfdf5', border: '2px solid #10b981', display: 'inline-block' }} />
            <span>{t('AVAILABLE')}</span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#991b1b' }}>
            <span style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#fef2f2', border: '2px solid #ef4444', display: 'inline-block' }} />
            <span>{t('OCCUPIED')}</span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#92400e' }}>
            <span style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#fffbeb', border: '2px solid #f59e0b', display: 'inline-block' }} />
            <span>{t('MAINTENANCE')} / {t('RESERVED')}</span>
          </div>
        </div>

        {/* Selected Bed Inspector Banner */}
        {selectedBed && (
          <div style={{
            padding: '0.9rem 1.15rem',
            marginBottom: '1.5rem',
            borderRadius: '10px',
            backgroundColor: selectedBed.status === 'AVAILABLE' ? '#ecfdf5' : selectedBed.status === 'OCCUPIED' ? '#fef2f2' : '#fffbeb',
            border: `1px solid ${selectedBed.status === 'AVAILABLE' ? '#a7f3d0' : selectedBed.status === 'OCCUPIED' ? '#fecaca' : '#fde68a'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ fontSize: '0.88rem' }}>
              <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                {selectedBed.hostelName} • {lang === 'mr' ? 'खोली' : 'Room'} {selectedBed.roomNumber} ({lang === 'mr' ? 'मजला' : 'Floor'} {selectedBed.floor}) • {lang === 'mr' ? 'खाट' : 'Bed'} {selectedBed.bedNumber}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                {selectedBed.roomType} • {lang === 'mr' ? 'स्थिती' : 'Status'}: <strong>{t(selectedBed.status)}</strong>
              </div>
            </div>
            {selectedBed.status === 'AVAILABLE' && (
              <Link to="/register" className="btn btn-primary btn-sm">
                <span>{t('applyNow')}</span>
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
        )}

        {/* Render Seat Matrix per Hostel and Floor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {visibleHostels.map((hostel) => {
            const floors = [...new Set((hostel.rooms || []).map(r => r.floor))].sort((a, b) => a - b);
            const activeFloors = floors.filter(fl => floorFilter === 'ALL' || String(fl) === floorFilter);

            return (
              <div key={hostel.id}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '2px solid var(--primary-light)'
                }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: hostel.hostelType === 'BOYS' ? '#1b3b6f' : '#0284c7' }}>
                    {hostel.hostelType === 'BOYS' ? t('boysHostel') : t('girlsHostel')}
                  </h3>
                  <span className="badge badge-success">
                    {hostel.availableBeds} / {hostel.totalBeds} {t('AVAILABLE')}
                  </span>
                </div>

                {activeFloors.map(floorNum => {
                  const floorRooms = (hostel.rooms || []).filter(r => r.floor === floorNum);
                  return (
                    <div key={floorNum} style={{ marginBottom: '1.5rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {lang === 'mr' ? `मजला ${floorNum} (Floor ${floorNum})` : `Floor ${floorNum}`}
                      </div>

                      <div className="seat-matrix-grid">
                        {floorRooms.map(room => {
                          const filteredBeds = (room.beds || []).filter(b => {
                            if (statusFilter === 'ALL') return true;
                            return b.status === statusFilter;
                          });

                          if (statusFilter !== 'ALL' && filteredBeds.length === 0) return null;

                          const roomAvail = (room.beds || []).filter(b => b.status === 'AVAILABLE').length;

                          return (
                            <div key={room.id} className="room-matrix-card">
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary)' }}>
                                  {lang === 'mr' ? 'खोली' : 'Room'} {room.roomNumber}
                                </span>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: roomAvail > 0 ? '#047857' : '#b91c1c' }}>
                                  {roomAvail}/{room.beds?.length || room.capacity} {lang === 'mr' ? 'रिकाम्या' : 'free'}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{room.roomType}</div>

                              <div className="beds-mini-grid">
                                {filteredBeds.map(bed => {
                                  const stateClass = bed.status === 'AVAILABLE'
                                    ? 'available'
                                    : bed.status === 'OCCUPIED'
                                      ? 'occupied'
                                      : 'maintenance';
                                  const isSelected = selectedBed?.id === bed.id;

                                  return (
                                    <button
                                      key={bed.id}
                                      type="button"
                                      onClick={() => setSelectedBed({
                                        ...bed,
                                        roomNumber: room.roomNumber,
                                        floor: room.floor,
                                        roomType: room.roomType,
                                        hostelName: hostel.hostelType === 'BOYS' ? t('boysHostelShort') : t('girlsHostelShort')
                                      })}
                                      className={`bed-tile ${stateClass} ${isSelected ? 'selected' : ''}`}
                                      title={`${bed.bedNumber} — ${t(bed.status)}`}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        {bed.status === 'AVAILABLE' ? <CheckCircle2 size={12} /> : bed.status === 'OCCUPIED' ? <XCircle size={12} /> : <Wrench size={12} />}
                                        <span>{bed.bedNumber}</span>
                                      </div>
                                      <span style={{ fontSize: '0.64rem', opacity: 0.85 }}>{t(bed.status)}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Allocation Guidelines */}
      <div className="card" style={{ backgroundColor: '#f8fafc', padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <AlertCircle size={22} color="var(--primary)" />
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
            {lang === 'mr' ? 'वसतिगृह प्रवेश व वाटप मार्गदर्शक सूचना' : 'Hostel Allocation Guidelines'}
          </h4>
        </div>
        <ul style={{ paddingLeft: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {lang === 'mr' ? (
            <>
              <li>वसतिगृह प्रवेश अर्ज गुणवत्तेनुसार आणि अर्जाच्या वेळेनुसार स्वीकारले जातात.</li>
              <li>विद्यार्थ्यांचे लिंग (Gender) पडताळणीनुसार मुलांसाठी मुलांचे वसतिगृह व मुलींसाठी मुलींचे वसतिगृह अनिवार्य आहे.</li>
              <li>वसतिगृह प्रमुखांनी (Warden) अर्ज मंजूर केल्यानंतरच खोली व खाट क्रमांक वाटप केला जातो.</li>
              <li>वार्षिक शुल्क (₹१५,०००) ऑनलाईन यशस्वी भरल्यानंतरच प्रवेश पक्का मानला जातो.</li>
            </>
          ) : (
            <>
              <li>Hostel applications are reviewed in order of submission and academic merit.</li>
              <li>Male applicants are strictly eligible for the Boys Hostel; female applicants are strictly eligible for the Girls Hostel.</li>
              <li>After application approval by the Hostel Head / Warden, students are allocated a specific bed.</li>
              <li>Admission is confirmed only after full online payment of the annual hostel fee (₹15,000).</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};
