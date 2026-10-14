import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { applicationService, allocationService, paymentService, studentService, complaintService } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  Building2, 
  FileText, 
  Bed, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  Download,
  User,
  ShoppingBag,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Edit3,
  ShieldCheck,
  Sparkles,
  XCircle
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { t, lang } = useLanguage();

  const [student, setStudent] = useState(null);
  const [application, setApplication] = useState(null);
  const [allocation, setAllocation] = useState(null);
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadStudentData();
  }, [user]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const currentUserId = user?.id || user?.userId;

      // Load student profile
      if (currentUserId) {
        try {
          const studentRes = await studentService.getByUserId(currentUserId);
          if (studentRes.data.success && studentRes.data.data) {
            setStudent(studentRes.data.data);
          }
        } catch (e) {
          console.warn("Could not load student profile", e);
        }
      }

      // Load application
      try {
        const appRes = await applicationService.getMyApplication();
        if (appRes.data.success && appRes.data.data) {
          setApplication(appRes.data.data);
        }
      } catch (e) {
        console.warn("Could not load application", e);
      }

      // Load allocation
      try {
        const allocRes = await allocationService.getMyAllocation();
        if (allocRes.data.success && allocRes.data.data) {
          setAllocation(allocRes.data.data);
        }
      } catch (e) {
        console.warn("Could not load allocation", e);
      }

      // Load payments
      try {
        const payRes = await paymentService.getMyPayments();
        if (payRes.data.success && payRes.data.data) {
          setPayments(payRes.data.data);
        }
      } catch (e) {
        console.warn("Could not load payments", e);
      }

      // Load student complaints
      try {
        const compRes = await complaintService.getAll();
        if (compRes.data && compRes.data.data) {
          setComplaints(compRes.data.data);
        }
      } catch (e) {
        console.warn("Could not load complaints", e);
      }
    } catch (err) {
      console.error("Dashboard load error", err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <LoadingSpinner fullScreen message={lang === 'mr' ? "सत्र पडताळत आहे..." : "Authenticating session..."} />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <LoadingSpinner fullScreen message={lang === 'mr' ? "विद्यार्थी कक्ष माहिती लोड होत आहे..." : "Loading student portal..."} />;
  }

  const hasSuccessfulPayment = payments.some(p => p.status === 'SUCCESS');
  const latestPayment = payments.length > 0 ? payments[0] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1b3b6f 0%, #0284c7 100%)',
        color: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <img 
            src="/college-logo-transparent.png" 
            alt="NACSC Logo" 
            style={{ width: '60px', height: '60px', objectFit: 'contain', backgroundColor: 'white', borderRadius: '50%', padding: '3px' }}
          />
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(255,255,255,0.18)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              <span>PRN: {student?.studentId || 'NACSC-2026'}</span>
              <span>•</span>
              <span>{t('autonomousBadge')}</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
              {t('welcomeBack')}, {student?.fullName || user?.name || user?.fullName || 'Student'}!
            </h1>
            <p style={{ opacity: 0.9, fontSize: '0.875rem', marginTop: '0.2rem' }}>
              {student?.course || 'Student Portal'} • {student?.department || 'College Campus'} • {t('collegeName')}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {!application ? (
            <Link to="/student/apply" className="btn btn-secondary" style={{ backgroundColor: 'white', color: 'var(--primary)' }}>
              <FileText size={18} />
              <span>{t('applyNow')}</span>
            </Link>
          ) : (
            <Link to="/student/status" className="btn btn-outline" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', borderColor: 'transparent' }}>
              <span>{t('applicationStatus')}</span>
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>

      {/* 🌟 Prominent Admission Status Alert Banner (Pending vs Approved by Warden) */}
      {application && (
        <>
          {application.status === 'PENDING' && (
            <div style={{
              background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
              border: '2px solid #f59e0b',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem 1.75rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1.25rem',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.12)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#f59e0b',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Clock size={28} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#92400e', margin: 0 }}>
                    {lang === 'mr' ? 'वसतिगृह प्रवेश अर्ज: वॉर्डन पडताळणी प्रलंबित' : 'Hostel Admission Status: PENDING WARDEN CONFIRMATION'}
                  </h3>
                  <span style={{
                    backgroundColor: '#fef08a',
                    color: '#854d0e',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '999px',
                    border: '1px solid #facc15'
                  }}>
                    {lang === 'mr' ? 'प्रलंबित (PENDING)' : 'PENDING WARDEN REVIEW'}
                  </span>
                </div>
                <p style={{ color: '#78350f', fontSize: '0.925rem', lineHeight: '1.55', margin: 0 }}>
                  {lang === 'mr'
                    ? `आपला नोंदणी व प्रवेश अर्ज यशस्वीरीत्या वॉर्डन यांच्याकडे पाठविला गेला आहे. वॉर्डन आपल्या कागदपत्रांची व पात्रतेची पडताळणी करत आहेत. वॉर्डन यांनी प्रवेश मंजूर (Confirm) करताच येथे स्थिती अद्ययावत होईल आणि खोली व खाट वाटप सुरू होईल.`
                    : `Your registration and hostel application has been submitted to the Warden Portal. The Warden is currently verifying your student records and eligibility. Once the Warden confirms your admission, your status will update here automatically and room allotment will be unlocked.`}
                </p>
                <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.85rem', flexWrap: 'wrap', fontSize: '0.825rem', color: '#92400e', fontWeight: 700 }}>
                  <span>🏢 {lang === 'mr' ? 'वसतिगृह' : 'Hostel'}: <strong>{application.hostel?.hostelName || 'Hostel'}</strong></span>
                  <span>🛏️ {lang === 'mr' ? 'खोली पसंती' : 'Preference'}: <strong>{application.preferredRoomType || 'Standard'}</strong></span>
                  <span>📅 {lang === 'mr' ? 'अर्ज तारीख' : 'Applied on'}: <strong>{application.applicationDate ? new Date(application.applicationDate).toLocaleDateString() : '—'}</strong></span>
                  <span>📋 {lang === 'mr' ? 'अर्ज क्र.' : 'Application ID'}: <strong>#{application.id}</strong></span>
                </div>
              </div>
            </div>
          )}

          {application.status === 'APPROVED' && (
            <div style={{
              background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
              border: '2px solid #10b981',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem 1.75rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1.25rem',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.12)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <CheckCircle size={28} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#065f46', margin: 0 }}>
                    {lang === 'mr' ? 'अभिनंदन! वॉर्डन यांच्याकडून वसतिगृह प्रवेश मंजूर झाला आहे!' : 'Congratulations! Hostel Admission Confirmed & Approved by Warden!'}
                  </h3>
                  <span style={{
                    backgroundColor: '#a7f3d0',
                    color: '#047857',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '999px',
                    border: '1px solid #6ee7b7'
                  }}>
                    {lang === 'mr' ? 'प्रवेश मंजूर (APPROVED)' : 'ADMISSION CONFIRMED'}
                  </span>
                </div>
                <p style={{ color: '#047857', fontSize: '0.925rem', lineHeight: '1.55', margin: 0 }}>
                  {lang === 'mr'
                    ? `वॉर्डन (${application.approvedBy || 'वॉर्डन अधिकारी'}) यांनी आपला वसतिगृह प्रवेश अधिकृतपणे मंजूर केला आहे! आपली जागा आरक्षित झाली आहे. कृपया खालील खोली व खाट वाटप किंवा प्रवेश शुल्क भरणा टप्प्यावर पुढे जा.`
                    : `Your hostel admission application for ${application.hostel?.hostelName || 'Hostel'} has been officially approved by ${application.approvedBy || 'Warden'}! Your admission is confirmed. Please proceed to check your room allocation or pay admission fees.`}
                </p>
                <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.85rem', flexWrap: 'wrap', fontSize: '0.825rem', color: '#065f46', fontWeight: 700 }}>
                  <span>✅ {lang === 'mr' ? 'मंजुरी अधिकारी' : 'Approved by'}: <strong>{application.approvedBy || 'Warden Office'}</strong></span>
                  {application.approvedDate && (
                    <span>📅 {lang === 'mr' ? 'मंजुरी दिनांक' : 'Approval Date'}: <strong>{new Date(application.approvedDate).toLocaleDateString()}</strong></span>
                  )}
                  <span>🏢 {lang === 'mr' ? 'वसतिगृह' : 'Hostel'}: <strong>{application.hostel?.hostelName || 'Hostel'}</strong></span>
                </div>
              </div>
            </div>
          )}

          {application.status === 'REJECTED' && (
            <div style={{
              background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
              border: '2px solid #ef4444',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem 1.75rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1.25rem'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <XCircle size={28} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#991b1b', margin: '0 0 0.4rem 0' }}>
                  {lang === 'mr' ? 'वसतिगृह अर्ज नाकारण्यात आला आहे' : 'Hostel Admission Application Rejected'}
                </h3>
                <p style={{ color: '#991b1b', fontSize: '0.9rem', margin: 0 }}>
                  <strong>{lang === 'mr' ? 'कारण' : 'Reason'}:</strong> {application.rejectionReason || 'Criteria not met'}. {lang === 'mr' ? 'अधिक माहितीसाठी वॉर्डन कार्यालयाशी संपर्क साधा.' : 'Please visit the Warden office for further details.'}
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* ⚠️ Active Complaint / Grievance Status Banner */}
      {complaints.filter(c => c.status === 'IN_PROGRESS' || c.status === 'PENDING').length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
          border: '1.5px solid #f59e0b',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 2px 12px rgba(245, 158, 11, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#f59e0b',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <strong style={{ color: '#92400e', fontSize: '1rem' }}>
                  {lang === 'mr' ? 'आपली नोंदविलेली वसतिगृह तक्रार प्रगतीपथावर आहे' : 'Active Room Maintenance / Grievance In Progress'}
                </strong>
                <span style={{
                  backgroundColor: complaints[0]?.status === 'IN_PROGRESS' ? '#dbeafe' : '#fef3c7',
                  color: complaints[0]?.status === 'IN_PROGRESS' ? '#1e40af' : '#b45309',
                  fontSize: '0.725rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.55rem',
                  borderRadius: '999px',
                  border: '1px solid currentColor'
                }}>
                  {complaints[0]?.status?.replace('_', ' ')}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 700 }}>
                  ({complaints[0]?.category} - Room {complaints[0]?.roomNumber})
                </span>
              </div>
              <p style={{ color: '#78350f', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
                "{complaints[0]?.description}" — <em>{complaints[0]?.remarks ? `Warden: ${complaints[0].remarks}` : 'Under warden inspection'}</em>
              </p>
            </div>
          </div>

          <Link
            to="/student/complaints"
            className="btn btn-sm"
            style={{
              backgroundColor: '#b45309',
              color: 'white',
              fontWeight: 800,
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              boxShadow: '0 2px 6px rgba(180, 83, 9, 0.3)'
            }}
          >
            {lang === 'mr' ? 'तक्रार निवारण कक्ष पहा →' : 'Track Grievances →'}
          </Link>
        </div>
      )}

      {/* 📄 Comprehensive Student Full Information Section (Registered Data Display) */}
      {student && (
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
                  {lang === 'mr' ? 'विद्यार्थी नोंदणी संपूर्ण माहिती' : 'Student Full Profile & Registration Details'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  {lang === 'mr' ? 'नोंदणी फॉर्ममध्ये भरलेली आपली अधिकृत वैयक्तिक, शैक्षणिक व संपर्क माहिती' : 'Complete personal, academic, guardian and hostel preference data submitted during registration'}
                </p>
              </div>
            </div>

            <Link to="/student/profile" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Edit3 size={15} />
              <span>{lang === 'mr' ? 'प्रोफाईल संपादित करा' : 'Edit Profile'}</span>
            </Link>
          </div>

          <div className="form-grid-responsive">
            {/* 1. Personal Information */}
            <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)', fontWeight: 800, fontSize: '0.95rem' }}>
                <User size={18} />
                <span>{lang === 'mr' ? '१. वैयक्तिक माहिती' : '1. Personal Information'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>{lang === 'mr' ? 'पूर्ण नाव' : 'Full Name'}: </span><strong>{student?.fullName || user?.name || '—'}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>{lang === 'mr' ? 'विद्यार्थी PRN' : 'Student PRN'}: </span><strong style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{student?.studentId || '—'}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>{lang === 'mr' ? 'लिंग' : 'Gender'}: </span><strong>{student?.gender === 'MALE' ? (lang === 'mr' ? 'मुलगा (Male)' : 'Male') : (lang === 'mr' ? 'मुलगी (Female)' : 'Female')}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>{lang === 'mr' ? 'जन्म तारीख' : 'Date of Birth'}: </span><strong>{student?.dob ? (String(student.dob).includes('T') ? new Date(student.dob).toLocaleDateString() : student.dob) : '—'}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>{lang === 'mr' ? 'ईमेल' : 'Email'}: </span><strong>{student?.email || user?.email || '—'}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>{lang === 'mr' ? 'मोबाईल नंबर' : 'Mobile Number'}: </span><strong>{student?.mobile || '—'}</strong></div>
              </div>
            </div>

            {/* 2. Academic Information */}
            <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#0284c7', fontWeight: 800, fontSize: '0.95rem' }}>
                <GraduationCap size={18} />
                <span>{lang === 'mr' ? '२. शैक्षणिक माहिती' : '2. Academic Details'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>{lang === 'mr' ? 'महाविद्यालय' : 'College'}: </span><strong>{student?.collegeName || 'New Arts, Commerce and Science College (Autonomous)'}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>{lang === 'mr' ? 'अभ्यासक्रम' : 'Course'}: </span><strong>{student?.course || '—'}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>{lang === 'mr' ? 'विभाग' : 'Department'}: </span><strong>{student?.department || '—'}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>{lang === 'mr' ? 'शैक्षणिक वर्ष' : 'Academic Year'}: </span><strong>{student?.academicYear || '—'}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>{lang === 'mr' ? 'हजेरी क्र. (Roll No)' : 'Roll Number'}: </span><strong>{student?.rollNumber || '—'}</strong></div>
              </div>
            </div>

            {/* 3. Address & Guardian Details */}
            <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#059669', fontWeight: 800, fontSize: '0.95rem' }}>
                <MapPin size={18} />
                <span>{lang === 'mr' ? '३. पत्ता व पालक संपर्क' : '3. Residential & Guardian Info'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>{lang === 'mr' ? 'पत्ता' : 'Address'}: </span><strong>{student?.address || '—'}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>{lang === 'mr' ? 'गाव / शहर' : 'City / State'}: </span><strong>{student?.city || '—'}, {student?.state || 'Maharashtra'} - {student?.pincode || '—'}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>{lang === 'mr' ? 'पालकांचे नाव' : 'Parent Name'}: </span><strong>{student?.parentName || '—'}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>{lang === 'mr' ? 'पालक मोबाईल' : 'Parent Mobile'}: </span><strong>{student?.parentMobile || '—'}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>{lang === 'mr' ? 'आपत्कालीन संपर्क' : 'Emergency Contact'}: </span><strong>{student?.emergencyContact || '—'}</strong></div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Status Summary Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Application Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {lang === 'mr' ? 'वसतिगृह प्रवेश अर्ज' : 'HOSTEL APPLICATION'}
            </span>
            <FileText size={20} color="var(--primary)" />
          </div>
          {application ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <StatusBadge status={application.status} />
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.5rem' }}>
                {application.hostel?.hostelName || 'Hostel'}
              </div>
              <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
                {lang === 'mr' ? 'अर्ज तारीख' : 'Applied on'}: {new Date(application.applicationDate).toLocaleDateString()}
              </div>
              {application.status === 'REJECTED' && (
                <div style={{ marginTop: '0.75rem', padding: '0.5rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: '6px', fontSize: '0.8rem' }}>
                  {t('rejectionReason')}: {application.rejectionReason}
                </div>
              )}
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                {lang === 'mr' ? 'आपण अद्याप वसतिगृह अर्ज भरलेला नाही.' : 'You have not submitted a hostel application yet.'}
              </p>
              <Link to="/student/apply" className="btn btn-primary btn-sm">
                {t('applyNow')}
              </Link>
            </div>
          )}
        </div>

        {/* Room & Bed Allocation Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {lang === 'mr' ? 'खोली व खाट वाटप' : 'ROOM ALLOCATION'}
            </span>
            <Bed size={20} color="#0284c7" />
          </div>
          {allocation ? (
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>
                {lang === 'mr' ? 'खोली क्र.' : 'Room'} {allocation.room?.roomNumber || '—'}
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0284c7' }}>
                {lang === 'mr' ? 'खाट क्र.' : 'Bed'}: {allocation.bed?.bedNumber || '—'} ({t('floorNumber')} {allocation.room?.floor ?? '—'})
              </div>
              <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {lang === 'mr' ? 'वाटप अधिकारी' : 'Allocated by'}: {allocation.allocatedBy || 'Warden'}
              </div>
              <Link to="/student/allocation" className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }}>
                {t('myRoomBed')}
              </Link>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {application?.status === 'APPROVED' 
                  ? (lang === 'mr' ? 'अर्ज मंजूर झाला आहे! वॉर्डन खोली वाटप करत आहेत.' : 'Your application is approved! Warden room allocation is currently in progress.')
                  : (lang === 'mr' ? 'वॉर्डन यांच्या मंजुरीनंतर खोली व खाट वाटप केली जाईल.' : 'Room allocation will be unlocked after your application is approved by the Warden.')}
              </p>
            </div>
          )}
        </div>

        {/* Payment Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {lang === 'mr' ? 'प्रवेश शुल्क भरणा' : 'ADMISSION FEE'}
            </span>
            <CreditCard size={20} color="#10b981" />
          </div>
          {hasSuccessfulPayment ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)', fontWeight: 800, fontSize: '1.25rem' }}>
                <CheckCircle size={22} />
                <span>₹{Number(latestPayment?.amount || 15000).toLocaleString('en-IN')} {lang === 'mr' ? 'जमा' : 'PAID'}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                {t('receiptNo')}: {latestPayment?.receiptNumber}
              </div>
              <Link to={`/student/receipt/${latestPayment?.receiptNumber}`} className="btn btn-outline btn-sm" style={{ marginTop: '0.85rem' }}>
                <Download size={14} />
                <span>{t('printReceipt')}</span>
              </Link>
            </div>
          ) : allocation ? (
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                ₹१५,००० {lang === 'mr' ? 'बाकी' : 'Pending'}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                {lang === 'mr' ? 'खोली वाटप झाली आहे! प्रवेश अंतिम करण्यासाठी ऑनलाईन फी भरा.' : 'Room allocated! Complete online fee payment to finalize admission.'}
              </p>
              <Link to="/student/payment" className="btn btn-success btn-sm">
                {t('payNow')}
              </Link>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {lang === 'mr' ? 'खोली व खाट वाटपानंतर ऑनलाईन फी भरणा सुरू होईल.' : 'Fee payment portal will open immediately after room & bed allocation.'}
              </p>
            </div>
          )}
        </div>

        {/* 🛠️ Grievances & Complaints Card */}
        <div className="card" style={{ borderTop: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {lang === 'mr' ? 'तक्रारी व दुरुस्ती निवारण' : 'GRIEVANCES & COMPLAINTS'}
            </span>
            <AlertTriangle size={20} color="#f59e0b" />
          </div>

          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>
              {complaints.length > 0 ? (
                <span>
                  {complaints.filter(c => c.status !== 'RESOLVED').length}{' '}
                  <span style={{ fontSize: '0.9rem', color: '#b45309', fontWeight: 700 }}>
                    {lang === 'mr' ? 'सक्रिय तक्रारी' : 'Active Issues'}
                  </span>
                </span>
              ) : (
                <span style={{ fontSize: '1.15rem', color: '#10b981' }}>
                  {lang === 'mr' ? 'कोणतीही तक्रार नाही' : 'No Issues'}
                </span>
              )}
            </div>

            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
              {complaints.length > 0
                ? (lang === 'mr' 
                    ? `एकूण ${complaints.length} तक्रारी नोंदविल्या आहेत (निवारण: ${complaints.filter(c => c.status === 'RESOLVED').length}).`
                    : `${complaints.length} total logged (${complaints.filter(c => c.status === 'RESOLVED').length} resolved by warden).`)
                : (lang === 'mr'
                    ? 'खोलीतील वीज, पाणी किंवा इतर समस्यांसाठी वॉर्डन यांच्याकडे तक्रार नोंदवा.'
                    : 'Report electrical, plumbing, or facility issues directly to your hostel warden.')}
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Link to="/student/complaints" className="btn btn-outline btn-sm">
                <span>{lang === 'mr' ? 'तक्रारी पहा' : 'View Complaints'}</span>
              </Link>
              <Link 
                to="/student/complaints" 
                className="btn btn-sm"
                style={{ backgroundColor: '#f59e0b', color: '#000', fontWeight: 700, border: 'none' }}
              >
                <span>{lang === 'mr' ? '+ तक्रार नोंदवा' : '+ Lodge Complaint'}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Application Status Timeline */}
      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem' }}>
          {lang === 'mr' ? 'ऑनलाईन प्रवेश प्रक्रिया प्रगती टप्पे' : 'Hostel Admission Journey'}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { 
              label: t('step1'), 
              done: true, 
              desc: lang === 'mr' ? 'महाविद्यालयीन पोर्टलवर विद्यार्थी प्रोफाईल तयार झाले.' : 'Profile created in college portal' 
            },
            { 
              label: t('step2'), 
              done: !!application, 
              desc: application ? (lang === 'mr' ? `${application.hostel?.hostelName || 'वसतिगृह'} साठी अर्ज सादर` : `Submitted for ${application.hostel?.hostelName || 'Hostel'}`) : (lang === 'mr' ? 'अर्ज सादर करणे बाकी' : 'Pending submission') 
            },
            { 
              label: t('step4'), 
              done: application?.status === 'APPROVED', 
              desc: application?.status === 'APPROVED' ? (lang === 'mr' ? `${application.approvedBy || 'वॉर्डन'} यांनी अर्ज मंजूर केला.` : `Approved by ${application.approvedBy || 'Warden'}`) : application?.status === 'REJECTED' ? `${t('rejectionReason')}: ${application.rejectionReason || 'Not specified'}` : (lang === 'mr' ? 'पडताळणी प्रगतीपथावर आहे' : 'In progress') 
            },
            { 
              label: t('step5'), 
              done: !!allocation, 
              desc: allocation ? `${lang === 'mr' ? 'खोली' : 'Room'} ${allocation.room?.roomNumber || '—'} - ${lang === 'mr' ? 'खाट' : 'Bed'} ${allocation.bed?.bedNumber || '—'}` : (lang === 'mr' ? 'वाटपाची वाट पहात आहे' : 'Awaiting allocation') 
            },
            { 
              label: t('step6'), 
              done: hasSuccessfulPayment, 
              desc: hasSuccessfulPayment ? (lang === 'mr' ? `शुल्क यशस्वी जमा (पावती: ${latestPayment?.receiptNumber || 'पावती'})` : `Completed (Receipt: ${latestPayment?.receiptNumber || 'N/A'})`) : (lang === 'mr' ? 'शुल्क भरणे बाकी' : 'Pending') 
            },
            { 
              label: t('step7'), 
              done: hasSuccessfulPayment && !!allocation, 
              desc: hasSuccessfulPayment && !!allocation ? (lang === 'mr' ? 'प्रवेश निश्चित झाला! वॉर्डन कार्यालयातून खोलीच्या चाव्या घ्या.' : 'Admission confirmed! Collect room keys from Warden.') : (lang === 'mr' ? 'मागील टप्पे पूर्ण करा' : 'Pending steps') 
            },
          ].map((st, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: st.done ? 'var(--success)' : '#e2e8f0',
                color: st.done ? 'white' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontWeight: 700,
                fontSize: '0.85rem'
              }}>
                {st.done ? '✓' : i + 1}
              </div>
              <div style={{ flex: 1, paddingBottom: i !== 5 ? '1rem' : 0, borderBottom: i !== 5 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: st.done ? 'var(--text-main)' : 'var(--text-muted)' }}>
                  {st.label}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {st.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
