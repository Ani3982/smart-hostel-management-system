import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Building2, 
  UserPlus, 
  AlertCircle, 
  CheckCircle, 
  User, 
  GraduationCap, 
  Users as ParentIcon, 
  ShieldAlert,
  ArrowRight,
  LogIn,
  Sparkles,
  Key,
  Mail,
  Copy,
  Check,
  ShieldCheck,
  Award
} from 'lucide-react';

export const Register = () => {
  const { register, login } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [registeredInfo, setRegisteredInfo] = useState(null);
  const [directLoginLoading, setDirectLoginLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    // Personal
    fullName: '',
    dob: '',
    gender: 'MALE',
    mobile: '',
    email: '',
    address: '',
    city: 'Ahilyanagar',
    state: 'Maharashtra',
    pincode: '414001',
    // Academic
    collegeName: 'New Arts, Commerce and Science College, Ahilyanagar (Autonomous)',
    course: 'M.Sc. Computer Science',
    department: 'Computer Science',
    academicYear: 'First Year (2026-27)',
    rollNumber: '',
    studentId: '',
    // Parent
    parentName: '',
    parentMobile: '',
    emergencyContact: '',
    // Hostel
    hostelType: 'BOYS',
    preferredRoomType: 'Standard 4-Sharing',
    // Password
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenderChange = (newGender) => {
    // Strict gender rule: Male -> BOYS, Female -> GIRLS
    const defaultHostel = newGender === 'MALE' ? 'BOYS' : 'GIRLS';
    setFormData(prev => ({
      ...prev,
      gender: newGender,
      hostelType: defaultHostel
    }));
  };

  const [isOtherCourse, setIsOtherCourse] = useState(false);
  const [customCourse, setCustomCourse] = useState('');

  const handleCourseChange = (e) => {
    const val = e.target.value;
    if (val === 'Other') {
      setIsOtherCourse(true);
      setFormData(prev => ({ ...prev, course: customCourse.trim() || 'Other' }));
    } else {
      setIsOtherCourse(false);
      // Auto-suggest department based on selected course
      let autoDept = formData.department;
      if (val.includes('Computer Science') || val.includes('B.C.A.') || val.includes('M.C.A.')) {
        autoDept = 'Computer Science';
      } else if (val.includes('Information Technology')) {
        autoDept = 'Information Technology';
      } else if (val.includes('Data Science')) {
        autoDept = 'Data Science';
      } else if (val.includes('Chemistry')) {
        autoDept = 'Chemistry';
      } else if (val.includes('Physics')) {
        autoDept = 'Physics';
      } else if (val.includes('Mathematics')) {
        autoDept = 'Mathematics';
      } else if (val.includes('Statistics')) {
        autoDept = 'Statistics';
      } else if (val.includes('Botany')) {
        autoDept = 'Botany';
      } else if (val.includes('Zoology')) {
        autoDept = 'Zoology';
      } else if (val.includes('Microbiology')) {
        autoDept = 'Microbiology';
      } else if (val.includes('Biotechnology')) {
        autoDept = 'Biotechnology';
      } else if (val.includes('Environmental')) {
        autoDept = 'Environmental Science';
      } else if (val.includes('Electronic')) {
        autoDept = 'Electronic Science';
      } else if (val.includes('Wine Brewing')) {
        autoDept = 'Wine Brewing & Technology';
      } else if (val.includes('Commerce') || val.includes('B.Com') || val.includes('M.Com') || val.includes('B.B.A')) {
        autoDept = 'Commerce & Management';
      } else if (val.includes('English')) {
        autoDept = 'English';
      } else if (val.includes('Marathi')) {
        autoDept = 'Marathi';
      } else if (val.includes('Hindi')) {
        autoDept = 'Hindi';
      } else if (val.includes('Economics')) {
        autoDept = 'Economics';
      } else if (val.includes('History')) {
        autoDept = 'History';
      } else if (val.includes('Political')) {
        autoDept = 'Political Science';
      } else if (val.includes('Geography')) {
        autoDept = 'Geography';
      } else if (val.includes('Psychology')) {
        autoDept = 'Psychology';
      } else if (val.includes('Sociology')) {
        autoDept = 'Sociology';
      } else if (val.includes('Philosophy')) {
        autoDept = 'Philosophy';
      } else if (val.includes('Social Work') || val.includes('S.W.')) {
        autoDept = 'Social Work';
      } else if (val.includes('Journalism') || val.includes('J.M.C.')) {
        autoDept = 'Journalism & Mass Communication';
      } else if (val.includes('Library') || val.includes('Lib.I.Sc.')) {
        autoDept = 'Library & Information Science';
      } else if (val.includes('B.A.') || val.includes('M.A.')) {
        autoDept = 'Arts';
      } else if (val.includes('B.Sc.') || val.includes('M.Sc.')) {
        autoDept = 'Science';
      }

      setFormData(prev => ({
        ...prev,
        course: val,
        department: autoDept
      }));
    }
  };

  const handleCustomCourseChange = (e) => {
    const val = e.target.value;
    setCustomCourse(val);
    setFormData(prev => ({ ...prev, course: val }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Degree validation if 'Other' is selected
    const finalCourse = isOtherCourse ? customCourse.trim() : formData.course;
    if (!finalCourse || finalCourse === 'Other') {
      setError(lang === 'mr' ? 'कृपया आपला अभ्यासक्रम / पदवी नाव प्रविष्ट करा' : 'Please specify your Course / Degree name');
      return;
    }

    // Client-side validations
    if (formData.password !== formData.confirmPassword) {
      setError(lang === 'mr' ? 'पासवर्ड आणि खात्री पासवर्ड जुळत नाहीत' : 'Password and confirm password do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError(lang === 'mr' ? 'पासवर्ड किमान ६ अक्षरांचा असावा' : 'Password must be at least 6 characters long');
      return;
    }
    if (formData.gender === 'MALE' && formData.hostelType !== 'BOYS') {
      setError(lang === 'mr' ? 'मुले केवळ मुलांच्या वसतिगृहासाठीच अर्ज करू शकतात' : 'Male students can only apply to Boys Hostel');
      return;
    }
    if (formData.gender === 'FEMALE' && formData.hostelType !== 'GIRLS') {
      setError(lang === 'mr' ? 'मुली केवळ मुलींच्या वसतिगृहासाठीच अर्ज करू शकतात' : 'Female students can only apply to Girls Hostel');
      return;
    }

    setLoading(true);
    try {
      const submissionData = {
        ...formData,
        course: finalCourse
      };
      const res = await register(submissionData, false);
      const studentId = res?.studentCustomId || res?.studentId || submissionData.studentId || `NACSC-2026-${Math.floor(100 + Math.random() * 900)}`;
      setRegisteredInfo({
        fullName: submissionData.fullName,
        email: submissionData.email,
        studentId: studentId,
        course: submissionData.course,
        department: submissionData.department,
        academicYear: submissionData.academicYear,
        hostelType: submissionData.hostelType,
        gender: submissionData.gender,
        password: submissionData.password
      });
      setRegisteredSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.message || err.message || (lang === 'mr' ? 'नोंदणी अयशस्वी झाली' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  // Render on-screen confirmation card when registration is completed
  if (registeredSuccess && registeredInfo) {
    return (
      <div style={{ padding: '2.5rem 1rem', background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '680px', width: '100%', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <img 
              src="/college-logo-transparent.png" 
              alt="NACSC Crest" 
              style={{
                width: '74px',
                height: '74px',
                objectFit: 'contain',
                backgroundColor: 'white',
                borderRadius: '50%',
                padding: '4px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                border: '2px solid #f59e0b',
                margin: '0 auto 0.75rem'
              }}
            />
            <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {t('societyName')}
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--primary)', marginTop: '0.2rem' }}>
              {t('collegeAutonomous')}
            </h2>
            <div style={{ 
              display: 'inline-block', 
              backgroundColor: '#ecfdf5', 
              color: '#047857', 
              border: '1px solid #a7f3d0',
              padding: '0.25rem 0.95rem', 
              borderRadius: '9999px', 
              fontSize: '0.8rem', 
              fontWeight: 800, 
              marginTop: '0.5rem' 
            }}>
              ✓ {lang === 'mr' ? 'प्रवेश नोंदणी पुष्टीकरण' : 'Admission Registration Confirmation'}
            </div>
          </div>

          {/* Success Card */}
          <div className="card" style={{ padding: '2.5rem 2rem', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)' }}>
            
            {/* Celebration Icon */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                backgroundColor: '#ecfdf5',
                border: '3px solid #10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                boxShadow: '0 0 25px rgba(16, 185, 129, 0.25)'
              }}>
                <CheckCircle size={48} color="#059669" />
              </div>

              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#065f46', marginBottom: '0.4rem' }}>
                {lang === 'mr' ? '🎉 तुमची नोंदणी यशस्वीरित्या पूर्ण झाली आहे!' : '🎉 Your Registration is Successfully Completed!'}
              </h2>
              <p style={{ fontSize: '0.95rem', color: '#047857', lineHeight: 1.5, margin: 0 }}>
                {lang === 'mr' 
                  ? 'विद्यार्थी खात्याची नोंदणी महाविद्यालयीन प्रणालीमध्ये नोंदवली गेली आहे. तुम्ही आता दिलेल्या युझरनेम आणि पासवर्डने साइन इन करू शकता.'
                  : 'Your student account has been successfully created. You can now sign in using your registered username and password.'}
              </p>
            </div>

            {/* Details Box */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '12px',
              padding: 'clamp(1rem, 2.5vw, 1.5rem)',
              marginBottom: '1.75rem'
            }}>
              <div style={{ 
                fontSize: '0.8rem', 
                fontWeight: 800, 
                color: 'var(--primary)', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '0.6rem'
              }}>
                <Sparkles size={16} color="#f59e0b" />
                <span>{lang === 'mr' ? 'नोंदणीकृत विद्यार्थी माहिती व लॉगिन तपशील' : 'Registered Student & Login Credentials'}</span>
              </div>

              <div className="form-grid-responsive">
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {lang === 'mr' ? 'विद्यार्थ्याचे नाव' : 'Student Full Name'}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                    {registeredInfo.fullName}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {lang === 'mr' ? 'विद्यार्थी नोंदणी क्र. (PRN)' : 'Student ID / PRN'}
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0284c7', marginTop: '2px', fontFamily: 'monospace' }}>
                    {registeredInfo.studentId}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {lang === 'mr' ? 'लॉगिन युझरनेम (ईमेल)' : 'Login Username (Email)'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {registeredInfo.email}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(registeredInfo.email);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        color: copied ? '#059669' : '#64748b'
                      }}
                      title="Copy Username"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {lang === 'mr' ? 'पासवर्ड' : 'Password'}
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                    •••••••• <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>({lang === 'mr' ? 'नोंदणीवेळी तयार केलेला' : 'Created in form'})</span>
                  </div>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {lang === 'mr' ? 'वसतिगृह व अभ्यासक्रम' : 'Allocated Hostel & Course'}
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                    {registeredInfo.hostelType === 'BOYS' 
                      ? (lang === 'mr' ? 'मुलांचे वसतिगृह (छत्रपती शिवाजी महाराज वसतिगृह)' : 'Boys Hostel (Chhatrapati Shivaji Maharaj Hostel)')
                      : (lang === 'mr' ? 'मुलींचे वसतिगृह (सावित्रीबाई फुले वसतिगृह)' : 'Girls Hostel (Savitribai Phule Hostel)')} • {registeredInfo.course}
                  </div>
                </div>
              </div>
            </div>

            {/* Instruction Notice */}
            <div style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '10px',
              padding: '0.9rem 1.15rem',
              marginBottom: '1.75rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem'
            }}>
              <ShieldCheck size={20} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.85rem', color: '#1e40af', lineHeight: 1.5 }}>
                <strong>{lang === 'mr' ? 'साइन इन सूचना: ' : 'Sign In Notice: '}</strong>
                {lang === 'mr' 
                  ? 'तुमची नोंदणी पूर्ण झाली आहे. आता लॉगिन पानावर जा आणि तुम्ही तयार केलेला युझरनेम (ईमेल) व पासवर्ड वापरून साइन इन करा. साइन इन केल्यावर तुम्ही वसतिगृह अर्ज पाहू शकता व शुल्क भरू शकता.'
                  : 'Your registration is complete. Now proceed to the sign-in page and log in using your registered username (email) and password to access your student portal and track room allocation.'}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.65rem',
                  boxShadow: '0 4px 14px rgba(30, 58, 138, 0.25)'
                }}
                onClick={() => {
                  navigate('/login', {
                    state: {
                      email: registeredInfo.email,
                      password: registeredInfo.password,
                      studentName: registeredInfo.fullName,
                      registered: true
                    }
                  });
                }}
              >
                <LogIn size={20} />
                <span>{lang === 'mr' ? 'नोंदणीकृत माहितीने आता साइन इन करा' : 'Sign In with Registered Username & Password'}</span>
              </button>

              <button
                type="button"
                className="btn btn-outline"
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                disabled={directLoginLoading}
                onClick={async () => {
                  setDirectLoginLoading(true);
                  try {
                    await login(registeredInfo.email, registeredInfo.password);
                    navigate('/student');
                  } catch (err) {
                    navigate('/login', {
                      state: {
                        email: registeredInfo.email,
                        password: registeredInfo.password,
                        studentName: registeredInfo.fullName,
                        registered: true
                      }
                    });
                  } finally {
                    setDirectLoginLoading(false);
                  }
                }}
              >
                <ArrowRight size={18} />
                <span>
                  {directLoginLoading 
                    ? (lang === 'mr' ? 'प्रवेश करत आहे...' : 'Logging In...') 
                    : (lang === 'mr' ? 'थेट १-क्लिक विद्यार्थी पोर्टलवर जा' : 'Direct 1-Click Entry to Student Portal')}
                </span>
              </button>
            </div>

            {/* Register another student link */}
            <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0' }}>
              <button
                type="button"
                onClick={() => {
                  setRegisteredSuccess(false);
                  setRegisteredInfo(null);
                  setIsOtherCourse(false);
                  setCustomCourse('');
                  setFormData({
                    fullName: '',
                    dob: '',
                    gender: 'MALE',
                    mobile: '',
                    email: '',
                    address: '',
                    city: 'Ahilyanagar',
                    state: 'Maharashtra',
                    pincode: '414001',
                    collegeName: 'New Arts, Commerce and Science College, Ahilyanagar (Autonomous)',
                    course: 'M.Sc. Computer Science',
                    department: 'Computer Science',
                    academicYear: 'First Year (2026-27)',
                    rollNumber: '',
                    studentId: '',
                    parentName: '',
                    parentMobile: '',
                    emergencyContact: '',
                    hostelType: 'BOYS',
                    preferredRoomType: 'Standard 4-Sharing',
                    password: '',
                    confirmPassword: ''
                  });
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--secondary)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                + {lang === 'mr' ? 'दुसऱ्या विद्यार्थ्याचा नवीन अर्ज भरा' : 'Register another student'}
              </button>
            </div>

          </div>

        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 'clamp(1.25rem, 3vw, 2.5rem) clamp(0.5rem, 2vw, 1rem)', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        
        {/* Header with Official College Crest */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <img 
              src="/college-logo-transparent.png" 
              alt="NACSC Crest" 
              style={{
                width: '68px',
                height: '68px',
                objectFit: 'contain',
                backgroundColor: 'white',
                borderRadius: '50%',
                padding: '4px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                border: '2px solid #f59e0b'
              }}
            />
          </div>
          <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            {t('societyName')}
          </div>
          <h1 style={{ fontSize: 'clamp(1.25rem, 3.5vw, 1.65rem)', fontWeight: 900, color: 'var(--primary)', marginTop: '0.2rem' }}>
            {t('collegeAutonomous')}
          </h1>
          <div style={{ 
            display: 'inline-block', 
            backgroundColor: 'var(--primary-light)', 
            color: 'var(--primary)', 
            padding: '0.25rem 0.95rem', 
            borderRadius: '9999px', 
            fontSize: '0.8rem', 
            fontWeight: 800, 
            marginTop: '0.5rem' 
          }}>
            {t('hostelSystem')} • {t('register')}
          </div>
        </div>

        <div className="card" style={{ padding: 'clamp(1.25rem, 3vw, 2rem) clamp(0.85rem, 2.5vw, 1.5rem)' }}>
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
              marginBottom: '2rem'
            }}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Section 1: Personal Information */}
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <User size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                  1. {t('personalInfo')}
                </h3>
              </div>

              <div className="form-grid-responsive">
                <div className="form-group">
                  <label className="form-label">{t('fullName')} *</label>
                  <input
                    type="text"
                    className="form-input"
                    name="fullName"
                    placeholder={lang === 'mr' ? 'महाविद्यालयीन ओळखपत्रानुसार पूर्ण नाव' : 'Full name as per college ID'}
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('dob')} *</label>
                  <input
                    type="date"
                    className="form-input"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('gender')} *</label>
                  <select
                    className="form-select"
                    name="gender"
                    value={formData.gender}
                    onChange={(e) => handleGenderChange(e.target.value)}
                    required
                  >
                    <option value="MALE">{lang === 'mr' ? 'पुरुष (Male) ➔ मुलांचे वसतिगृह' : 'Male ➔ Boys Hostel'}</option>
                    <option value="FEMALE">{lang === 'mr' ? 'स्त्री (Female) ➔ मुलींचे वसतिगृह' : 'Female ➔ Girls Hostel'}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('mobile')} *</label>
                  <input
                    type="tel"
                    className="form-input"
                    name="mobile"
                    placeholder={lang === 'mr' ? '१० अंकी मोबाईल क्रमांक' : '10-digit mobile number'}
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('email')} *</label>
                  <input
                    type="email"
                    className="form-input"
                    name="email"
                    placeholder="student@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('address')} *</label>
                  <input
                    type="text"
                    className="form-input"
                    name="address"
                    placeholder={lang === 'mr' ? 'घर क्र., गल्ली, गाव/तालुका' : 'Flat/House No., Village, Taluka'}
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('city')} *</label>
                  <input
                    type="text"
                    className="form-input"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('state')} *</label>
                  <input
                    type="text"
                    className="form-input"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('pincode')} *</label>
                  <input
                    type="text"
                    className="form-input"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Academic Information */}
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <GraduationCap size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                  2. {t('academicInfo')}
                </h3>
              </div>

              <div className="form-grid-responsive">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">{t('collegeNameField')}</label>
                  <input
                    type="text"
                    className="form-input"
                    name="collegeName"
                    value={formData.collegeName}
                    readOnly
                    style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: isOtherCourse ? '1 / -1' : 'auto' }}>
                  <label className="form-label">{t('course')} *</label>
                  <select
                    className="form-select"
                    name="course"
                    value={isOtherCourse ? 'Other' : formData.course}
                    onChange={handleCourseChange}
                    required
                  >
                    <optgroup label="🎓 Master's / Postgraduate Degrees (पदव्युत्तर पदवी - PG)">
                      {/* Science PG */}
                      <option value="M.Sc. Computer Science">M.Sc. Computer Science</option>
                      <option value="M.Sc. Information Technology">M.Sc. Information Technology</option>
                      <option value="M.C.A.">M.C.A. (Master of Computer Applications)</option>
                      <option value="M.Sc. Data Science">M.Sc. Data Science</option>
                      <option value="M.Sc. Analytical Chemistry">M.Sc. Analytical Chemistry</option>
                      <option value="M.Sc. Organic Chemistry">M.Sc. Organic Chemistry</option>
                      <option value="M.Sc. Physical Chemistry">M.Sc. Physical Chemistry</option>
                      <option value="M.Sc. Inorganic Chemistry">M.Sc. Inorganic Chemistry</option>
                      <option value="M.Sc. Chemistry">M.Sc. Chemistry (General)</option>
                      <option value="M.Sc. Physics">M.Sc. Physics</option>
                      <option value="M.Sc. Mathematics">M.Sc. Mathematics</option>
                      <option value="M.Sc. Statistics">M.Sc. Statistics</option>
                      <option value="M.Sc. Botany">M.Sc. Botany</option>
                      <option value="M.Sc. Zoology">M.Sc. Zoology</option>
                      <option value="M.Sc. Microbiology">M.Sc. Microbiology</option>
                      <option value="M.Sc. Biotechnology">M.Sc. Biotechnology</option>
                      <option value="M.Sc. Environmental Science">M.Sc. Environmental Science</option>
                      <option value="M.Sc. Electronic Science">M.Sc. Electronic Science</option>
                      
                      {/* Commerce PG */}
                      <option value="M.Com.">M.Com. (Master of Commerce)</option>
                      <option value="M.Com. Advanced Accountancy & Taxation">M.Com. Advanced Accountancy & Taxation</option>
                      <option value="M.Com. Business Administration">M.Com. Business Administration</option>
                      <option value="M.Com. Banking & Finance">M.Com. Banking & Finance</option>
                      
                      {/* Arts & Social Sciences PG */}
                      <option value="M.A. English">M.A. English</option>
                      <option value="M.A. Marathi">M.A. Marathi</option>
                      <option value="M.A. Hindi">M.A. Hindi</option>
                      <option value="M.A. Economics">M.A. Economics</option>
                      <option value="M.A. History">M.A. History</option>
                      <option value="M.A. Political Science">M.A. Political Science</option>
                      <option value="M.A. Geography">M.A. Geography</option>
                      <option value="M.A. Psychology">M.A. Psychology</option>
                      <option value="M.A. Sociology">M.A. Sociology</option>
                      <option value="M.A. Philosophy">M.A. Philosophy</option>
                      <option value="M.S.W.">M.S.W. (Master of Social Work)</option>
                      <option value="M.J.M.C.">M.J.M.C. (Master of Journalism & Mass Communication)</option>
                      <option value="M.Lib.I.Sc.">M.Lib.I.Sc. (Master of Library & Information Science)</option>
                    </optgroup>

                    <optgroup label="📚 Bachelor's / Graduation Degrees (पदवी - UG)">
                      {/* Science UG */}
                      <option value="B.Sc. Computer Science">B.Sc. Computer Science</option>
                      <option value="B.C.A. (Science)">B.C.A. (Bachelor of Computer Applications / Science)</option>
                      <option value="B.Sc. Information Technology">B.Sc. Information Technology</option>
                      <option value="B.Sc. (General / Plain)">B.Sc. (General / Plain - PCM / CBZ)</option>
                      <option value="B.Sc. Chemistry">B.Sc. Chemistry</option>
                      <option value="B.Sc. Physics">B.Sc. Physics</option>
                      <option value="B.Sc. Mathematics">B.Sc. Mathematics</option>
                      <option value="B.Sc. Statistics">B.Sc. Statistics</option>
                      <option value="B.Sc. Botany">B.Sc. Botany</option>
                      <option value="B.Sc. Zoology">B.Sc. Zoology</option>
                      <option value="B.Sc. Microbiology">B.Sc. Microbiology</option>
                      <option value="B.Sc. Biotechnology">B.Sc. Biotechnology</option>
                      <option value="B.Sc. Electronic Science">B.Sc. Electronic Science</option>
                      <option value="B.Sc. Environmental Science">B.Sc. Environmental Science</option>
                      <option value="B.Sc. Wine Brewing & Technology">B.Sc. Wine Brewing & Technology</option>
                      <option value="B.Voc.">B.Voc. (Bachelor of Vocation)</option>

                      {/* Commerce & Management UG */}
                      <option value="B.Com.">B.Com. (Bachelor of Commerce)</option>
                      <option value="B.Com. Banking & Finance">B.Com. (Banking & Finance)</option>
                      <option value="B.Com. Cost & Works Accounting">B.Com. (Cost & Works Accounting)</option>
                      <option value="B.B.A.">B.B.A. (Bachelor of Business Administration)</option>
                      <option value="B.B.A. (CA)">B.B.A. (Computer Applications - CA)</option>
                      <option value="B.B.A. (IB)">B.B.A. (International Business - IB)</option>

                      {/* Arts & Social Sciences UG */}
                      <option value="B.A.">B.A. (Bachelor of Arts - General)</option>
                      <option value="B.A. English">B.A. English</option>
                      <option value="B.A. Marathi">B.A. Marathi</option>
                      <option value="B.A. Hindi">B.A. Hindi</option>
                      <option value="B.A. Economics">B.A. Economics</option>
                      <option value="B.A. History">B.A. History</option>
                      <option value="B.A. Political Science">B.A. Political Science</option>
                      <option value="B.A. Geography">B.A. Geography</option>
                      <option value="B.A. Psychology">B.A. Psychology</option>
                      <option value="B.A. Sociology">B.A. Sociology</option>
                      <option value="B.A. Philosophy">B.A. Philosophy</option>
                      <option value="B.S.W.">B.S.W. (Bachelor of Social Work)</option>
                      <option value="B.J.M.C.">B.J.M.C. (Bachelor of Journalism & Mass Communication)</option>
                      <option value="B.Lib.I.Sc.">B.Lib.I.Sc. (Bachelor of Library & Information Science)</option>
                    </optgroup>

                    <optgroup label="✨ Other Course / Degree (इतर अभ्यासक्रम)">
                      <option value="Other">Other / इतर (Specify Course Below)</option>
                    </optgroup>
                  </select>

                  {isOtherCourse && (
                    <div style={{ 
                      marginTop: '0.85rem', 
                      padding: '1rem', 
                      background: '#f0fdf4', 
                      borderRadius: '8px', 
                      border: '1.5px solid #22c55e',
                      boxShadow: '0 2px 8px rgba(34, 197, 94, 0.12)'
                    }}>
                      <label className="form-label" style={{ color: '#15803d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                        <span>✏️</span>
                        <span>{lang === 'mr' ? 'इतर पदवी / अभ्यासक्रमाचे नाव प्रविष्ट करा *' : 'Specify Other Course / Degree Name *'}</span>
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder={lang === 'mr' ? 'उदा. B.Sc. Forensic Science, M.A. Sanskrit, इत्यादी' : 'e.g. B.Sc. Forensic Science, M.A. Sanskrit, etc.'}
                        value={customCourse}
                        onChange={handleCustomCourseChange}
                        required
                        style={{
                          backgroundColor: '#ffffff',
                          borderColor: '#22c55e',
                          fontWeight: 600,
                          boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.2)'
                        }}
                        autoFocus
                      />
                      <p style={{ color: '#166534', fontSize: '0.75rem', marginTop: '0.35rem', marginBottom: 0 }}>
                        {lang === 'mr'
                          ? '💡 आपल्या कॉलेजमधील अधिकृत अभ्यासक्रम अथवा पदवीचे नाव नमूद करा.'
                          : '💡 Please type the official degree/course title as enrolled in college.'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">{t('department')} *</label>
                  <input
                    type="text"
                    className="form-input"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('academicYear')} *</label>
                  <input
                    type="text"
                    className="form-input"
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('rollNumber')} *</label>
                  <input
                    type="text"
                    className="form-input"
                    name="rollNumber"
                    placeholder="e.g. MCS-45"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('studentId')} *</label>
                  <input
                    type="text"
                    className="form-input"
                    name="studentId"
                    placeholder="e.g. NACSC-2026-105"
                    value={formData.studentId}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Parent / Guardian Information */}
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <ParentIcon size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                  3. {t('parentInfo')}
                </h3>
              </div>

              <div className="form-grid-responsive">
                <div className="form-group">
                  <label className="form-label">{t('parentName')} *</label>
                  <input
                    type="text"
                    className="form-input"
                    name="parentName"
                    placeholder={lang === 'mr' ? 'आई / वडील / पालक यांचे पूर्ण नाव' : 'Father / Mother / Guardian full name'}
                    value={formData.parentName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('parentMobile')} *</label>
                  <input
                    type="tel"
                    className="form-input"
                    name="parentMobile"
                    placeholder={lang === 'mr' ? 'पालकांचा मोबाईल क्रमांक' : 'Parent mobile number'}
                    value={formData.parentMobile}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('emergencyContact')} *</label>
                  <input
                    type="tel"
                    className="form-input"
                    name="emergencyContact"
                    placeholder={lang === 'mr' ? 'आपत्कालीन फोन क्रमांक' : 'Emergency phone number'}
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Hostel Selection (Validated against Gender) */}
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <Building2 size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                  4. {t('hostelPref')}
                </h3>
              </div>

              <div className="form-grid-responsive">
                <div className="form-group">
                  <label className="form-label">{t('selectHostel')} *</label>
                  <select
                    className="form-select"
                    name="hostelType"
                    value={formData.hostelType}
                    disabled
                    style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', fontWeight: 700 }}
                  >
                    <option value="BOYS">{t('boysHostel')}</option>
                    <option value="GIRLS">{t('girlsHostel')}</option>
                  </select>
                  <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', display: 'block', marginTop: '0.25rem' }}>
                    🔒 {lang === 'mr' 
                        ? `निवडलेल्या लिंगानुसार (${formData.gender === 'MALE' ? 'पुरुष' : 'स्त्री'}) स्वयंचलित सुरक्षित लॉक.` 
                        : `Automatically locked to ${formData.gender === 'MALE' ? 'Boys Hostel' : 'Girls Hostel'} based on selected gender.`}
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('roomPref')}</label>
                  <select
                    className="form-select"
                    name="preferredRoomType"
                    value={formData.preferredRoomType}
                    onChange={handleChange}
                  >
                    <option value="Standard 4-Sharing">Standard 4-Sharing (4 Bed)</option>
                    <option value="Standard 3-Sharing">Standard 3-Sharing (3 Bed)</option>
                    <option value="Twin Sharing">Twin Sharing (2 Bed)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 5: Password */}
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <ShieldAlert size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                  5. {lang === 'mr' ? 'खाते सुरक्षा (पासवर्ड)' : 'Account Security'}
                </h3>
              </div>

              <div className="form-grid-responsive">
                <div className="form-group">
                  <label className="form-label">{t('password')} *</label>
                  <input
                    type="password"
                    className="form-input"
                    name="password"
                    placeholder={lang === 'mr' ? 'किमान ६ अक्षरे' : 'At least 6 characters'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('confirmPassword')} *</label>
                  <input
                    type="password"
                    className="form-input"
                    name="confirmPassword"
                    placeholder={lang === 'mr' ? 'पासवर्ड पुन्हा टाईप करा' : 'Re-type password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem', fontWeight: 700 }}
              disabled={loading}
            >
              <UserPlus size={20} />
              <span>{loading ? (lang === 'mr' ? 'नोंदणी होत आहे...' : 'Submitting Registration...') : t('submitRegistration')}</span>
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>{t('alreadyRegistered')} </span>
            <Link to="/login" style={{ fontWeight: 700, color: 'var(--secondary)' }}>
              {t('login')}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
