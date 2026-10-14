import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { wardenPortalService } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatusBadge } from '../../components/StatusBadge';
import { CreditCard, Search, Download, Building2, CheckCircle, ExternalLink, Calendar } from 'lucide-react';

export const Payments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    loadPayments();
  }, [statusFilter]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;

      // Calls /api/warden/payments - isolated at database level to this warden's hostel only
      const res = await wardenPortalService.getPayments(params);
      if (res.data.success) {
        setPayments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load warden payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const isGirlsHostel = user?.hostelId === 2;
  const hostelTitle = isGirlsHostel ? 'Girls Hostel' : 'Boys Hostel';

  const filtered = payments.filter(p => {
    const q = search.toLowerCase();
    const stName = (p.student_name || p.student?.fullName || '').toLowerCase();
    const stPrn = (p.student_prn || p.student?.studentId || '').toLowerCase();
    const rNum = (p.receipt_number || p.receiptNumber || '').toLowerCase();
    const txId = (p.transaction_id || p.transactionId || '').toLowerCase();
    return stName.includes(q) || stPrn.includes(q) || rNum.includes(q) || txId.includes(q);
  });

  const totalCollected = payments
    .filter(p => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Banner */}
      <div style={{
        background: isGirlsHostel
          ? 'linear-gradient(135deg, #0f172a 0%, #be185d 100%)'
          : 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
        color: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: 'clamp(1.25rem, 3vw, 2rem)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div style={{ minWidth: 'min(100%, 280px)', flex: '1 1 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            padding: '0.2rem 0.65rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            marginBottom: '0.35rem'
          }}>
            <Building2 size={14} />
            <span>{hostelTitle} Accounts Desk</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.65rem)', fontWeight: 800 }}>Payment Management</h1>
          <p style={{ opacity: 0.85, fontSize: '0.875rem', marginTop: '0.15rem' }}>
            Audited records of student fee transactions and official payment receipts for {hostelTitle}.
          </p>
        </div>

        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          padding: '0.75rem 1.5rem',
          borderRadius: '10px',
          textAlign: 'center',
          minWidth: 'min(100%, 200px)'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#fef08a' }}>
            Total Collected Revenue
          </div>
          <div style={{ fontSize: 'clamp(1.25rem, 3vw, 1.65rem)', fontWeight: 900, color: 'white' }}>
            ₹{totalCollected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="card" style={{ padding: '1rem' }}>
        <div className="toolbar-responsive">
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', flex: '1 1 auto' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Payment Status:</span>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto', minWidth: '150px', flex: '1 1 auto', fontSize: '0.85rem' }}
            >
              <option value="ALL">All Payments</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
              <option value="REFUNDED">REFUNDED</option>
            </select>
          </div>

          <div className="toolbar-search">
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px', fontSize: '0.875rem', width: '100%' }}
              placeholder="Search receipt, student PRN, or tx..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

        </div>
      </div>

      {/* Payment Table */}
      {loading ? (
        <LoadingSpinner message="Loading payments..." />
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <CreditCard size={48} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No Payment Records Found</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {search ? 'Try modifying your search filter.' : `Payment transactions completed by ${hostelTitle} students will appear here.`}
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-scroll-hint">← Scroll horizontally to view transaction details →</div>
          <div className="table-container" style={{ margin: 0 }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Application</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Transaction ID</th>
                  <th>Payment Date</th>
                  <th>Status</th>
                  <th>Receipt Number</th>
                  <th style={{ textAlign: 'right' }}>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const studentName = p.student_name || p.student?.fullName;
                  const studentPrn = p.student_prn || p.student?.studentId;
                  const appId = p.application_id || p.applicationId;
                  const txId = p.transaction_id || p.transactionId;
                  const receiptNo = p.receipt_number || p.receiptNumber;
                  const pDate = p.payment_date || p.paymentDate || p.created_at;

                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{studentName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>PRN: {studentPrn}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#1e3a8a', fontFamily: 'monospace' }}>
                          APP-{String(appId).padStart(4, '0')}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: '#047857', fontSize: '0.95rem' }}>
                          ₹{Number(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          backgroundColor: '#f1f5f9',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          color: '#334155'
                        }}>
                          {p.payment_method || p.paymentMethod || 'ONLINE'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#475569' }}>
                          {txId || 'N/A'}
                        </span>
                      </td>
                      <td style={{ color: '#334155', fontSize: '0.85rem' }}>
                        {pDate ? new Date(pDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        <StatusBadge status={p.status} />
                      </td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          fontFamily: 'monospace',
                          color: '#1e3a8a'
                        }}>
                          {receiptNo || '-'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {receiptNo && p.status === 'SUCCESS' ? (
                          <Link
                            to={`/student/receipt/${receiptNo}`}
                            target="_blank"
                            className="btn btn-outline btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.55rem' }}
                          >
                            <ExternalLink size={13} />
                            <span>Voucher</span>
                          </Link>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
