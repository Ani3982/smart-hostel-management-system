import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { wardenPortalService } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { 
  BarChart3, 
  Printer, 
  FileSpreadsheet, 
  Download, 
  Search, 
  Calendar, 
  Filter, 
  Building2, 
  DoorClosed, 
  Bed, 
  Users, 
  CreditCard, 
  FileText,
  CheckCircle,
  Clock
} from 'lucide-react';

export const Reports = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState('OCCUPANCY'); // OCCUPANCY, STUDENTS, APPLICATIONS, ROOMS, BEDS, ALLOCATIONS, PAYMENTS
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      // Calls /api/warden/reports - strictly isolated to the authenticated Warden's hostel
      const res = await wardenPortalService.getReports();
      if (res.data.success) {
        setReportData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load warden reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportExcel = () => {
    // Generate CSV export based on active report
    let csvContent = "data:text/csv;charset=utf-8,";
    let filename = `${activeReport}_Report_${new Date().toISOString().substring(0, 10)}.csv`;

    if (activeReport === 'OCCUPANCY' || activeReport === 'ROOMS') {
      csvContent += "Room Number,Floor,Capacity,Total Beds,Occupied Beds,Available Beds,Status\n";
      (reportData?.occupancyReport || []).forEach(r => {
        csvContent += `"${r.room_number}",${r.floor},${r.capacity},${r.total_beds},${r.occupied_beds},${r.available_beds},"${r.room_status}"\n`;
      });
    } else if (activeReport === 'STUDENTS' || activeReport === 'ALLOCATIONS') {
      csvContent += "PRN,Full Name,Course,Year,Mobile,Email,Room,Bed,Allocation Date,Payment\n";
      (reportData?.studentResidentReport || []).forEach(s => {
        csvContent += `"${s.student_id}","${s.full_name}","${s.course}","${s.academic_year || ''}","${s.mobile}","${s.email}","${s.room_number || ''}","${s.bed_number || ''}","${s.allocation_date || ''}","${s.payment_status || 'PENDING'}"\n`;
      });
    } else if (activeReport === 'APPLICATIONS') {
      csvContent += "Status,Count\n";
      (reportData?.applicationSummary || []).forEach(a => {
        csvContent += `"${a.status}",${a.count}\n`;
      });
    } else if (activeReport === 'PAYMENTS') {
      csvContent += "Payment Status,Transaction Count,Total Amount (INR)\n";
      (reportData?.paymentSummary || []).forEach(p => {
        csvContent += `"${p.status}",${p.count},${p.total_amount}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isGirlsHostel = user?.hostelId === 2;
  const hostelTitle = isGirlsHostel ? 'Girls Hostel' : 'Boys Hostel';

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
            <span>{hostelTitle} Audit & Analytics Console</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.65rem)', fontWeight: 800 }}>Reports & Intelligence</h1>
          <p style={{ opacity: 0.85, fontSize: '0.875rem', marginTop: '0.15rem' }}>
            Official reporting module with export to PDF & Excel for {hostelTitle}.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            onClick={handleExportPDF}
            className="btn btn-secondary"
            style={{ backgroundColor: 'white', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, whiteSpace: 'nowrap' }}
          >
            <Printer size={16} />
            <span>Export PDF</span>
          </button>
          <button 
            onClick={handleExportExcel}
            className="btn btn-outline"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.18)', color: 'white', borderColor: 'transparent', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, whiteSpace: 'nowrap' }}
          >
            <FileSpreadsheet size={16} />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Reports Selection Tabs */}
      <div className="card" style={{ padding: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {[
            { id: 'OCCUPANCY', label: 'Hostel Occupancy', icon: Building2 },
            { id: 'STUDENTS', label: 'Student List', icon: Users },
            { id: 'APPLICATIONS', label: 'Application Report', icon: FileText },
            { id: 'ROOMS', label: 'Room Report', icon: DoorClosed },
            { id: 'BEDS', label: 'Bed Availability', icon: Bed },
            { id: 'ALLOCATIONS', label: 'Allocation Report', icon: CheckCircle },
            { id: 'PAYMENTS', label: 'Payment Report', icon: CreditCard },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeReport === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveReport(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.6rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  backgroundColor: isActive ? (isGirlsHostel ? '#be185d' : '#1e3a8a') : '#f8fafc',
                  color: isActive ? 'white' : '#475569',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Date Range Controls */}
      <div className="card" style={{ padding: '1rem' }}>
        <div className="toolbar-responsive">
          
          {/* Search */}
          <div className="toolbar-search">
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px', fontSize: '0.85rem', width: '100%' }}
              placeholder="Search in report..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Date Range */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>
              <Calendar size={15} />
              <span>From:</span>
              <input
                type="date"
                className="form-input"
                style={{ width: 'auto', minWidth: '130px', padding: '0.35rem 0.6rem', fontSize: '0.85rem' }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>
              <span>To:</span>
              <input
                type="date"
                className="form-input"
                style={{ width: 'auto', minWidth: '130px', padding: '0.35rem 0.6rem', fontSize: '0.85rem' }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            {(startDate || endDate) && (
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => { setStartDate(''); setEndDate(''); }}
                style={{ fontSize: '0.75rem' }}
              >
                Clear
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Report Content */}
      {loading ? (
        <LoadingSpinner message="Generating report..." />
      ) : (
        <div className="card" style={{ padding: 'clamp(1rem, 2.5vw, 2rem)' }}>
          <div className="table-scroll-hint">← Scroll horizontally to inspect full audit report →</div>
          
          {/* Printable Report Header */}
          <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '1.25rem', marginBottom: '1.75rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#1e3a8a' }}>
              New Arts, Commerce & Science College, Ahilyanagar (Autonomous)
            </h2>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
              {hostelTitle.toUpperCase()} • OFFICIAL AUDIT & COMPLIANCE REPORT
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.35rem' }}>
              Report Category: <strong>{activeReport}</strong> • Generated At: {new Date().toLocaleString()} • Warden: {reportData?.wardenName || user?.name}
            </div>
          </div>

          {/* Report 1: Hostel Occupancy / Rooms */}
          {(activeReport === 'OCCUPANCY' || activeReport === 'ROOMS' || activeReport === 'BEDS') && (
            <div className="table-container" style={{ margin: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Room Number</th>
                    <th>Floor</th>
                    <th>Bed Capacity</th>
                    <th>Occupied Beds</th>
                    <th>Available Beds</th>
                    <th>Occupancy Rate</th>
                    <th>Room Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(reportData?.occupancyReport || [])
                    .filter(r => (r.room_number || '').toLowerCase().includes(search.toLowerCase()))
                    .map((r, i) => {
                      const occ = Number(r.occupied_beds) || 0;
                      const cap = Number(r.capacity) || 4;
                      const rate = Math.round((occ / cap) * 100);
                      return (
                        <tr key={i}>
                          <td style={{ fontWeight: 800, color: '#0f172a' }}>{r.room_number}</td>
                          <td>Floor {r.floor}</td>
                          <td>{cap} Beds</td>
                          <td style={{ color: occ > 0 ? '#b45309' : '#64748b', fontWeight: 700 }}>{occ} Occupied</td>
                          <td style={{ color: r.available_beds > 0 ? '#059669' : '#dc2626', fontWeight: 700 }}>{r.available_beds} Available</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ flex: 1, backgroundColor: '#e2e8f0', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${rate}%`, backgroundColor: rate >= 100 ? '#ef4444' : '#2563eb', height: '100%' }} />
                              </div>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{rate}%</span>
                            </div>
                          </td>
                          <td>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              backgroundColor: r.room_status === 'AVAILABLE' ? '#ecfdf5' : '#eff6ff',
                              color: r.room_status === 'AVAILABLE' ? '#047857' : '#1e40af'
                            }}>
                              {r.room_status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}

          {/* Report 2: Student List / Allocation Report */}
          {(activeReport === 'STUDENTS' || activeReport === 'ALLOCATIONS') && (
            <div className="table-container" style={{ margin: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Full Name</th>
                    <th>Course & Dept</th>
                    <th>Mobile</th>
                    <th>Allocated Room</th>
                    <th>Bed Number</th>
                    <th>Allocation Date</th>
                    <th>Fee Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(reportData?.studentResidentReport || [])
                    .filter(s => 
                      (s.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
                      (s.student_id || '').toLowerCase().includes(search.toLowerCase()) ||
                      (s.course || '').toLowerCase().includes(search.toLowerCase())
                    )
                    .map((s, i) => (
                      <tr key={i}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{s.student_id}</td>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>{s.full_name}</td>
                        <td>{s.course}</td>
                        <td>{s.mobile}</td>
                        <td style={{ fontWeight: 700, color: '#1e3a8a' }}>{s.room_number || '-'}</td>
                        <td style={{ fontWeight: 700, color: '#059669' }}>Bed {s.bed_number || '-'}</td>
                        <td>{s.allocation_date ? new Date(s.allocation_date).toLocaleDateString() : '-'}</td>
                        <td>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '9999px',
                            backgroundColor: s.payment_status === 'SUCCESS' ? '#ecfdf5' : '#fffbeb',
                            color: s.payment_status === 'SUCCESS' ? '#047857' : '#b45309'
                          }}>
                            {s.payment_status === 'SUCCESS' ? 'PAID' : 'PENDING'}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Report 3: Applications Summary Report */}
          {activeReport === 'APPLICATIONS' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              {(reportData?.applicationSummary || []).map((app, i) => (
                <div key={i} style={{ padding: '1.5rem', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                    {app.status} APPLICATIONS
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1e3a8a', marginTop: '0.25rem' }}>
                    {app.count}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Report 4: Payment Summary Report */}
          {activeReport === 'PAYMENTS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                {(reportData?.paymentSummary || []).map((p, i) => (
                  <div key={i} style={{ padding: '1.5rem', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                      {p.status} PAYMENTS
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: p.status === 'SUCCESS' ? '#059669' : '#d97706', marginTop: '0.25rem' }}>
                      ₹{Number(p.total_amount || 0).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                      {p.count} Total Transactions
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
