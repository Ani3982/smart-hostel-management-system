import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { allocationService, bedService } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Bed as BedIcon, DoorClosed, Building2, UserCheck, CreditCard, CheckCircle } from 'lucide-react';

export const RoomAllocation = () => {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [allocation, setAllocation] = useState(null);
  const [roomBeds, setRoomBeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllocation();
  }, [user]);

  const loadAllocation = async () => {
    try {
      setLoading(true);
      const allocRes = await allocationService.getMyAllocation();
      if (allocRes.data.success && allocRes.data.data) {
        const alloc = allocRes.data.data;
        setAllocation(alloc);

        // Fetch beds in that room
        if (alloc?.room?.id) {
          const bedsRes = await bedService.getByRoom(alloc.room.id);
          if (bedsRes.data.success) {
            setRoomBeds(bedsRes.data.data);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message={lang === 'mr' ? "वाटप झालेली खोली व खाट माहिती लोड होत आहे..." : "Loading allocated room & bed layout..."} />;
  }

  if (!allocation) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center', padding: '3rem 2rem' }}>
        <BedIcon size={52} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
          {lang === 'mr' ? 'कोणतीही खोली अद्याप वाटप झालेली नाही' : 'No Room Allocated Yet'}
        </h2>
        <p style={{ color: 'var(--text-muted)', margin: '0.75rem auto 1.5rem auto' }}>
          {lang === 'mr' 
            ? 'प्रथम आपला अर्ज मंजूर होणे आवश्यक आहे. त्यानंतर वसतिगृह वॉर्डन आपल्या नावावर उपलब्ध खोली व खाट वाटप करतील.' 
            : 'Your application must be approved first. The Hostel Warden will allocate an available room and bed to your profile.'}
        </p>
        <Link to="/student/status" className="btn btn-outline">
          {t('applicationStatus')}
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Allocation Header */}
      <div className="card" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', borderTop: '6px solid var(--primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {allocation.hostel?.hostelName || 'Hostel'}
            </div>
            <h1 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.85rem)', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>
              {lang === 'mr' ? 'खोली क्र.' : 'Room'} {allocation.room?.roomNumber || '—'} • {t('floorNumber')} {allocation.room?.floor ?? '—'}
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {lang === 'mr' ? 'प्रकार:' : 'Type:'} {allocation.room?.roomType || 'Standard'} | {t('roomCapacity')}: {allocation.room?.capacity || 4} {t('beds')}
            </p>
          </div>

          <div style={{ textAlign: 'left' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#047857',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '1rem',
              flexWrap: 'wrap'
            }}>
              <CheckCircle size={20} />
              <span>{lang === 'mr' ? 'आपली खाट' : 'Your Bed'}: {allocation.bed?.bedNumber || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Room & Bed Layout */}
      <div className="card" style={{ padding: 'clamp(1.25rem, 3vw, 2.5rem)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
          {lang === 'mr' ? 'खोली व खाटांची परस्पर मांडणी (Visualization)' : 'Interactive Room Bed Visualization'}
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          {lang === 'mr' 
            ? `खोली क्र. ${allocation.room.roomNumber} मधील खाटांची मांडणी खालीलप्रमाणे आहे. आपल्या नावे असलेली खाट हिरव्या रंगात चिन्हांकित आहे.` 
            : `Below is the layout of Room ${allocation.room.roomNumber}. Your assigned bed is highlighted in emerald green.`}
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
          gap: '1rem',
          backgroundColor: '#f8fafc',
          padding: 'clamp(1rem, 2vw, 2rem)',
          borderRadius: '16px',
          border: '2px dashed var(--border)'
        }}>
          {roomBeds.map((b) => {
            const isMyBed = b.id === allocation.bed.id;
            const isOccupied = b.status === 'OCCUPIED' || b.status === 'RESERVED';

            return (
              <div key={b.id} style={{
                backgroundColor: isMyBed ? '#ecfdf5' : 'white',
                border: isMyBed ? '2px solid #10b981' : '1px solid var(--border)',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'center',
                boxShadow: isMyBed ? '0 4px 12px rgba(16, 185, 129, 0.2)' : 'var(--shadow-sm)',
                position: 'relative'
              }}>
                {isMyBed && (
                  <span style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#10b981',
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.6rem',
                    borderRadius: '9999px',
                    textTransform: 'uppercase'
                  }}>
                    {lang === 'mr' ? 'आपली खाट' : 'Assigned to You'}
                  </span>
                )}

                <BedIcon 
                  size={36} 
                  color={isMyBed ? '#10b981' : isOccupied ? '#f59e0b' : '#3b82f6'} 
                  style={{ margin: '0 auto 0.75rem auto' }}
                />

                <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-main)' }}>
                  {b.bedNumber}
                </div>

                <div style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  marginTop: '0.4rem',
                  color: isMyBed ? '#047857' : isOccupied ? '#b45309' : '#1d4ed8'
                }}>
                  {isMyBed 
                    ? (lang === 'mr' ? 'आपली खाट वाटप' : 'YOUR ALLOCATION') 
                    : isOccupied 
                      ? (lang === 'mr' ? 'खोलीमित्र (प्रवेशित)' : 'OCCUPIED') 
                      : (lang === 'mr' ? 'उपलब्ध खाट' : 'AVAILABLE')}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.5rem', fontSize: '0.85rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: 12, height: 12, borderRadius: '3px', backgroundColor: '#10b981' }}></span>
            <span>{lang === 'mr' ? 'आपली खाट (वाटप)' : 'Your Bed'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: 12, height: 12, borderRadius: '3px', backgroundColor: '#f59e0b' }}></span>
            <span>{lang === 'mr' ? 'खोलीमित्रांची खाट (प्रवेशित)' : 'Roommate Occupied'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: 12, height: 12, borderRadius: '3px', backgroundColor: '#3b82f6' }}></span>
            <span>{lang === 'mr' ? 'रिक्त / उपलब्ध खाट' : 'Vacant / Available'}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
