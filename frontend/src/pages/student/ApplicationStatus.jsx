import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { applicationService, allocationService, paymentService } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  Building2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  CreditCard,
  Bed
} from 'lucide-react';

export const ApplicationStatus = () => {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [allocation, setAllocation] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
  }, [user]);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const appRes = await applicationService.getMyApplication();
      if (appRes.data.success && appRes.data.data) {
        setApplication(appRes.data.data);
      }

      try {
        const allocRes = await allocationService.getMyAllocation();
        if (allocRes.data.success && allocRes.data.data) {
          setAllocation(allocRes.data.data);
        }
      } catch (e) {}

      try {
        const payRes = await paymentService.getMyPayments();
        if (payRes.data.success && payRes.data.data.length > 0) {
          setPayment(payRes.data.data[0]);
        }
      } catch (e) {}

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message={lang === 'mr' ? "अर्जाची स्थिती तपासत आहे..." : "Checking application status..."} />;
  }

  if (!application) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center', padding: '3rem 2rem' }}>
        <Clock size={50} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
          {lang === 'mr' ? 'कोणताही अर्ज अद्याप सादर केलेला नाही' : 'No Application Submitted Yet'}
        </h2>
        <p style={{ color: 'var(--text-muted)', margin: '0.75rem auto 1.5rem auto' }}>
          {lang === 'mr' 
            ? 'आपण नोंदणी केली आहे, परंतु पडताळणीसाठी वसतिगृह अर्ज व कागदपत्रे सादर करणे आवश्यक आहे.' 
            : 'You have registered, but you need to submit your hostel application and documents to get verified.'}
        </p>
        <Link to="/student/apply" className="btn btn-primary">
          {t('applyNow')}
        </Link>
      </div>
    );
  }

  const isApproved = application.status === 'APPROVED';
  const isRejected = application.status === 'REJECTED';
  const isAllocated = !!allocation;
  const isPaid = payment?.status === 'SUCCESS';

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Top Banner */}
      <div className="card" style={{
        padding: 'clamp(1.25rem, 3vw, 2rem)',
        borderLeft: `6px solid ${isApproved ? 'var(--success)' : isRejected ? 'var(--danger)' : 'var(--warning)'}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <StatusBadge status={application.status} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {lang === 'mr' ? 'अर्ज क्रमांक' : 'Application'} #{application.id}
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.65rem)', fontWeight: 800, color: 'var(--primary)' }}>
              {application.hostel?.hostelName || 'Hostel Admission'}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {lang === 'mr' ? 'अर्ज सादर तारीख' : 'Submitted on'}: {new Date(application.applicationDate).toLocaleDateString()}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {isApproved && isAllocated && !isPaid && (
              <Link to="/student/payment" className="btn btn-success" style={{ whiteSpace: 'nowrap' }}>
                <CreditCard size={18} />
                <span>{lang === 'mr' ? '₹१५,००० फी आता भरा' : 'Pay ₹15,000 Fee Now'}</span>
              </Link>
            )}
            {isAllocated && (
              <Link to="/student/allocation" className="btn btn-outline" style={{ whiteSpace: 'nowrap' }}>
                <Bed size={18} />
                <span>{lang === 'mr' ? 'खाट पहा' : 'View Bed'}: {allocation.bed?.bedNumber || '—'}</span>
              </Link>
            )}
          </div>
        </div>

        {isRejected && (
          <div style={{ marginTop: '1.25rem', padding: '1rem', backgroundColor: 'var(--danger-bg)', borderRadius: '8px', border: '1px solid #fecaca' }}>
            <div style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
              {lang === 'mr' ? 'वसतिगृह वॉर्डनकडून अर्ज नाकारण्याचे कारण:' : 'Rejection Reason from Warden:'}
            </div>
            <p style={{ color: '#991b1b', fontSize: '0.875rem' }}>
              {application.rejectionReason || (lang === 'mr' ? 'जागा उपलब्ध नसल्यामुळे किंवा कागदपत्रांतील त्रुटीमुळे अर्ज मंजूर होऊ शकला नाही.' : 'Application could not be approved due to unavailability of seats or document discrepancy.')}
            </p>
          </div>
        )}
      </div>

      {/* Visual Timeline */}
      <div className="card" style={{ padding: 'clamp(1.25rem, 3vw, 2.5rem)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '2rem' }}>
          {lang === 'mr' ? 'सविस्तर अर्ज प्रक्रिया प्रगती टप्पे' : 'Detailed Application Progress Timeline'}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {[
            {
              title: t('step1'),
              done: true,
              date: lang === 'mr' ? 'पूर्ण झाले' : 'Completed',
              desc: lang === 'mr' ? `महाविद्यालयीन PRN ${application.student?.studentId || '—'} सह प्रोफाईल नोंदणी पूर्ण.` : `Student record registered with PRN ${application.student?.studentId || '—'}`
            },
            {
              title: t('step2'),
              done: true,
              date: application.applicationDate ? new Date(application.applicationDate).toLocaleDateString() : '—',
              desc: lang === 'mr' ? `${application.hostel?.hostelName || 'वसतिगृह'} साठी ऑनलाईन अर्ज सादर केला.` : `Hostel application filed for ${application.hostel?.hostelName || 'Hostel'}`
            },
            {
              title: t('step3'),
              done: isApproved,
              date: isApproved ? (lang === 'mr' ? 'कागदपत्रे पडताळली' : 'Documents Verified') : (lang === 'mr' ? 'पडताळणी चालू' : 'Under Review'),
              desc: isApproved ? (lang === 'mr' ? 'फोटो, ओळखपत्र व प्रवेश पावती वॉर्डन यांनी मंजूर केली.' : 'Student photo, college ID, and identity proof verified by warden') : (lang === 'mr' ? 'वसतिगृह कार्यालय सादर केलेल्या कागदपत्रांची पडताळणी करत आहे.' : 'Hostel office is reviewing submitted documents')
            },
            {
              title: t('step4'),
              done: isApproved,
              date: isApproved ? (application.approvedDate ? new Date(application.approvedDate).toLocaleDateString() : (lang === 'mr' ? 'मंजूर' : 'Approved')) : isRejected ? (lang === 'mr' ? 'नाकारले' : 'Rejected') : (lang === 'mr' ? 'प्रलंबित' : 'Pending'),
              desc: isApproved ? (lang === 'mr' ? `${application.approvedBy || 'वॉर्डन'} यांनी अर्ज मंजूर केला.` : `Approved by ${application.approvedBy || 'Warden'}`) : isRejected ? `${t('rejectionReason')}: ${application.rejectionReason || 'Not specified'}` : (lang === 'mr' ? 'वसतिगृह अधीक्षकांच्या मंजुरीची प्रतीक्षा' : 'Awaiting Warden sign-off')
            },
            {
              title: t('step5'),
              done: isAllocated,
              date: isAllocated ? (lang === 'mr' ? 'वाटप झाले' : 'Allocated') : (lang === 'mr' ? 'वाटप प्रलंबित' : 'Pending Allocation'),
              desc: isAllocated ? (lang === 'mr' ? `खोली ${allocation.room?.roomNumber || '—'} - खाट ${allocation.bed?.bedNumber || '—'} वाटप केली.` : `Allocated Room ${allocation.room?.roomNumber || '—'} - Bed ${allocation.bed?.bedNumber || '—'}`) : (lang === 'mr' ? 'उपलब्ध खाट वाटप प्रतीक्षा यादीत आहे.' : 'Bed allocation is in queue')
            },
            {
              title: t('step6'),
              done: isPaid,
              date: isPaid ? (lang === 'mr' ? 'फी भरली' : 'Paid') : (lang === 'mr' ? 'प्रलंबित' : 'Pending'),
              desc: isPaid ? (lang === 'mr' ? `शुल्क भरणा ₹${payment.amount} यशस्वी (पावती: ${payment.receiptNumber})` : `Payment of ₹${payment.amount} successful (Receipt: ${payment.receiptNumber})`) : (lang === 'mr' ? 'खाट वाटपानंतर ऑनलाईन फी भरणे आवश्यक आहे.' : 'Online fee payment required after bed allocation')
            },
            {
              title: t('step7'),
              done: isPaid && isAllocated,
              date: isPaid && isAllocated ? (lang === 'mr' ? 'प्रवेश पूर्ण' : 'Admission Complete') : (lang === 'mr' ? 'प्रलंबित' : 'Pending'),
              desc: isPaid && isAllocated ? (lang === 'mr' ? 'वसतिगृह प्रवेश निश्चित झाला! वॉर्डन कार्यालयातून ओळखपत्र व चाव्या ताब्यात घ्या.' : 'Admission confirmed! Collect your hostel ID card and keys from the warden desk.') : (lang === 'mr' ? 'फी भरल्यानंतर अंतिम प्रवेश निश्चित होईल.' : 'Final admission confirmation upon payment receipt')
            }
          ].map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: '1.25rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: item.done ? 'var(--success)' : '#e2e8f0',
                color: item.done ? 'white' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.9rem',
                flexShrink: 0
              }}>
                {item.done ? '✓' : index + 1}
              </div>
              <div style={{ flex: 1, paddingBottom: index !== 6 ? '1.25rem' : 0, borderBottom: index !== 6 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: item.done ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    {item.title}
                  </h4>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: item.done ? 'var(--success)' : 'var(--text-muted)' }}>
                    {item.date}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
