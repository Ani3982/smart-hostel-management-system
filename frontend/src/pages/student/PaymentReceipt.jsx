import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { paymentService } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Printer, Download, CheckCircle, ArrowLeft, Mail, ShieldCheck } from 'lucide-react';

export const PaymentReceipt = () => {
  const { receiptNumber } = useParams();
  const { t, lang } = useLanguage();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailNotice, setEmailNotice] = useState('');

  useEffect(() => {
    loadReceipt();
  }, [receiptNumber]);

  const loadReceipt = async () => {
    try {
      setLoading(true);
      const res = await paymentService.getReceipt(receiptNumber);
      if (res.data.success) {
        setPayment(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError(lang === 'mr' ? 'पावती सापडली नाही: ' + receiptNumber : 'Could not locate payment receipt: ' + receiptNumber);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner fullScreen message={lang === 'mr' ? 'अधिकृत पावती तयार होत आहे...' : 'Generating official receipt...'} />;
  }

  if (error || !payment) {
    return (
      <div className="card" style={{ maxWidth: '550px', margin: '3rem auto', textAlign: 'center', padding: '2rem' }}>
        <h3 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>
          {lang === 'mr' ? 'पावती उपलब्ध नाही' : 'Receipt Not Found'}
        </h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
        <Link to="/student" className="btn btn-outline">{t('backToDashboard')}</Link>
      </div>
    );
  }

  const handleSendEmail = async () => {
    try {
      setSendingEmail(true);
      const res = await paymentService.sendConfirmationEmail(payment.receiptNumber);
      if (res.data.success) {
        setEmailNotice(`✓ Official admission confirmation email sent to ${payment.student?.email}!`);
        setTimeout(() => setEmailNotice(''), 6000);
      }
    } catch (err) {
      setEmailNotice(`Failed to send email: ${err.response?.data?.message || err.message}`);
      setTimeout(() => setEmailNotice(''), 6000);
    } finally {
      setSendingEmail(false);
    }
  };

  const student = payment.student;
  const application = payment.application;

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Action Bar (hidden on print) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <Link to="/student" className="btn btn-outline btn-sm">
          <ArrowLeft size={16} />
          <span>{t('backToDashboard')}</span>
        </Link>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            onClick={handleSendEmail} 
            disabled={sendingEmail} 
            className="btn btn-sm"
            style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontWeight: 700 }}
            title="Send official confirmation email to student"
          >
            <Mail size={16} />
            <span>{sendingEmail ? 'Sending Email...' : 'Email to Student'}</span>
          </button>
          <button onClick={handlePrint} className="btn btn-primary btn-sm">
            <Printer size={16} />
            <span>{t('printReceipt')}</span>
          </button>
          <button onClick={handlePrint} className="btn btn-secondary btn-sm">
            <Download size={16} />
            <span>{t('downloadReceipt')}</span>
          </button>
        </div>
      </div>

      {emailNotice && (
        <div className="no-print" style={{
          padding: '0.85rem 1.25rem',
          backgroundColor: emailNotice.startsWith('✓') ? '#ecfdf5' : '#fef2f2',
          color: emailNotice.startsWith('✓') ? '#065f46' : '#991b1b',
          borderRadius: '10px',
          border: emailNotice.startsWith('✓') ? '1px solid #a7f3d0' : '1px solid #fecaca',
          fontWeight: 700,
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle size={18} />
          <span>{emailNotice}</span>
        </div>
      )}

      {/* Official Receipt Card */}
      <div className="card print-receipt" style={{
        padding: 'clamp(1.25rem, 3.5vw, 3rem) clamp(0.85rem, 2.5vw, 2.5rem)',
        backgroundColor: '#ffffff',
        border: '2px solid #0f172a',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative'
      }}>
        
        {/* College Masthead Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <img 
              src="/college-logo-transparent.png" 
              alt="NACSC Crest" 
              style={{ width: '56px', height: '56px', objectFit: 'contain' }}
            />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                {t('societyName')}
              </div>
              <h2 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.35rem)', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: '0.15rem 0' }}>
                {t('collegeAutonomous')}
              </h2>
              <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 800 }}>
                ॥ {t('collegeMotto')} ॥
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {t('collegeSub')}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
            {t('cityAddress')}
          </div>

          <div style={{
            display: 'inline-block',
            backgroundColor: '#0f172a',
            color: 'white',
            fontWeight: 800,
            fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)',
            padding: '0.35rem clamp(0.75rem, 2vw, 1.5rem)',
            borderRadius: '9999px',
            marginTop: '0.85rem',
            letterSpacing: '0.04em'
          }}>
            {lang === 'mr' ? 'वसतिगृह प्रवेश व निवास शुल्क अधिकृत पावती' : 'OFFICIAL HOSTEL ADMISSION & RESIDENTIAL FEE RECEIPT'}
          </div>
        </div>

        {/* Receipt Meta */}
        <div className="responsive-grid-2" style={{
          backgroundColor: '#f8fafc',
          padding: '1rem',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          marginBottom: '1.5rem',
          fontSize: '0.85rem'
        }}>
          <div>
            <span style={{ color: '#64748b' }}>{t('receiptNo')}: </span>
            <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{payment.receiptNumber}</strong>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>{t('paymentDate')}: </span>
            <strong>{new Date(payment.paymentDate).toLocaleString()}</strong>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>{t('txnId')}: </span>
            <strong style={{ fontFamily: 'monospace' }}>{payment.transactionId}</strong>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>{lang === 'mr' ? 'शुल्क भरणा स्थिती' : 'Payment Status'}: </span>
            <span style={{
              backgroundColor: '#ecfdf5',
              color: '#047857',
              padding: '0.2rem 0.6rem',
              borderRadius: '4px',
              fontWeight: 800,
              fontSize: '0.75rem'
            }}>
              ✓ {t('SUCCESS')}
            </span>
          </div>
        </div>

        {/* Student & Hostel Particulars Table */}
        <div style={{ marginBottom: '2rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.65rem 0', color: '#64748b', width: '38%' }}>{t('fullName')}</td>
                <td style={{ padding: '0.65rem 0', fontWeight: 800, color: '#0f172a' }}>{student?.fullName}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.65rem 0', color: '#64748b' }}>{t('studentId')}</td>
                <td style={{ padding: '0.65rem 0', fontWeight: 700 }}>{student?.studentId}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.65rem 0', color: '#64748b' }}>{lang === 'mr' ? 'अभ्यासक्रम व वर्ष' : 'Course & Academic Year'}</td>
                <td style={{ padding: '0.65rem 0', fontWeight: 600 }}>{student?.course} ({student?.academicYear})</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.65rem 0', color: '#64748b' }}>{lang === 'mr' ? 'प्रवेशित वसतिगृह' : 'Allocated Hostel'}</td>
                <td style={{ padding: '0.65rem 0', fontWeight: 800, color: '#1b3b6f' }}>
                  {application?.hostel?.hostelName || (application?.hostel?.hostelType === 'BOYS' ? t('boysHostel') : t('girlsHostel'))}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.65rem 0', color: '#64748b' }}>{t('paymentMethod')}</td>
                <td style={{ padding: '0.65rem 0', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{payment.paymentMethod ? (payment.paymentMethod.startsWith('RAZORPAY') ? `Razorpay (${payment.paymentMethod.replace('RAZORPAY_', '').replace('_', ' ') || 'Secure'})` : payment.paymentMethod) : 'Razorpay Gateway'}</span>
                  <span style={{ fontSize: '0.72rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 800 }}>Razorpay Verified</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Fee Particulars */}
        <div style={{ border: '1px solid #0f172a', borderRadius: '10px', overflow: 'hidden', marginBottom: '2.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #0f172a' }}>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 800 }}>#</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 800 }}>{lang === 'mr' ? 'शुल्क तपशील' : 'Fee Description'}</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 800 }}>{lang === 'mr' ? 'रक्कम (₹)' : 'Amount (INR)'}</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.75rem 1rem' }}>1</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  {lang === 'mr' ? 'वार्षिक वसतिगृह खोली भाडे व देखभाल शुल्क' : 'Annual Hostel Room Rent & Maintenance'}
                </td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>₹10,000.00</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.75rem 1rem' }}>2</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  {lang === 'mr' ? 'पाणी, वीज, सौर हीटिंग व हाय-स्पीड इंटरनेट शुल्क' : 'Water, Electricity, Solar Heating & Campus Wi-Fi Charges'}
                </td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>₹3,000.00</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.75rem 1rem' }}>3</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  {lang === 'mr' ? 'वसतिगृह सुरक्षा ठेव व विद्यार्थी कल्याण निधी' : 'Hostel Caution Deposit & Student Welfare Fund'}
                </td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>₹2,000.00</td>
              </tr>
              <tr style={{ backgroundColor: '#f8fafc', fontWeight: 900 }}>
                <td colSpan={2} style={{ padding: '0.85rem 1rem', textAlign: 'right', fontSize: '1.05rem' }}>
                  {lang === 'mr' ? 'एकूण जमा शुल्क:' : 'TOTAL AMOUNT PAID:'}
                </td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontSize: '1.25rem', color: '#047857' }}>
                  ₹{Number(payment.amount || 15000).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Signatures & Seal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '1.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              border: '2px dashed #0284c7',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0284c7',
              fontSize: '0.625rem',
              fontWeight: 800,
              margin: '0 auto 0.5rem auto'
            }}>
              <span>NACSC</span>
              <span>HOSTEL</span>
              <span>SEAL</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {lang === 'mr' ? 'संगणकीय पडताळणी पावती' : 'System Verified Receipt'}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '190px', borderBottom: '1px solid #0f172a', marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>
              {lang === 'mr' ? 'वसतिगृह रेक्टर / वॉर्डन' : 'Hostel Rector / Warden'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {t('collegeName')}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          .no-print, header, .app-sidebar { display: none !important; }
          .print-receipt { border: none !important; box-shadow: none !important; padding: 0 !important; }
        }
      `}</style>
    </div>
  );
};
