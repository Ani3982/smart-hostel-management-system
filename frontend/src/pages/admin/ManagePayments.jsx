import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { paymentService } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatusBadge } from '../../components/StatusBadge';
import { CreditCard, Download, Search } from 'lucide-react';

export const ManagePayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const res = await paymentService.getAll();
      if (res.data.success) {
        setPayments(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = payments.filter(p => {
    const q = search.toLowerCase();
    return p.student.fullName.toLowerCase().includes(q) ||
           p.student.studentId.toLowerCase().includes(q) ||
           p.receiptNumber.toLowerCase().includes(q);
  });

  const totalRevenue = payments
    .filter(p => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.85rem)', fontWeight: 800, color: 'var(--primary)' }}>
            Central Fee Accounts & Payments Audit
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginTop: '0.25rem' }}>
            Combined collection records across Boys Hostel and Girls Hostel
          </p>
        </div>

        <div style={{ padding: '0.75rem 1.5rem', backgroundColor: '#ecfdf5', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>Combined Campus Revenue</div>
          <div style={{ fontSize: 'clamp(1.2rem, 2vw, 1.5rem)', fontWeight: 900, color: '#047857' }}>
            ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card" style={{ padding: '1.25rem', width: '340px', maxWidth: '100%' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '38px' }}
            placeholder="Search receipt or student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner message="Loading payments..." />
      ) : (
        <>
          <div className="table-scroll-hint">← Scroll horizontally to view details →</div>
          <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Receipt No.</th>
                <th>PRN</th>
                <th>Student Full Name</th>
                <th>Hostel</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Transaction ID</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.receiptNumber}</strong></td>
                  <td>{p.student.studentId}</td>
                  <td style={{ fontWeight: 600 }}>{p.student.fullName}</td>
                  <td>{p.application.hostel.hostelName}</td>
                  <td><strong style={{ color: 'var(--success)' }}>₹{Number(p.amount).toLocaleString('en-IN')}</strong></td>
                  <td>{p.paymentMethod}</td>
                  <td><code style={{ fontSize: '0.8rem', background: '#f1f5f9', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>{p.transactionId}</code></td>
                  <td><StatusBadge status={p.status} /></td>
                  <td style={{ textAlign: 'right' }}>
                    <Link to={`/student/receipt/${p.receiptNumber}`} target="_blank" className="btn btn-outline btn-sm">
                      <Download size={14} />
                      <span>Receipt</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

    </div>
  );
};
