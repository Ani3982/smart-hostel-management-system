import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { dashboardService, applicationService } from '../services/api';
import { Modal } from '../components/Modal';
import { 
  Building2, 
  Bed, 
  Users, 
  DoorClosed, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Wifi, 
  Coffee, 
  Sun, 
  Shield, 
  BookOpen, 
  Award,
  Search,
  FileText,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';

export const Home = () => {
  const { t, lang } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Admission Transparency State: FAQ accordion, Transparency Modal, Public Status Modal
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [showTransparencyModal, setShowTransparencyModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Public 5-stage status lookup state
  const [lookupAppId, setLookupAppId] = useState('');
  const [lookupVerifier, setLookupVerifier] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [lookupResult, setLookupResult] = useState(null);

  useEffect(() => {
    loadLiveStats();
  }, []);

  const loadLiveStats = async () => {
    try {
      const res = await dashboardService.getPublicSummary();
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (e) {
      console.warn("Using baseline display stats", e);
      setStats({
        totalHostels: 2,
        totalRooms: 20,
        totalBeds: 80,
        occupiedBeds: 1,
        availableBeds: 79,
        totalStudents: 3
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusLookup = async (e) => {
    e.preventDefault();
    setLookupError('');
    setLookupResult(null);

    if (!lookupAppId.trim() || !lookupVerifier.trim()) {
      setLookupError(
        lang === 'mr'
          ? 'कृपया अर्ज क्रमांक / PRN आणि जन्मतारीख किंवा रोल नंबर प्रविष्ट करा.'
          : 'Please enter Application ID / PRN and Date of Birth or Roll Number.'
      );
      return;
    }

    setLookupLoading(true);
    try {
      const res = await applicationService.checkPublicStatus({
        applicationId: lookupAppId.trim(),
        verifier: lookupVerifier.trim()
      });
      if (res.data.success) {
        setLookupResult(res.data.data);
      }
    } catch (err) {
      setLookupError(
        err.response?.data?.message ||
          (lang === 'mr'
            ? 'अर्ज सापडला नाही. कृपया तपशील तपासा.'
            : 'No matching application found. Please verify your details.')
      );
    } finally {
      setLookupLoading(false);
    }
  };

  const faqItems = lang === 'mr'
    ? [
        {
          q: 'टप्पा २ साठी कोणती आवश्यक कागदपत्रे (Required Documents) लागतात?',
          a: 'ऑनलाईन अर्ज सादर करताना ४ कागदपत्रे अपलोड करणे आवश्यक आहे: (१) विद्यार्थ्याचा पासपोर्ट फोटो (JPG/PNG), (२) महाविद्यालयीन ओळखपत्र (College ID), (३) आधार कार्ड / राष्ट्रीय ओळख पुरावा, आणि (४) चालू शैक्षणिक वर्षाची महाविद्यालय प्रवेश फी पावती. सर्व फाइल्स PDF, JPG किंवा PNG स्वरूपात (कमाल ५ MB) असाव्यात.'
        },
        {
          q: 'वसतिगृहाचे वार्षिक शुल्क ₹१५,००० कसे विभागलेले आहे?',
          a: 'वार्षिक वसतिगृह शुल्क ₹१५,००० मध्ये खालील बाबींचा समावेश आहे: खोली व खाट भाडे (१० महिने) — ₹१०,०००; वीज, सौर गरम पाणी व वाय-फाय — ₹२,५००; सुरक्षा, स्वच्छता व देखभाल — ₹१,५००; परतावा योग्य कॉशन डिपॉझिट — ₹१,०००. (टीप: मेस / भोजन शुल्क स्वतंत्र असून ते या शुल्कात समाविष्ट नाही. वॉर्डनची मंजुरी व खाट वाटप झाल्यानंतरच ऑनलाईन शुल्क भरणा सुरू होतो.)'
        },
        {
          q: 'प्रवेशासाठी पात्रता व खोली वाटपाचे नियम काय आहेत?',
          a: 'अहिल्यानगर येथील न्यू आर्ट्स, कॉमर्स अँड सायन्स कॉलेजमध्ये प्रवेश घेतलेले विद्यार्थीच पात्र आहेत. लिंग पडताळणीनुसार मुलांना फक्त मुलांचे वसतिगृह (छत्रपती शिवाजी महाराज भवन) आणि मुलींना फक्त मुलींचे वसतिगृह (सावित्रीबाई फुले भवन) दिले जाते.'
        }
      ]
    : [
        {
          q: 'What documents are required for Step 2 (Application Submission)?',
          a: 'Applicants must upload 4 supporting documents during Step 2: (1) Student Passport-Size Photo (JPG/PNG), (2) College Identity Card, (3) Aadhaar Card / Government Identity Proof, and (4) Current Year College Admission Fee Receipt. Accepted formats: PDF, JPG, or PNG (max 5 MB each).'
        },
        {
          q: 'What is included in the ₹15,000 / Academic Year fee breakdown?',
          a: 'The ₹15,000 annual hostel fee comprises: Room & Bed Rent (10 Months) — ₹10,000; Electricity, Solar Hot Water & Wi-Fi — ₹2,500; Sanitation & 24/7 Campus Security — ₹1,500; Refundable Caution Deposit — ₹1,000. Clarification: Mess/canteen dining charges are separate and optional. Online fee payment activates only after Warden approval and room/bed allotment.'
        },
        {
          q: 'What are the hostel eligibility and gender-segregation rules?',
          a: 'Only enrolled students of New Arts, Commerce & Science College, Ahilyanagar are eligible. Male students are strictly assigned to Boys Hostel (North Campus) and female students strictly to Girls Hostel (South Campus).'
        }
      ];

  const getStageLabel = (key) => {
    const labels = {
      REGISTRATION: lang === 'mr' ? '१. ऑनलाईन नोंदणी' : '1. Registration',
      APPLICATION: lang === 'mr' ? '२. अर्ज व कागदपत्रे' : '2. Application & Docs',
      WARDEN_REVIEW: lang === 'mr' ? '३. वॉर्डन पडताळणी' : '3. Warden Review',
      ALLOCATION: lang === 'mr' ? '४. खोली व खाट वाटप' : '4. Room & Bed Allotment',
      PAYMENT: lang === 'mr' ? '५. शुल्क भरणा व निश्चिती' : '5. Fee Payment & Confirmed'
    };
    return labels[key] || key;
  };

  const renderStatusLookupPanel = () => (
    <>
      <form onSubmit={handleStatusLookup} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div>
          <label className="form-label">{lang === 'mr' ? 'अर्ज क्रमांक किंवा विद्यार्थी PRN' : 'Application ID or Student PRN'}</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. NACSC-2026-001 or 1"
            value={lookupAppId}
            onChange={(e) => setLookupAppId(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="form-label">{lang === 'mr' ? 'जन्मतारीख (YYYY-MM-DD) किंवा रोल नंबर' : 'Date of Birth (YYYY-MM-DD) or Roll No.'}</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. 2003-05-14 or MCS-24"
            value={lookupVerifier}
            onChange={(e) => setLookupVerifier(e.target.value)}
            required
          />
        </div>

        {lookupError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.65rem', backgroundColor: 'var(--danger-bg)', color: '#b91c1c', borderRadius: '8px', fontSize: '0.82rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{lookupError}</span>
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={lookupLoading} style={{ width: '100%' }}>
          <Search size={16} />
          <span>{lookupLoading ? t('loading') : t('checkAppStatus')}</span>
        </button>
      </form>

      {lookupResult && (
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary)' }}>{lookupResult.studentName}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {lookupResult.applicationCode} • {lookupResult.studentPrn} • {lookupResult.hostelName}
              </div>
            </div>
            <span className={`badge ${lookupResult.status === 'APPROVED' ? 'badge-success' : lookupResult.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
              {t(lookupResult.status)}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {lookupResult.stages.map((st) => {
              const isDone = st.status === 'COMPLETED';
              const isRej = st.status === 'REJECTED';
              const isActive = st.status === 'IN_PROGRESS';
              return (
                <div key={st.step} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  padding: '0.5rem 0.65rem',
                  borderRadius: '8px',
                  backgroundColor: isDone ? '#ecfdf5' : isRej ? '#fef2f2' : isActive ? '#eff6ff' : '#f8fafc',
                  border: `1px solid ${isDone ? '#a7f3d0' : isRej ? '#fecaca' : isActive ? '#bfdbfe' : '#e2e8f0'}`,
                  fontSize: '0.8rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, color: isDone ? '#065f46' : isRej ? '#991b1b' : isActive ? '#1d4ed8' : '#64748b' }}>
                    {isDone ? <CheckCircle2 size={15} /> : isRej ? <XCircle size={15} /> : <Clock size={15} />}
                    <span>{getStageLabel(st.key)}</span>
                  </div>
                  {st.detail && (
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textAlign: 'right' }}>{st.detail}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.25rem', paddingBottom: '4rem' }}>
      
      {/* Hero Section (Compact & Above-the-Fold on Mobile) */}
      <section className="hero-section">
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(2, 132, 199, 0.25) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ maxWidth: '1100px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          
          {/* Official Emblem Logo */}
          <div>
            <div className="hero-crest-wrapper">
              <img 
                src="/college-logo-transparent.png" 
                alt="NACSC Crest" 
                className="hero-crest-img"
              />
            </div>
          </div>

          {/* Society Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            padding: '0.35rem 1rem',
            borderRadius: '9999px',
            fontSize: 'clamp(0.72rem, 1.5vw, 0.85rem)',
            fontWeight: 700,
            marginBottom: '0.75rem',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.25)'
          }}>
            <Sparkles size={15} color="#f59e0b" style={{ flexShrink: 0 }} />
            <span>{t('societyName')}</span>
          </div>

          <h1 className="hero-title">
            {t('collegeAutonomous')}
          </h1>

          <div style={{
            display: 'inline-block',
            color: '#fde68a',
            fontSize: 'clamp(0.85rem, 1.8vw, 1rem)',
            fontWeight: 700,
            marginBottom: '0.75rem',
            letterSpacing: '0.04em'
          }}>
            ॥ {t('collegeMotto')} ॥
          </div>

          <p className="hero-subtitle">
            {t('heroSubtitle')}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-secondary" style={{ padding: '0.75rem 1.6rem', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
              <span>{t('applyNow')}</span>
              <ArrowRight size={17} />
            </Link>

            <Link to="/login" className="btn btn-outline" style={{ padding: '0.75rem 1.6rem', fontSize: '0.95rem', backgroundColor: 'rgba(255,255,255,0.12)', color: 'white', borderColor: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>
              <span>{t('studentLogin')}</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setShowStatusModal(true);
                setLookupError('');
              }}
              className="btn btn-outline"
              style={{
                padding: '0.75rem 1.4rem',
                fontSize: '0.95rem',
                backgroundColor: 'rgba(245, 158, 11, 0.18)',
                color: '#fef3c7',
                borderColor: 'rgba(245, 158, 11, 0.55)',
                whiteSpace: 'nowrap'
              }}
            >
              <Search size={16} />
              <span>{t('checkAppStatus')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Dynamic Live Statistics Section */}
      <section className="container" style={{ marginTop: '-2.5rem' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          padding: 'clamp(1rem, 2.5vw, 2rem)',
          border: '1px solid var(--border)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>
              {t('liveStats')}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {lang === 'mr' 
                ? 'महाविद्यालयीन डेटाबेसवरून थेट संगणकीय गणनेवर आधारित अचूक आकडेवारी' 
                : 'Live real-time data calculated dynamically from college database'}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
            gap: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <Building2 size={28} color="var(--primary)" style={{ margin: '0 auto 0.5rem auto' }} />
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {stats?.totalHostels || 2}
              </div>
              <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)' }}>{t('totalHostels')}</div>
            </div>

            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <DoorClosed size={28} color="#0284c7" style={{ margin: '0 auto 0.5rem auto' }} />
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {stats?.totalRooms || 20}
              </div>
              <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)' }}>{t('totalRooms')}</div>
            </div>

            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <Bed size={28} color="#f59e0b" style={{ margin: '0 auto 0.5rem auto' }} />
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {stats?.totalBeds || 80}
              </div>
              <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)' }}>{t('totalBeds')}</div>
            </div>

            <div style={{ padding: '1rem', background: '#ecfdf5', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
              <CheckCircle2 size={28} color="#10b981" style={{ margin: '0 auto 0.5rem auto' }} />
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#047857' }}>
                {stats?.availableBeds !== undefined ? stats.availableBeds : 79}
              </div>
              <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#047857' }}>{t('availableBeds')}</div>
            </div>

            <div style={{ padding: '1rem', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fde68a' }}>
              <Users size={28} color="#d97706" style={{ margin: '0 auto 0.5rem auto' }} />
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#b45309' }}>
                {stats?.occupiedBeds !== undefined ? stats.occupiedBeds : 1}
              </div>
              <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#b45309' }}>{t('occupiedBeds')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Hostels Overview: Boys and Girls Hostels with Dedicated Routing */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
            {lang === 'mr' ? 'महाविद्यालयीन वसतिगृह निवास व्यवस्था' : 'College Hostels Accommodation'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            {lang === 'mr' 
              ? 'सुरक्षितता, शिस्त आणि अभ्यासासाठी पोषक वातावरण असलेले मुले व मुलींसाठी स्वतंत्र संकुल.' 
              : 'Separate campus facilities designed for safety, comfort, and focused academic excellence.'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.5rem' }}>
          {/* Boys Hostel Card */}
          <div className="card" style={{ padding: '2rem', borderTop: '5px solid #1b3b6f' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1b3b6f' }}>
                <Building2 size={26} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {t('boysHostel')}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {t('northCampus')} • 10 {t('rooms')} • 40 {t('beds')}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {lang === 'mr'
                ? 'हवेशीर ४-विद्यार्थी शेअरिंग खोल्या, स्वतंत्र अभ्यास टेबल, निरंतर सौर गरम पाणी सुविधा, हाय-स्पीड वाय-फाय आणि २४ तास सुरक्षारक्षक व्यवस्था.'
                : 'Equipped with spacious 4-sharing ventilated rooms, dedicated study tables, continuous solar water heating, high-speed campus Wi-Fi, and 24x7 security guard desk.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <CheckCircle2 size={16} color="var(--success)" />
                <span>{lang === 'mr' ? 'रेक्टर: प्रा. सुरेश पाटील (मुलांचे वॉर्डन)' : 'Rector: Prof. Suresh Patil (Boys Warden)'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <CheckCircle2 size={16} color="var(--success)" />
                <span>{lang === 'mr' ? 'पात्रता: कला, वाणिज्य किंवा विज्ञान शाखेतील मुले' : 'Eligibility: Male students enrolled in Arts, Commerce, or Science'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <CheckCircle2 size={16} color="var(--success)" />
                <span>{lang === 'mr' ? 'वसतिगृह शुल्क: ₹१५,००० / शैक्षणिक वर्ष' : 'Hostel Fee: ₹15,000 / Academic Year'}</span>
              </div>
            </div>

            <Link to="/availability/boys" className="btn btn-outline" style={{ width: '100%' }}>
              <span>{lang === 'mr' ? 'मुलांच्या वसतिगृहातील जागा पहा' : 'View Boys Bed Availability'}</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Girls Hostel Card */}
          <div className="card" style={{ padding: '2rem', borderTop: '5px solid #0284c7' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                <Building2 size={26} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0284c7' }}>
                  {t('girlsHostel')}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {t('southCampus')} • 10 {t('rooms')} • 40 {t('beds')}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {lang === 'mr'
                ? 'बायोमेट्रिक हजेरी, पूर्णवेळ महिला रेक्टर, संपूर्ण सीसीटीव्ही निगराणी, वाचनालय कक्ष, स्वच्छ मेस सुविधा आणि आपत्कालीन वैद्यकीय साहाय्य.'
                : 'Features secure biometric access, resident lady warden, comprehensive CCTV surveillance, indoor reading room, hygienic mess facility, and emergency medical tie-up.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <CheckCircle2 size={16} color="var(--success)" />
                <span>{lang === 'mr' ? 'रेक्टर: डॉ. सुनिता देशमुख (मुलींच्या वॉर्डन)' : 'Rector: Dr. Sunita Deshmukh (Girls Warden)'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <CheckCircle2 size={16} color="var(--success)" />
                <span>{lang === 'mr' ? 'पात्रता: कला, वाणिज्य किंवा विज्ञान शाखेतील मुली' : 'Eligibility: Female students enrolled in Arts, Commerce, or Science'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <CheckCircle2 size={16} color="var(--success)" />
                <span>{lang === 'mr' ? 'वसतिगृह शुल्क: ₹१५,००० / शैक्षणिक वर्ष' : 'Hostel Fee: ₹15,000 / Academic Year'}</span>
              </div>
            </div>

            <Link to="/availability/girls" className="btn btn-outline" style={{ width: '100%' }}>
              <span>{lang === 'mr' ? 'मुलींच्या वसतिगृहातील जागा पहा' : 'View Girls Bed Availability'}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Facilities Grid */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary)' }}>
            {lang === 'mr' ? 'वसतिगृहातील प्रमुख सुविधा' : 'Key Amenities & Facilities'}
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1.5rem' }}>
          {[
            { 
              icon: Wifi, 
              title: lang === 'mr' ? 'हाय-स्पीड वाय-फाय' : 'High-Speed Wi-Fi', 
              desc: lang === 'mr' ? 'अभ्यास व संशोधनासाठी अखंड हाय-स्पीड इंटरनेट' : 'Campus-wide fiber internet for research & coursework' 
            },
            { 
              icon: Shield, 
              title: lang === 'mr' ? '२४/७ सुरक्षा व्यवस्था' : '24/7 Campus Security', 
              desc: lang === 'mr' ? 'सीसीटीव्ही निगराणी व प्रशिक्षित सुरक्षा रक्षक' : 'CCTV surveillance & trained security personnel' 
            },
            { 
              icon: Sun, 
              title: lang === 'mr' ? 'सौर गरम पाणी' : 'Solar Hot Water', 
              desc: lang === 'mr' ? 'पर्यावरणपूरक आधुनिक सोलर वॉटर हीटिंग सिस्टीम' : 'Eco-friendly solar water heating systems' 
            },
            { 
              icon: BookOpen, 
              title: lang === 'mr' ? 'अभ्यास कक्ष व ग्रंथालय' : 'Study Halls & Library', 
              desc: lang === 'mr' ? 'शांत व हवेशीर अभ्यास कक्ष रात्री उशिरापर्यंत उपलब्ध' : 'Quiet study zones open till late hours' 
            },
            { 
              icon: Coffee, 
              title: lang === 'mr' ? 'स्वच्छ मेस व कॅन्टीन' : 'Hygienic Mess & Canteen', 
              desc: lang === 'mr' ? 'पौष्टिक आणि चवदार शाकाहारी भोजन' : 'Nutritious vegetarian meals prepared with care' 
            },
            { 
              icon: Award, 
              title: lang === 'mr' ? 'गुणवत्ता-आधारित वाटप' : 'Merit-Based Allocation', 
              desc: lang === 'mr' ? 'महाविद्यालयीन नियमांनुसार पारदर्शक खोली व खाट वाटप' : 'Transparent allocation based on college admission criteria' 
            }
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="card" style={{ textAlign: 'center', padding: '1.75rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}>
                  <Icon size={24} />
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>{f.title}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Admission Workflow Timeline */}
      <section className="container">
        <div className="card" style={{ padding: 'clamp(1.25rem, 3vw, 2.5rem)', background: '#f8fafc' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.65rem)', fontWeight: 800, color: 'var(--primary)' }}>
              {lang === 'mr' ? 'ऑनलाईन वसतिगृह प्रवेश प्रक्रिया' : 'How the Online Admission Process Works'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {lang === 'mr' ? 'नोंदणीपासून ते प्रत्यक्ष खोली ताब्यात घेण्यापर्यंतची ५-टप्पे प्रक्रिया' : 'Simple 5-step digital pipeline from online registration to room handover'}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))',
            gap: '1.25rem',
            textAlign: 'center'
          }}>
            {[
              { num: "01", title: t('step1'), desc: lang === 'mr' ? 'महाविद्यालयीन रोल नं व वैयक्तिक माहितीसह नोंदणी' : 'Register student profile with college PRN & details' },
              { num: "02", title: t('step2'), desc: lang === 'mr' ? 'वसतिगृह अर्ज भरा व आवश्यक कागदपत्रे अपलोड करा' : 'Submit hostel application & upload supporting documents' },
              { num: "03", title: t('step4'), desc: lang === 'mr' ? 'वॉर्डन कागदपत्रे पडताळतात व अर्ज मंजूर करतात' : 'Warden verifies documents & marks application APPROVED' },
              { num: "04", title: t('step5'), desc: lang === 'mr' ? 'उपलब्ध खोली व खाट क्रमांक वाटप केला जातो' : 'Hostel Head assigns available Room & Bed Number' },
              { num: "05", title: t('step6'), desc: lang === 'mr' ? 'ऑनलाईन फी भरा व अधिकृत पावती डाऊनलोड करा' : 'Pay hostel fees online & download official college receipt' },
            ].map((step, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem auto'
                }}>
                  {step.num}
                </div>
                <h5 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.35rem' }}>{step.title}</h5>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{step.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => setShowTransparencyModal(true)}
              className="btn btn-outline"
              style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
            >
              <FileText size={16} />
              <span>{t('docsAndFeesFaq')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowStatusModal(true);
                setLookupError('');
              }}
              className="btn btn-primary"
            >
              <Search size={16} />
              <span>{t('checkAppStatus')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Admission Transparency: Expandable FAQ + Public Status Lookup Card */}
      <section className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left: Expandable FAQ Accordion */}
          <div className="card" style={{ padding: 'clamp(1.25rem, 2.5vw, 1.75rem)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HelpCircle size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {lang === 'mr' ? 'प्रवेश पारदर्शकता व नेहमी विचारले जाणारे प्रश्न' : 'Admission Transparency & FAQ'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTransparencyModal(true)}
                className="btn btn-outline btn-sm"
              >
                <IndianRupee size={14} />
                <span>{lang === 'mr' ? 'संपूर्ण तपशील पहा' : 'Full Fee & Doc Guide'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {faqItems.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="faq-item">
                    <button
                      type="button"
                      className="faq-trigger"
                      onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                      aria-expanded={isOpen}
                    >
                      <span>{item.q}</span>
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    {isOpen && (
                      <div style={{ padding: '0.85rem 1.1rem', fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.6, borderTop: '1px solid var(--border)' }}>
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Public "Check Application Status" Card (No Login Required) */}
          <div className="card" style={{ padding: 'clamp(1.25rem, 2.5vw, 1.75rem)', borderTop: '4px solid #f59e0b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Search size={20} color="#d97706" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                {t('checkAppStatus')}
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              {lang === 'mr'
                ? 'लॉगिन न करता आपला अर्ज क्रमांक / PRN आणि जन्मतारीख किंवा रोल नंबर वापरून ५-टप्पे स्थिती तपासा.'
                : 'Track your 5-stage hostel admission progress without logging in using your Application ID / PRN and DOB or Roll Number.'}
            </p>

            {renderStatusLookupPanel()}
          </div>
        </div>
      </section>

      {/* Modal 1: Required Documents (Step 2) & Fee Breakdown (₹15,000) */}
      <Modal
        isOpen={showTransparencyModal}
        onClose={() => setShowTransparencyModal(false)}
        title={t('docsAndFeesFaq')}
        maxWidth="700px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Step 2 Documents */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <FileText size={18} />
              <span>{lang === 'mr' ? 'टप्पा २: अर्जासोबत अपलोड करावयाची कागदपत्रे' : 'Step 2: Required Documents Checklist'}</span>
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.65rem' }}>
              {[
                { title: t('uploadPhoto'), note: lang === 'mr' ? 'रंगीत पासपोर्ट फोटो (JPG/PNG)' : 'Recent passport photo (JPG/PNG)' },
                { title: t('uploadCollegeId'), note: lang === 'mr' ? 'चालू महाविद्यालयीन ओळखपत्र' : 'Valid College ID Card' },
                { title: t('uploadAadhaar'), note: lang === 'mr' ? 'आधार कार्ड (समोरची व मागील बाजू)' : 'Aadhaar Card / Govt ID Proof' },
                { title: t('uploadAdmission'), note: lang === 'mr' ? 'शैक्षणिक वर्ष २०२६-२७ प्रवेश पावती' : '2026-27 College Admission Receipt' }
              ].map((doc, i) => (
                <div key={i} style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-main)' }}>{i + 1}. {doc.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{doc.note}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ₹15,000 Annual Fee Breakdown */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <IndianRupee size={18} />
              <span>{lang === 'mr' ? 'वसतिगृह वार्षिक शुल्क तपशील (₹१५,००० / शैक्षणिक वर्ष)' : 'Annual Hostel Fee Breakdown (₹15,000 / Academic Year)'}</span>
            </h4>
            <div className="table-container" style={{ marginBottom: '0.65rem' }}>
              <table className="custom-table" style={{ minWidth: '100%' }}>
                <thead>
                  <tr>
                    <th>{lang === 'mr' ? 'शुल्क घटक' : 'Fee Component'}</th>
                    <th style={{ textAlign: 'right' }}>{lang === 'mr' ? 'रक्कम (₹)' : 'Amount (₹)'}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{lang === 'mr' ? 'खोली व खाट निवास भाडे (१० महिने)' : 'Room & Bed Accommodation Rent (10 Months)'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>₹10,000</td>
                  </tr>
                  <tr>
                    <td>{lang === 'mr' ? 'वीज, सौर गरम पाणी व हाय-स्पीड वाय-फाय' : 'Electricity, Solar Hot Water & Campus Wi-Fi'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>₹2,500</td>
                  </tr>
                  <tr>
                    <td>{lang === 'mr' ? 'सुरक्षा व्यवस्था, स्वच्छता व देखभाल' : '24x7 Security, Sanitation & Maintenance'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>₹1,500</td>
                  </tr>
                  <tr>
                    <td>{lang === 'mr' ? 'परतावा योग्य कॉशन डिपॉझिट' : 'Refundable Hostel Caution Deposit'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>₹1,000</td>
                  </tr>
                  <tr style={{ backgroundColor: '#ecfdf5' }}>
                    <td style={{ fontWeight: 800, color: '#065f46' }}>{lang === 'mr' ? 'एकूण वार्षिक वसतिगृह शुल्क' : 'Total Annual Hostel Fee'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 900, color: '#065f46' }}>₹15,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', backgroundColor: '#fffbeb', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #fde68a' }}>
              {lang === 'mr'
                ? 'स्पष्टीकरण: मेस (भोजन) शुल्क स्वतंत्र असून ते या ₹१५,००० शुल्कात समाविष्ट नाही. वॉर्डन मंजुरी आणि खोली वाटपानंतरच ऑनलाईन पेमेंट पोर्टल सुरू होते.'
                : 'Clarification: Mess/dining charges are separate and optional. Online fee payment is enabled only after Warden document verification and bed allotment.'}
            </p>
          </div>
        </div>
      </Modal>

      {/* Modal 2: Public Check Application Status */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title={t('checkAppStatus')}
        maxWidth="560px"
      >
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
          {lang === 'mr'
            ? 'लॉगिन न करता अर्ज क्रमांक / PRN आणि जन्मतारीख (किंवा रोल नंबर) प्रविष्ट करून तुमचा ५-टप्पे प्रवेश अहवाल पहा.'
            : 'Enter your Application ID / PRN and Date of Birth (or College Roll Number) to check your 5-stage progress without logging in.'}
        </p>
        {renderStatusLookupPanel()}
      </Modal>

    </div>
  );
};
