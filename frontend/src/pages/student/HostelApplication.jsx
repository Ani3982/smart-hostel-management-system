import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { studentService, hostelService, applicationService, documentService } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { 
  Building2, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const HostelApplication = () => {
  const { user, loading: authLoading } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [hostels, setHostels] = useState([]);
  const [targetHostel, setTargetHostel] = useState(null);
  const [existingApp, setExistingApp] = useState(null);

  const [preferredRoomType, setPreferredRoomType] = useState('Standard 4-Sharing');
  const [remarks, setRemarks] = useState('');
  
  // Document files
  const [photoFile, setPhotoFile] = useState(null);
  const [collegeIdFile, setCollegeIdFile] = useState(null);
  const [identityProofFile, setIdentityProofFile] = useState(null);
  const [admissionProofFile, setAdmissionProofFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const currentUserId = user?.id || user?.userId;
      if (currentUserId) {
        const studentRes = await studentService.getByUserId(currentUserId);
        if (studentRes.data.success) {
          const s = studentRes.data.data;
          setStudent(s);

          const hostelsRes = await hostelService.getAll();
          if (hostelsRes.data.success) {
            const list = hostelsRes.data.data;
            setHostels(list);
            // Pick based on gender
            const eligibleType = s.gender === 'MALE' ? 'BOYS' : 'GIRLS';
            const match = list.find(h => h.hostelType === eligibleType);
            setTargetHostel(match || list[0]);
          }
        }
      }

      // Check existing application
      try {
        const appRes = await applicationService.getMyApplication();
        if (appRes.data.success && appRes.data.data) {
          setExistingApp(appRes.data.data);
        }
      } catch (e) {}

    } catch (err) {
      console.error(err);
      setError('Could not load student profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetHostel) {
      setError('Eligible hostel could not be determined.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // 1. Submit Application
      const appRes = await applicationService.submit({
        hostelId: targetHostel.id,
        preferredRoomType,
        remarks
      });

      // 2. Upload documents if chosen
      if (photoFile) {
        await documentService.upload('STUDENT_PHOTO', photoFile);
      }
      if (collegeIdFile) {
        await documentService.upload('COLLEGE_ID', collegeIdFile);
      }
      if (identityProofFile) {
        await documentService.upload('IDENTITY_PROOF', identityProofFile);
      }
      if (admissionProofFile) {
        await documentService.upload('ADMISSION_PROOF', admissionProofFile);
      }

      setSuccess('Hostel application and documents submitted successfully!');
      setTimeout(() => {
        navigate('/student/status');
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Application submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return <LoadingSpinner fullScreen message={lang === 'mr' ? "सत्र पडताळत आहे..." : "Authenticating session..."} />;
  }

  if (loading) {
    return <LoadingSpinner fullScreen message={lang === 'mr' ? "वसतिगृह प्रवेश अर्ज माहिती लोड होत आहे..." : "Loading application details..."} />;
  }

  if (existingApp && (existingApp.status === 'PENDING' || existingApp.status === 'APPROVED')) {
    return (
      <div className="card" style={{ maxWidth: '650px', margin: '2rem auto', textAlign: 'center', padding: '3rem 2rem' }}>
        <CheckCircle size={54} color="var(--success)" style={{ margin: '0 auto 1rem auto' }} />
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
          {lang === 'mr' ? 'सक्रिय अर्ज आधीच सादर केला आहे' : 'Active Application Exists'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0.75rem auto 1.5rem auto' }}>
          {lang === 'mr' 
            ? <>आपण आधीच <strong>{existingApp.hostel?.hostelName || 'वसतिगृह'}</strong> साठी अर्ज सादर केला आहे. सद्य स्थिती: <strong>{t(existingApp.status)}</strong>.</>
            : <>You have already submitted an application for <strong>{existingApp.hostel?.hostelName || 'Hostel'}</strong>. Current status: <strong>{existingApp.status}</strong>.</>}
        </p>
        <button onClick={() => navigate('/student/status')} className="btn btn-primary">
          {t('applicationStatus')}
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary)' }}>
          {lang === 'mr' ? 'वसतिगृह प्रवेश अर्ज फॉर्म' : 'Hostel Admission Application Form'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginTop: '0.25rem' }}>
          {lang === 'mr' ? 'कृपया आपली माहिती तपासा व आवश्यक पडताळणी कागदपत्रे अपलोड करा.' : 'Please verify your details and upload the required verification documents.'}
        </p>
      </div>

      <div className="card" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)' }}>
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.85rem 1rem',
            backgroundColor: 'var(--danger-bg)',
            color: '#b91c1c',
            borderRadius: '8px',
            border: '1px solid #fecaca',
            fontSize: '0.9rem',
            marginBottom: '1.5rem'
          }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.85rem 1rem',
            backgroundColor: 'var(--success-bg)',
            color: '#047857',
            borderRadius: '8px',
            border: '1px solid #a7f3d0',
            fontSize: '0.9rem',
            marginBottom: '1.5rem'
          }}>
            <CheckCircle size={20} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Hostel Summary Info */}
          <div style={{
            padding: '1.25rem',
            backgroundColor: '#f0f9ff',
            borderRadius: '10px',
            border: '1px solid #bae6fd',
            marginBottom: '1.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#0369a1', fontSize: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <Building2 size={20} />
              <span>{lang === 'mr' ? 'पात्र वसतिगृह' : 'Assigned Hostel'}: {targetHostel?.hostelName}</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#0369a1', lineHeight: 1.5 }}>
              {lang === 'mr' ? 'नोंदणीकृत लिंगानुसार पात्रता निश्चित केली:' : 'Eligibility verified based on registered gender:'} <strong>{t(student?.gender)}</strong>.
            </p>
          </div>

          {/* Preferences */}
          <div className="form-grid-responsive" style={{ marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">{t('roomPref')}</label>
              <select
                className="form-select"
                value={preferredRoomType}
                onChange={(e) => setPreferredRoomType(e.target.value)}
              >
                <option value="Standard 4-Sharing">{lang === 'mr' ? 'प्रमाणित ४-विद्यार्थी शेअरिंग खोली' : 'Standard 4-Sharing (4 Bed)'}</option>
                <option value="Standard 3-Sharing">{lang === 'mr' ? 'प्रमाणित ३-विद्यार्थी शेअरिंग खोली' : 'Standard 3-Sharing (3 Bed)'}</option>
                <option value="Twin Sharing">{lang === 'mr' ? '२-विद्यार्थी शेअरिंग खोली' : 'Twin Sharing (2 Bed)'}</option>
              </select>
            </div>

            <div className="form-group grid-span-all">
              <label className="form-label">{lang === 'mr' ? 'विशेष शेरा / आरोग्य किंवा निवास नोंद (ऐच्छिक)' : 'Special Remarks / Dietary or Medical Notes (Optional)'}</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder={lang === 'mr' ? 'काही विशेष आरोग्य स्थिती किंवा मूळ गाव असल्यास नमूद करा...' : 'Mention any health conditions, native place, or special requests...'}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>

          {/* Document Upload Section */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
              {t('documents')}
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              {lang === 'mr' ? 'स्वीकार्य स्वरूप: JPG, PNG, PDF (प्रत्येक फाइल कमाल १० MB)' : 'Accepted formats: JPG, PNG, PDF (Max 10MB each).'}
            </p>

            <div className="form-grid-responsive">
              <div className="form-group">
                <label className="form-label">1. {t('uploadPhoto')}</label>
                <input
                  type="file"
                  className="form-input"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files[0])}
                />
              </div>

              <div className="form-group">
                <label className="form-label">2. {t('uploadCollegeId')}</label>
                <input
                  type="file"
                  className="form-input"
                  accept=".pdf,image/*"
                  onChange={(e) => setCollegeIdFile(e.target.files[0])}
                />
              </div>

              <div className="form-group">
                <label className="form-label">3. {t('uploadAadhaar')}</label>
                <input
                  type="file"
                  className="form-input"
                  accept=".pdf,image/*"
                  onChange={(e) => setIdentityProofFile(e.target.files[0])}
                />
              </div>

              <div className="form-group">
                <label className="form-label">4. {t('uploadAdmission')}</label>
                <input
                  type="file"
                  className="form-input"
                  accept=".pdf,image/*"
                  onChange={(e) => setAdmissionProofFile(e.target.files[0])}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem' }}
            disabled={submitting}
          >
            <Upload size={18} />
            <span>{submitting ? (lang === 'mr' ? 'अर्ज व कागदपत्रे सादर होत आहेत...' : 'Submitting Application & Documents...') : (lang === 'mr' ? 'वसतिगृह अर्ज सादर करा' : 'Submit Hostel Application')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
