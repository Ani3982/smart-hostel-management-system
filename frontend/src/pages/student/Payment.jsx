import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { applicationService, allocationService, paymentService, studentService } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { 
  Building2, 
  CreditCard, 
  QrCode, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle, 
  Lock, 
  ArrowRight,
  ArrowLeft,
  Smartphone,
  Landmark,
  Wallet,
  Phone,
  Mail,
  Copy,
  Check,
  Sparkles,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const Payment = () => {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [application, setApplication] = useState(null);
  const [allocation, setAllocation] = useState(null);
  const [existingPayment, setExistingPayment] = useState(null);

  // Form Fields matching Razorpay Payment Details Screenshot
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    cityCollege: 'Ahilyanagar / New Arts, Commerce and Science College (Autonomous)',
    domain: '',
    duration: 'Academic Year 2024-25 (Annual Accommodation)',
    amount: 15000
  });

  // Razorpay Modal state
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('UPI'); // 'UPI', 'CARD', 'NETBANKING', 'WALLET'
  const [upiOption, setUpiOption] = useState('QR'); // 'QR', 'VPA'
  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [selectedBank, setSelectedBank] = useState('State Bank of India');
  const [selectedWallet, setSelectedWallet] = useState('phonepe');
  
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const currentUserId = user?.id || user?.userId;
      let studentData = null;

      if (currentUserId) {
        const studentRes = await studentService.getByUserId(currentUserId);
        if (studentRes.data.success) {
          studentData = studentRes.data.data;
          setStudent(studentData);
        }
      }

      const appRes = await applicationService.getMyApplication();
      let appData = null;
      if (appRes.data.success) {
        appData = appRes.data.data;
        setApplication(appData);
      }

      const allocRes = await allocationService.getMyAllocation();
      let allocData = null;
      if (allocRes.data.success) {
        allocData = allocRes.data.data;
        setAllocation(allocData);
      }

      const payRes = await paymentService.getMyPayments();
      if (payRes.data.success && payRes.data.data.length > 0) {
        const successful = payRes.data.data.find(p => p.status === 'SUCCESS');
        if (successful) {
          setExistingPayment(successful);
        }
      }

      // Prepopulate form data with student and allocation details
      const hostelName = allocData?.hostel?.hostelName || appData?.hostel?.hostelName || (studentData?.gender === 'FEMALE' ? 'Girls Hostel (सावित्रीबाई फुले वसतिगृह)' : 'Boys Hostel (छत्रपती शिवाजी महाराज वसतिगृह)');
      const roomBed = allocData?.room?.roomNumber ? `Room ${allocData.room.roomNumber} • Bed ${allocData.bed?.bedNumber || '01'}` : 'Standard 4-Sharing Bed';

      setFormData(prev => ({
        ...prev,
        fullName: studentData?.fullName || user?.name || '',
        email: studentData?.email || user?.email || '',
        phone: studentData?.mobile || '9876543210',
        domain: `${hostelName} (${roomBed})`,
        amount: 15000
      }));

      setCardData(prev => ({
        ...prev,
        name: studentData?.fullName || user?.name || ''
      }));

    } catch (err) {
      console.error('Error loading payment data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenRazorpay = (e) => {
    if (e) e.preventDefault();
    if (!application || !allocation) {
      setError(lang === 'mr' ? 'शुल्क भरण्यापूर्वी अर्ज मंजुरी आणि वॉर्डनकडून खोली वाटप आवश्यक आहे.' : 'Both application approval and room allocation by Warden are required before payment.');
      return;
    }
    if (!formData.fullName || !formData.email || !formData.phone) {
      setError(lang === 'mr' ? 'कृपया सर्व आवश्यक माहिती पूर्ण भरा.' : 'Please fill all required student contact fields.');
      return;
    }
    setError('');
    setShowRazorpayModal(true);
  };

  const handleProcessRazorpayPayment = async (customMethod = null) => {
    setProcessing(true);
    setError('');

    const finalMethod = customMethod || selectedMethod;
    const paymentMethodTag = `RAZORPAY_${finalMethod}`;
    const generatedPaymentId = `pay_rzp_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 7)}`;

    try {
      // 1. Submit payment to backend API
      const payRes = await paymentService.create({
        studentId: student?.id,
        applicationId: application?.id,
        amount: 15000.00,
        paymentMethod: paymentMethodTag,
        razorpayPaymentId: generatedPaymentId,
        razorpayOrderId: `order_rzp_${Date.now().toString(36)}`
      });

      if (payRes.data.success) {
        const createdPayment = payRes.data.data;
        setPaymentSuccess({
          paymentId: generatedPaymentId,
          receiptNumber: createdPayment.receiptNumber,
          amount: 15000.00
        });

        // Auto redirect after 2.8 seconds so student sees confirmation email notice
        setTimeout(() => {
          setShowRazorpayModal(false);
          navigate(`/student/receipt/${createdPayment.receiptNumber}`);
        }, 2800);
      } else {
        setError(payRes.data.message || 'Payment processing failed');
        setProcessing(false);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || err.message || 'Razorpay Gateway communication error.');
      setProcessing(false);
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText('nacsc.hostel@icici');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  if (loading) {
    return <LoadingSpinner fullScreen message={lang === 'mr' ? "रेझरपे पेमेंट गेटवे लोड होत आहे..." : "Loading Razorpay Payment Gateway..."} />;
  }

  if (existingPayment) {
    return (
      <div style={{ maxWidth: '640px', margin: '3rem auto', padding: '0 1rem' }}>
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2.5rem', borderRadius: '20px', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: '#ecfdf5',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <CheckCircle size={44} />
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.3rem 0.8rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 800, marginBottom: '1rem' }}>
            <ShieldCheck size={16} />
            <span>Razorpay Verified Payment</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem' }}>
            {lang === 'mr' ? 'वसतिगृह प्रवेश शुल्क आधीच जमा केले आहे!' : 'Hostel Fee Payment Complete!'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0 auto 1.75rem auto', maxWidth: '480px' }}>
            {lang === 'mr' 
              ? `${application?.hostel?.hostelName || 'वसतिगृह'} साठी आपले ₹१५,००० शुल्क रेझरपेद्वारे यशस्वीरित्या जमा झाले आहे. अधिकृत पावती उपलब्ध आहे.` 
              : `Your hostel fee payment of ₹15,000 for ${application?.hostel?.hostelName || 'Hostel'} has been confirmed via Razorpay. Your room & bed allotment is finalized.`}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate(`/student/receipt/${existingPayment.receiptNumber}`)}
              className="btn btn-primary"
              style={{ padding: '0.85rem 1.75rem', fontSize: '1rem', fontWeight: 800 }}
            >
              {t('downloadReceipt')}
            </button>
            <Link to="/student" className="btn btn-outline" style={{ padding: '0.85rem 1.5rem' }}>
              {t('studentPortal')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!allocation) {
    return (
      <div style={{ maxWidth: '640px', margin: '3rem auto', padding: '0 1rem' }}>
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2.5rem', borderRadius: '20px' }}>
          <AlertCircle size={56} color="var(--warning)" style={{ margin: '0 auto 1.25rem auto' }} />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.75rem' }}>
            {lang === 'mr' ? 'खोली व खाट अद्याप वाटप झालेली नाही' : 'Room & Bed Allocation Pending'}
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '0 auto 1.75rem auto', maxWidth: '480px', lineHeight: 1.6 }}>
            {lang === 'mr' 
              ? 'आपला वसतिगृह अर्ज मंजूर झाल्यानंतर वॉर्डन यांनी प्रत्यक्ष खोली व खाट क्रमांक वाटप केल्यानंतरच रेझरपे (₹१५,०००) शुल्क भरणा सुरू होईल.' 
              : 'The fee payment window will open as soon as your hostel application is approved and the warden assigns your specific room and bed.'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button onClick={() => navigate('/student/status')} className="btn btn-primary">
              {t('applicationStatus')}
            </button>
            <Link to="/student" className="btn btn-outline">
              {t('studentPortal')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '620px', margin: '1.5rem auto 4rem auto', padding: '0 1rem' }}>
      
      {/* 💳 Top Razorpay Payment Details Header matching Screenshot 2 */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px 16px 0 0',
        padding: '1.25rem 1.75rem',
        border: '1px solid #e2e8f0',
        borderBottom: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            type="button"
            onClick={() => navigate(-1)} 
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              padding: '0.4rem', 
              display: 'flex', 
              alignItems: 'center',
              color: '#1b3b6f'
            }}
            title="Back"
          >
            <ArrowLeft size={22} />
          </button>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            {lang === 'mr' ? 'पेमेंट तपशील (Payment Details)' : 'Payment Details'}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Secured by</span>
          <span style={{ fontWeight: 900, color: '#0c2340', fontSize: '1rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <span style={{ color: '#2563eb' }}>/</span>Razorpay
          </span>
        </div>
      </div>

      {/* Progress Line */}
      <div style={{ height: '4px', backgroundColor: '#e2e8f0', width: '100%' }}>
        <div style={{ height: '100%', width: '45%', backgroundColor: '#2563eb' }} />
      </div>

      {/* Main Payment Form Card */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '0 0 16px 16px',
        padding: 'clamp(1.25rem, 3vw, 2rem) clamp(0.85rem, 2.5vw, 1.75rem)',
        border: '1px solid #e2e8f0',
        borderTop: 'none',
        boxShadow: 'var(--shadow-md)'
      }}>

        {error && (
          <div style={{
            padding: '0.85rem 1rem',
            backgroundColor: '#fef2f2',
            color: '#b91c1c',
            borderRadius: '8px',
            fontSize: '0.875rem',
            marginBottom: '1.5rem',
            border: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleOpenRazorpay}>
          {/* Full Name * */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontWeight: 600, color: '#334155', fontSize: '0.875rem' }}>
              Full Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              name="fullName"
              className="form-input"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter full name"
              required
              style={{ borderRadius: '8px', borderColor: '#cbd5e1' }}
            />
          </div>

          {/* Email * */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontWeight: 600, color: '#334155', fontSize: '0.875rem' }}>
              Email <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              required
              style={{ borderRadius: '8px', borderColor: '#cbd5e1' }}
            />
          </div>

          {/* Phone Number * [IN +91] */}
          <div className="form-group" style={{ marginBottom: '0.4rem' }}>
            <label className="form-label" style={{ fontWeight: 600, color: '#334155', fontSize: '0.875rem' }}>
              Phone Number <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '0' }}>
              <div style={{
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRight: 'none',
                borderRadius: '8px 0 0 8px',
                padding: '0.65rem 0.85rem',
                fontSize: '0.875rem',
                fontWeight: 700,
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <span>IN +91</span>
              </div>
              <input
                type="tel"
                name="phone"
                className="form-input"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="10-digit mobile number"
                maxLength={10}
                required
                style={{ borderRadius: '0 8px 8px 0', borderColor: '#cbd5e1', flex: 1 }}
              />
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem', display: 'block' }}>
              Use WhatsApp Number (For Official College Hostel Group & Receipt)
            </span>
          </div>

          {/* City / College * */}
          <div className="form-group" style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontWeight: 600, color: '#334155', fontSize: '0.875rem' }}>
              City / College <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              name="cityCollege"
              className="form-input"
              value={formData.cityCollege}
              onChange={handleInputChange}
              required
              style={{ borderRadius: '8px', borderColor: '#cbd5e1' }}
            />
          </div>

          {/* Select Domain / Hostel Wing * */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontWeight: 600, color: '#334155', fontSize: '0.875rem' }}>
              Hostel Accommodation Wing <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              name="domain"
              className="form-select"
              value={formData.domain}
              onChange={handleInputChange}
              required
              style={{ borderRadius: '8px', borderColor: '#cbd5e1', backgroundColor: '#f8fafc' }}
            >
              <option value={formData.domain}>{formData.domain}</option>
            </select>
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem', display: 'block' }}>
              Allotted by Warden: Room {allocation.room?.roomNumber} • Bed {allocation.bed?.bedNumber}
            </span>
          </div>

          {/* Accommodation Duration * */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontWeight: 600, color: '#334155', fontSize: '0.875rem' }}>
              Academic Duration & Tenure <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              name="duration"
              className="form-input"
              value={formData.duration}
              readOnly
              style={{ borderRadius: '8px', borderColor: '#cbd5e1', backgroundColor: '#f8fafc', color: '#334155' }}
            />
          </div>

          {/* Fee Amount Box matching Screenshot 2 */}
          <div style={{
            marginBottom: '1.75rem',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '0.85rem 1rem',
              borderBottom: '1px solid #e2e8f0',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: '#334155'
            }}>
              Hostel Admission & Accommodation Fees (One Time) Inc. Maintenance & Utilities <span style={{ color: '#ef4444' }}>*</span>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#ffffff' }}>
              <div style={{
                fontSize: '1.65rem',
                fontWeight: 900,
                color: '#0f172a',
                fontFamily: 'system-ui, sans-serif'
              }}>
                ₹ 15,000.00
              </div>
              <p style={{
                fontSize: '0.785rem',
                color: '#64748b',
                marginTop: '0.35rem',
                marginBottom: 0,
                lineHeight: 1.45
              }}>
                covers annual hostel accommodation, room allotment, water, solar heating, electricity, high-speed Wi-Fi, and 24/7 security
              </p>
            </div>
          </div>

          {/* Payment Method Badges (UPI, VISA, RuPay, etc.) matching Screenshot 2 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            padding: '0.75rem 0',
            borderTop: '1px solid #f1f5f9',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 900, fontSize: '0.85rem', color: '#0f766e', letterSpacing: '0.05em' }}>UPI</span>
              <span style={{ fontWeight: 900, fontSize: '0.85rem', color: '#1d4ed8', fontStyle: 'italic' }}>VISA</span>
              <span style={{ fontWeight: 900, fontSize: '0.85rem', color: '#ea580c' }}>Mastercard</span>
              <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0284c7' }}>RuPay▶</span>
              <span style={{ fontSize: '0.7rem', color: '#64748b', border: '1px solid #cbd5e1', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>PCI-DSS</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#0c2340', fontWeight: 800, fontSize: '0.85rem' }}>
              <span style={{ color: '#2563eb' }}>/</span>Razorpay
            </div>
          </div>

          {/* Big Blue Pay Button matching Screenshot 2 */}
          <button
            type="submit"
            className="btn"
            style={{
              width: '100%',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              padding: '1rem',
              fontSize: '1.1rem',
              fontWeight: 800,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              transition: 'background-color 0.2s ease'
            }}
          >
            <span>Pay ₹ 15,000.00</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Razorpay Contact & Terms Section matching Screenshot 1 */}
        <div style={{
          marginTop: '2.5rem',
          paddingTop: '2rem',
          borderTop: '1px solid #e2e8f0',
          fontSize: '0.825rem',
          color: '#475569'
        }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>Connect us on :</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2563eb', fontWeight: 600 }}>
              <Phone size={15} />
              <span>+91 7414974582 / +91 241 2324024</span>
            </div>
            <div style={{ marginTop: '0.35rem' }}>
              <span style={{ fontWeight: 700, color: '#1e293b' }}>LinkedIn / Web : </span>
              <a 
                href="https://www.linkedin.com/company/weinternx/" 
                target="_blank" 
                rel="noreferrer"
                style={{ color: '#2563eb', textDecoration: 'underline' }}
              >
                https://www.linkedin.com/company/weinternx/
              </a>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>Contact Us:</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#334155', marginBottom: '0.25rem' }}>
              <Mail size={15} color="#2563eb" />
              <span>contact@we-intern.in | hostel@newartscollege.ac.in</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#334155' }}>
              <Phone size={15} color="#2563eb" />
              <span>+917414974582</span>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem', backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>Terms & Conditions:</div>
            <p style={{ margin: 0, fontSize: '0.775rem', color: '#64748b', lineHeight: 1.5 }}>
              You agree to share information entered on this page with New Arts, Commerce and Science College, Ahilyanagar (Autonomous) and Razorpay, adhering to applicable laws and collegiate guidelines.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', color: '#94a3b8', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, color: '#0c2340', fontSize: '0.9rem' }}>
              <span style={{ color: '#2563eb' }}>/</span>Razorpay
            </div>
            <div>Want to create page like this? Razorpay Payment Pages</div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 🚀 HIGH-FIDELITY INTERACTIVE RAZORPAY CHECKOUT MODAL                      */}
      {/* ========================================================================= */}
      {showRazorpayModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            width: '100%',
            maxWidth: 'min(96vw, 720px)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '94vh',
            animation: 'modalFadeIn 0.25s ease-out'
          }}>
            
            {/* Razorpay Brand Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0c2340 0%, #1e3a8a 100%)',
              color: '#ffffff',
              padding: '1.25rem 1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '3px'
                }}>
                  <img src="/college-logo-transparent.png" alt="NACSC" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                    New Arts, Commerce and Science College
                  </h3>
                  <div style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '0.15rem' }}>
                    Hostel Admission Fee • Academic Year 2024-25
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.725rem', opacity: 0.8, textTransform: 'uppercase', fontWeight: 600 }}>Amount Payable</div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#38bdf8' }}>₹ 15,000.00</div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRazorpayModal(false)}
                  disabled={processing}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    border: 'none',
                    color: '#ffffff',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Test Simulation Notice & 1-Click Success Demo Button */}
            <div style={{
              backgroundColor: '#ecfdf5',
              borderBottom: '1px solid #a7f3d0',
              padding: '0.65rem 1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#065f46', fontWeight: 700 }}>
                <ShieldCheck size={16} color="#059669" />
                <span>Razorpay Test Gateway Mode (Safe Demo)</span>
              </div>
              
              <button
                type="button"
                onClick={() => handleProcessRazorpayPayment('UPI_1CLICK')}
                disabled={processing}
                style={{
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.775rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Sparkles size={14} />
                <span>⚡ 1-Click Instant Success Demo</span>
              </button>
            </div>

            {/* Success Overlay when payment confirms */}
            {paymentSuccess ? (
              <div style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
                <div style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  backgroundColor: '#ecfdf5',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto'
                }}>
                  <CheckCircle size={44} />
                </div>
                <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#065f46', marginBottom: '0.4rem' }}>
                  Payment of ₹15,000.00 Successful!
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                  Razorpay Transaction ID: <strong style={{ fontFamily: 'monospace', color: '#0f172a' }}>{paymentSuccess.paymentId}</strong>
                </p>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#ecfdf5',
                  color: '#065f46',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #a7f3d0',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  marginBottom: '1.25rem'
                }}>
                  <Mail size={16} />
                  <span>Official admission confirmation email sent to {student?.email || user?.email}!</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#2563eb', fontSize: '0.875rem', fontWeight: 700 }}>
                  <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%' }} />
                  <span>Redirecting to official receipt voucher...</span>
                </div>
              </div>
            ) : processing ? (
              <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <div className="spinner" style={{
                  width: '52px',
                  height: '52px',
                  border: '4px solid #e2e8f0',
                  borderTopColor: '#2563eb',
                  borderRadius: '50%',
                  margin: '0 auto 1.5rem auto'
                }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                  Connecting with Razorpay & Bank...
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                  Please do not refresh or press back button. Processing ₹15,000 fee transaction.
                </p>
              </div>
            ) : (
              /* Modal Body: Two-column Razorpay Payment Options */
              <div className="razorpay-grid" style={{ overflowY: 'auto' }}>
                
                {/* Left Method Tabs */}
                <div className="razorpay-tabs-mobile" style={{ backgroundColor: '#f8fafc', borderRight: '1px solid #e2e8f0', padding: '1rem 0' }}>
                  {[
                    { id: 'UPI', label: 'UPI / QR Code', icon: Smartphone, badge: 'Popular' },
                    { id: 'CARD', label: 'Cards (Debit / Credit)', icon: CreditCard },
                    { id: 'NETBANKING', label: 'Net Banking', icon: Landmark },
                    { id: 'WALLET', label: 'Wallets', icon: Wallet }
                  ].map(m => {
                    const Icon = m.icon;
                    const isActive = selectedMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMethod(m.id)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.85rem 1.25rem',
                          border: 'none',
                          borderLeft: isActive ? '4px solid #2563eb' : '4px solid transparent',
                          backgroundColor: isActive ? '#ffffff' : 'transparent',
                          color: isActive ? '#1d4ed8' : '#334155',
                          fontWeight: isActive ? 800 : 600,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <Icon size={18} color={isActive ? '#2563eb' : '#64748b'} />
                          <span>{m.label}</span>
                        </div>
                        {m.badge && (
                          <span style={{ fontSize: '0.65rem', backgroundColor: '#dbeafe', color: '#1e40af', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 800 }}>
                            {m.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}

                  <div style={{ padding: '1.25rem 1rem', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', fontSize: '0.725rem', color: '#94a3b8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#10b981', fontWeight: 700, marginBottom: '0.25rem' }}>
                      <Lock size={12} />
                      <span>256-Bit SSL Encrypted</span>
                    </div>
                    <span>All major Indian cards and banks supported</span>
                  </div>
                </div>

                {/* Right Tab Content */}
                <div style={{ padding: '1.75rem' }}>
                  
                  {/* TAB 1: UPI */}
                  {selectedMethod === 'UPI' && (
                    <div>
                      {/* Sub-tabs: QR Code vs UPI ID */}
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                        <button
                          type="button"
                          onClick={() => setUpiOption('QR')}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            border: upiOption === 'QR' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                            backgroundColor: upiOption === 'QR' ? '#eff6ff' : '#ffffff',
                            color: upiOption === 'QR' ? '#1d4ed8' : '#475569',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}
                        >
                          Scan QR Code
                        </button>
                        <button
                          type="button"
                          onClick={() => setUpiOption('VPA')}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            border: upiOption === 'VPA' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                            backgroundColor: upiOption === 'VPA' ? '#eff6ff' : '#ffffff',
                            color: upiOption === 'VPA' ? '#1d4ed8' : '#475569',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}
                        >
                          UPI ID / Apps
                        </button>
                      </div>

                      {upiOption === 'QR' ? (
                        <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                          <div style={{
                            width: '180px',
                            height: '180px',
                            backgroundColor: '#ffffff',
                            border: '2px solid #e2e8f0',
                            borderRadius: '12px',
                            margin: '0 auto 1rem auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                            position: 'relative'
                          }}>
                            <QrCode size={145} color="#0c2340" />
                            <div style={{
                              position: 'absolute',
                              bottom: '6px',
                              backgroundColor: '#0c2340',
                              color: '#ffffff',
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px'
                            }}>
                              ₹15,000.00
                            </div>
                          </div>

                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                            Scan and pay with any UPI App
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', fontSize: '0.75rem', color: '#64748b', marginBottom: '1.25rem' }}>
                            <span>Google Pay</span> • <span>PhonePe</span> • <span>Paytm</span> • <span>BHIM</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>UPI VPA: <strong>nacsc.hostel@icici</strong></span>
                            <button
                              type="button"
                              onClick={copyUpiId}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', padding: '0.2rem' }}
                              title="Copy UPI ID"
                            >
                              {copiedUpi ? <Check size={16} color="#059669" /> : <Copy size={16} />}
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleProcessRazorpayPayment('UPI_QR')}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '0.85rem', fontWeight: 800 }}
                          >
                            <span>Simulate Successful QR Payment (₹15,000)</span>
                          </button>
                        </div>
                      ) : (
                        <div>
                          {/* Quick UPI Apps */}
                          <div style={{ marginBottom: '1.25rem' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                              Select UPI App:
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                              {[
                                { id: 'gpay', label: 'Google Pay', color: '#ea4335' },
                                { id: 'phonepe', label: 'PhonePe', color: '#5f259f' },
                                { id: 'paytm', label: 'Paytm UPI', color: '#00b9f5' }
                              ].map(app => (
                                <button
                                  key={app.id}
                                  type="button"
                                  onClick={() => setSelectedUpiApp(app.id)}
                                  style={{
                                    padding: '0.65rem 0.5rem',
                                    borderRadius: '8px',
                                    border: selectedUpiApp === app.id ? `2px solid ${app.color}` : '1px solid #cbd5e1',
                                    backgroundColor: selectedUpiApp === app.id ? '#f8fafc' : '#ffffff',
                                    fontWeight: 700,
                                    fontSize: '0.785rem',
                                    color: selectedUpiApp === app.id ? app.color : '#334155',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {app.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                              Or Enter Your UPI ID / VPA:
                            </label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="e.g. yourname@okhdfcbank"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              style={{ borderRadius: '8px' }}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleProcessRazorpayPayment('UPI_APP')}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '0.85rem', fontWeight: 800 }}
                          >
                            <span>Pay ₹ 15,000.00 via UPI</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: CARDS */}
                  {selectedMethod === 'CARD' && (
                    <div>
                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Card Number</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="4532 8920 1029 8821"
                          maxLength={19}
                          value={cardData.number || '4532 8920 1029 8821'}
                          onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                          style={{ borderRadius: '8px' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Expiry (MM/YY)</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="08/29"
                            maxLength={5}
                            defaultValue="08/29"
                            style={{ borderRadius: '8px' }}
                          />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>CVV / CVC</label>
                          <input
                            type="password"
                            className="form-input"
                            placeholder="•••"
                            maxLength={4}
                            defaultValue="782"
                            style={{ borderRadius: '8px' }}
                          />
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Cardholder Name</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Name as on card"
                          value={cardData.name}
                          onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                          style={{ borderRadius: '8px' }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleProcessRazorpayPayment('CARD')}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.85rem', fontWeight: 800 }}
                      >
                        <span>Pay ₹ 15,000.00 via Card</span>
                      </button>
                    </div>
                  )}

                  {/* TAB 3: NETBANKING */}
                  {selectedMethod === 'NETBANKING' && (
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.75rem' }}>
                        Popular Banks:
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem', marginBottom: '1.25rem' }}>
                        {[
                          'State Bank of India',
                          'HDFC Bank',
                          'ICICI Bank',
                          'Bank of Maharashtra',
                          'Axis Bank',
                          'Bank of Baroda'
                        ].map(b => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setSelectedBank(b)}
                            style={{
                              padding: '0.7rem 0.65rem',
                              borderRadius: '8px',
                              border: selectedBank === b ? '2px solid #2563eb' : '1px solid #cbd5e1',
                              backgroundColor: selectedBank === b ? '#eff6ff' : '#ffffff',
                              color: selectedBank === b ? '#1d4ed8' : '#334155',
                              fontWeight: 700,
                              fontSize: '0.775rem',
                              cursor: 'pointer',
                              textAlign: 'left'
                            }}
                          >
                            {b}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleProcessRazorpayPayment('NETBANKING')}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.85rem', fontWeight: 800 }}
                      >
                        <span>Pay ₹ 15,000.00 via {selectedBank}</span>
                      </button>
                    </div>
                  )}

                  {/* TAB 4: WALLETS */}
                  {selectedMethod === 'WALLET' && (
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.75rem' }}>
                        Select Digital Wallet:
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
                        {[
                          { id: 'phonepe', name: 'PhonePe Wallet' },
                          { id: 'paytm', name: 'Paytm Wallet' },
                          { id: 'mobikwik', name: 'MobiKwik' },
                          { id: 'amazonpay', name: 'Amazon Pay' }
                        ].map(w => (
                          <label
                            key={w.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              padding: '0.75rem 1rem',
                              borderRadius: '8px',
                              border: selectedWallet === w.id ? '2px solid #2563eb' : '1px solid #cbd5e1',
                              backgroundColor: selectedWallet === w.id ? '#eff6ff' : '#ffffff',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: '0.85rem'
                            }}
                          >
                            <input
                              type="radio"
                              name="wallet"
                              checked={selectedWallet === w.id}
                              onChange={() => setSelectedWallet(w.id)}
                            />
                            <span>{w.name}</span>
                          </label>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleProcessRazorpayPayment('WALLET')}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.85rem', fontWeight: 800 }}
                      >
                        <span>Pay ₹ 15,000.00 via Wallet</span>
                      </button>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div style={{
              backgroundColor: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              padding: '0.75rem 1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: '#64748b'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ShieldCheck size={14} color="#10b981" />
                <span>PCI-DSS Level 1 Compliant Payment Gateway</span>
              </div>
              <div>Razorpay Payments Pvt. Ltd.</div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
