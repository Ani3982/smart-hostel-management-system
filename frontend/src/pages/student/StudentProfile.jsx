import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { studentService } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { User, Save, CheckCircle, AlertCircle, Phone, Mail, MapPin, GraduationCap, Users } from 'lucide-react';

export const StudentProfile = () => {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const currentUserId = user?.id || user?.userId;
      if (!currentUserId) return;
      const res = await studentService.getByUserId(currentUserId);
      if (res.data.success) {
        setStudent(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError(lang === 'mr' ? 'विद्यार्थी प्रोफाईल लोड होऊ शकले नाही' : 'Could not fetch student profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await studentService.update(student.id, student);
      if (res.data.success) {
        setStudent(res.data.data);
        setSuccess(lang === 'mr' ? 'विद्यार्थी प्रोफाईल माहिती यशस्वीरीत्या अद्ययावत झाली!' : 'Profile updated successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || (lang === 'mr' ? 'प्रोफाईल जतन करणे अयशस्वी झाले' : 'Profile update failed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message={lang === 'mr' ? "प्रोफाईल माहिती लोड होत आहे..." : "Loading profile..."} />;
  }

  if (!student) {
    return <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>{t('noRecords')}</div>;
  }

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary)' }}>
          {lang === 'mr' ? 'वसतिगृह निवासी विद्यार्थी प्रोफाईल' : 'Resident Student Profile'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginTop: '0.25rem' }}>
          {lang === 'mr' ? 'वैयक्तिक, शैक्षणिक व आपत्कालीन संपर्क माहिती व्यवस्थापित करा' : 'Manage your personal, academic, and emergency contact details'}
        </p>
      </div>

      <div className="card" style={{ padding: 'clamp(1.25rem, 3vw, 2.5rem)' }}>
        {success && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem', backgroundColor: 'var(--success-bg)', color: '#047857', borderRadius: '8px', border: '1px solid #a7f3d0', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem', backgroundColor: 'var(--danger-bg)', color: '#b91c1c', borderRadius: '8px', border: '1px solid #fecaca', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave}>
          
          {/* Read Only Meta */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
            gap: '1rem',
            backgroundColor: '#f8fafc',
            padding: '1.25rem',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            marginBottom: '2rem',
            fontSize: '0.875rem'
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>{t('studentId')}: </span>
              <strong>{student.studentId}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>{t('gender')}: </span>
              <strong>{t(student.gender)}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>{t('dob')}: </span>
              <strong>{student.dob}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>{t('email')}: </span>
              <strong>{student.email}</strong>
            </div>
          </div>

          {/* Personal Info */}
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} />
            <span>1. {t('personalInfo')}</span>
          </h3>

          <div className="form-grid-responsive" style={{ marginBottom: '1.75rem' }}>
            <div className="form-group">
              <label className="form-label">{t('fullName')}</label>
              <input type="text" className="form-input" name="fullName" value={student.fullName} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">{t('mobile')}</label>
              <input type="tel" className="form-input" name="mobile" value={student.mobile} onChange={handleChange} required />
            </div>

            <div className="form-group grid-span-all">
              <label className="form-label">{t('address')}</label>
              <input type="text" className="form-input" name="address" value={student.address} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">{t('city')}</label>
              <input type="text" className="form-input" name="city" value={student.city} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">{t('state')}</label>
              <input type="text" className="form-input" name="state" value={student.state} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">{t('pincode')}</label>
              <input type="text" className="form-input" name="pincode" value={student.pincode} onChange={handleChange} required />
            </div>
          </div>

          {/* Academic Info */}
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <GraduationCap size={18} />
            <span>2. {t('academicInfo')}</span>
          </h3>

          <div className="form-grid-responsive" style={{ marginBottom: '1.75rem' }}>
            <div className="form-group">
              <label className="form-label">{t('course')}</label>
              <input type="text" className="form-input" name="course" value={student.course} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">{t('department')}</label>
              <input type="text" className="form-input" name="department" value={student.department} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">{t('academicYear')}</label>
              <input type="text" className="form-input" name="academicYear" value={student.academicYear} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">{t('rollNumber')}</label>
              <input type="text" className="form-input" name="rollNumber" value={student.rollNumber} onChange={handleChange} required />
            </div>
          </div>

          {/* Parent Info */}
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <Users size={18} />
            <span>3. {t('parentInfo')}</span>
          </h3>

          <div className="form-grid-responsive" style={{ marginBottom: '2rem' }}>
            <div className="form-group">
              <label className="form-label">{t('parentName')}</label>
              <input type="text" className="form-input" name="parentName" value={student.parentName} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">{t('parentMobile')}</label>
              <input type="tel" className="form-input" name="parentMobile" value={student.parentMobile} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">{t('emergencyContact')}</label>
              <input type="tel" className="form-input" name="emergencyContact" value={student.emergencyContact} onChange={handleChange} required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }} disabled={saving}>
            <Save size={18} />
            <span>{saving ? (lang === 'mr' ? 'जतन करत आहे...' : 'Saving...') : t('save')}</span>
          </button>
        </form>
      </div>

    </div>
  );
};
