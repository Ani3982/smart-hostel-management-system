import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentService, allocationService, applicationService, paymentService } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import { 
  Users, 
  Search, 
  Eye, 
  Edit3, 
  Bed, 
  FileText, 
  CreditCard, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  GraduationCap, 
  Command,
  Building2,
  Clock,
  Save,
  X
} from 'lucide-react';

export const ManageStudents = () => {
  const { lang, isMr } = useLanguage();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // History Modal States
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [historyTab, setHistoryTab] = useState('ALLOCATION'); // ALLOCATION, APPLICATION, PAYMENTS, PROFILE
  const [studentAllocation, setStudentAllocation] = useState(null);
  const [studentApplications, setStudentApplications] = useState([]);
  const [studentPayments, setStudentPayments] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Edit Modal States
  const [editingStudent, setEditingStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    mobile: '',
    course: '',
    department: '',
    academicYear: 'First Year (FY)',
    rollNumber: '',
    parentName: '',
    parentMobile: '',
    emergencyContact: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editFeedback, setEditFeedback] = useState(null);

  useEffect(() => {
    loadStudents();
  }, [search]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await studentService.getAll(search);
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load students", err);
    } finally {
      setLoading(false);
    }
  };

  // Open Full Student History Modal and load related records
  const handleOpenHistory = async (student) => {
    setSelectedStudent(student);
    setHistoryTab('ALLOCATION');
    setLoadingHistory(true);

    try {
      const [allocRes, appsRes, payRes] = await Promise.allSettled([
        allocationService.getByStudent(student.id),
        applicationService.getAll(),
        paymentService.getByStudent(student.id)
      ]);

      if (allocRes.status === 'fulfilled' && allocRes.value.data.success) {
        setStudentAllocation(allocRes.value.data.data);
      } else {
        setStudentAllocation(null);
      }

      if (appsRes.status === 'fulfilled' && appsRes.value.data.success) {
        const studentApps = (appsRes.value.data.data || []).filter(
          app => app.student?.id === student.id || app.student?.studentId === student.studentId
        );
        setStudentApplications(studentApps);
      } else {
        setStudentApplications([]);
      }

      if (payRes.status === 'fulfilled' && payRes.value.data.success) {
        setStudentPayments(payRes.value.data.data || []);
      } else {
        setStudentPayments([]);
      }
    } catch (err) {
      console.error("Error loading student history", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Open Edit Student Modal
  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setEditFeedback(null);
    setEditFormData({
      fullName: student.fullName || '',
      mobile: student.mobile || '',
      course: student.course || '',
      department: student.department || '',
      academicYear: student.academicYear || 'First Year (FY)',
      rollNumber: student.rollNumber || '',
      parentName: student.parentName || '',
      parentMobile: student.parentMobile || '',
      emergencyContact: student.emergencyContact || '',
      address: student.address || '',
      city: student.city || 'Ahilyanagar',
      state: student.state || 'Maharashtra',
      pincode: student.pincode || '414001'
    });
  };

  // Save Student Updates
  const handleSaveStudent = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    setEditFeedback(null);

    try {
      const res = await studentService.update(editingStudent.id, editFormData);
      if (res.data.success) {
        setEditFeedback({ type: 'success', message: isMr ? 'विद्यार्थ्याची माहिती यशस्वीरित्या जतन केली!' : 'Student profile updated successfully!' });
        
        // Update local list
        setStudents(prev => prev.map(s => s.id === editingStudent.id ? { ...s, ...editFormData } : s));
        
        setTimeout(() => {
          setEditingStudent(null);
        }, 1200);
      } else {
        setEditFeedback({ type: 'error', message: res.data.message || 'Update failed' });
      }
    } catch (err) {
      setEditFeedback({ type: 'error', message: err.response?.data?.message || 'Server error while updating student.' });
    } finally {
      setSavingEdit(false);
    }
  };

  // Filter students based on status
  const filteredStudents = students.filter(s => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'MALE') return s.gender === 'MALE';
    if (statusFilter === 'FEMALE') return s.gender === 'FEMALE';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header Banner with Alt + A Indicator */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem',
        backgroundColor: 'white',
        padding: 'clamp(1rem, 3vw, 1.75rem) clamp(1rem, 4vw, 2rem)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{
              backgroundColor: '#1e3a8a',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              textTransform: 'uppercase'
            }}>
              {isMr ? 'मुख्य प्रशासक कक्ष (ADMIN)' : 'Super Admin Console'}
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#fef3c7',
              color: '#92400e',
              border: '1px solid #fde68a',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '0.2rem 0.6rem',
              borderRadius: '6px'
            }}>
              <Command size={13} />
              <span>Alt + A Shortcut</span>
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.85rem)', fontWeight: 900, color: 'var(--primary)' }}>
            {isMr ? 'सर्व विद्यार्थी इतिहास व प्रशासन' : 'All Students Master History & Management'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginTop: '0.25rem' }}>
            {isMr 
              ? 'सर्व नोंदणीकृत विद्यार्थ्यांचा संपूर्ण अर्ज, खोली व खाट वाटप, फी पावत्या इतिहास आणि थेट माहिती बदल (Edits).'
              : 'Complete records of student applications, room allocations, payment history, and direct administrative edits.'}
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ padding: '0.75rem 1.25rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border)', textAlign: 'center', flex: '1 1 auto' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>{isMr ? 'एकूण विद्यार्थी' : 'Total Students'}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary)' }}>{students.length}</div>
          </div>
          <div style={{ padding: '0.75rem 1.25rem', backgroundColor: '#ecfdf5', borderRadius: '10px', border: '1px solid #a7f3d0', textAlign: 'center', flex: '1 1 auto' }}>
            <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 700 }}>{isMr ? 'सक्रिय प्रणाली' : 'System Status'}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#047857' }}>100% ONLINE</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card toolbar-responsive" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="toolbar-search" style={{ position: 'relative', width: '380px', maxWidth: '100%' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '38px' }}
            placeholder={isMr ? "विद्यार्थ्याचे नाव, PRN, अभ्यासक्रम किंवा शहर शोधा..." : "Search by name, PRN, course or city..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: isMr ? 'सर्व विद्यार्थी' : 'All Students' },
            { id: 'MALE', label: isMr ? 'मुले (Male)' : 'Male' },
            { id: 'FEMALE', label: isMr ? 'मुली (Female)' : 'Female' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`btn btn-sm ${statusFilter === f.id ? 'btn-primary' : 'btn-outline'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Master Students Table */}
      {loading ? (
        <LoadingSpinner message={isMr ? "विद्यार्थ्यांची माहिती लोड होत आहे..." : "Loading student records..."} />
      ) : filteredStudents.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <Users size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{isMr ? "कोणतेही विद्यार्थी आढळले नाहीत" : "No Students Found"}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {isMr ? "दिलेल्या निकषांनुसार कोणतेही रेकॉर्ड उपलब्ध नाहीत." : "No student matches the search query or selected filter."}
          </p>
        </div>
      ) : (
        <>
          <div className="table-scroll-hint">← Scroll horizontally to view details →</div>
          <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>{isMr ? 'विद्यार्थी PRN' : 'PRN'}</th>
                <th>{isMr ? 'विद्यार्थ्याचे नाव' : 'Full Name'}</th>
                <th>{isMr ? 'लिंग' : 'Gender'}</th>
                <th>{isMr ? 'अभ्यासक्रम व वर्ष' : 'Course & Year'}</th>
                <th>{isMr ? 'हजेरी क्र.' : 'Roll No.'}</th>
                <th>{isMr ? 'मोबाईल नंबर' : 'Mobile'}</th>
                <th>{isMr ? 'गाव / शहर' : 'City / State'}</th>
                <th style={{ textAlign: 'right' }}>{isMr ? 'प्रशासकीय कृती' : 'Admin Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(s => (
                <tr key={s.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--primary)' }}>
                      {s.studentId}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{s.fullName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.email}</div>
                  </td>
                  <td>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: s.gender === 'MALE' ? '#e0f2fe' : '#fce7f3',
                      color: s.gender === 'MALE' ? '#0369a1' : '#be185d'
                    }}>
                      {s.gender === 'MALE' ? (isMr ? 'मुलगा' : 'Male') : (isMr ? 'मुलगी' : 'Female')}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.course}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.academicYear}</div>
                  </td>
                  <td><strong>{s.rollNumber}</strong></td>
                  <td>{s.mobile}</td>
                  <td>{s.city}, {s.state}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button 
                        onClick={() => handleOpenHistory(s)} 
                        className="btn btn-primary btn-sm"
                        title={isMr ? "संपूर्ण इतिहास पहा" : "View Full History"}
                      >
                        <Eye size={14} />
                        <span>{isMr ? 'इतिहास' : 'History'}</span>
                      </button>

                      <button 
                        onClick={() => handleOpenEdit(s)} 
                        className="btn btn-outline btn-sm"
                        title={isMr ? "माहिती बदला (Admin Edit)" : "Edit Student Details"}
                        style={{ color: '#0284c7', borderColor: '#bae6fd' }}
                      >
                        <Edit3 size={14} />
                        <span>{isMr ? 'बदला' : 'Edit'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {/* ========================================================
          1. COMPREHENSIVE STUDENT HISTORY MODAL
         ======================================================== */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={`${isMr ? 'विद्यार्थी सर्वसमावेशक इतिहास' : 'Student Full History'}: ${selectedStudent.fullName} (${selectedStudent.studentId})`}
          maxWidth="820px"
        >
          {/* Header Identity Card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            backgroundColor: '#0f172a',
            color: 'white',
            padding: '1.25rem 1.5rem',
            borderRadius: '10px',
            marginBottom: '1.25rem'
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                {selectedStudent.studentId} • {selectedStudent.gender}
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.2rem' }}>
                {selectedStudent.fullName}
              </h3>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
                {selectedStudent.course} • Roll No: {selectedStudent.rollNumber} • {selectedStudent.city}
              </div>
            </div>

            <button
              onClick={() => {
                const cur = selectedStudent;
                setSelectedStudent(null);
                handleOpenEdit(cur);
              }}
              className="btn btn-warning btn-sm"
              style={{ backgroundColor: '#f59e0b', color: '#0f172a', fontWeight: 800 }}
            >
              <Edit3 size={15} />
              <span>{isMr ? 'माहिती बदला (Edit)' : 'Edit Details'}</span>
            </button>
          </div>

          {/* Navigation Tabs for History Sections */}
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--border)', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '2px' }}>
            {[
              { id: 'ALLOCATION', icon: Bed, label: isMr ? 'खोली व खाट वाटप इतिहास' : 'Room & Bed Allocation' },
              { id: 'APPLICATION', icon: FileText, label: isMr ? 'प्रवेश अर्ज इतिहास' : 'Applications History' },
              { id: 'PAYMENTS', icon: CreditCard, label: isMr ? 'फी भरणा व पावत्या' : 'Fee Payments & Receipts' },
              { id: 'PROFILE', icon: Users, label: isMr ? 'वैयक्तिक व पालक तपशील' : 'Personal & Parent' }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = historyTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setHistoryTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.65rem 1rem',
                    border: 'none',
                    background: 'none',
                    borderBottom: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                    color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: isActive ? 800 : 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {loadingHistory ? (
            <LoadingSpinner message={isMr ? "इतिहास माहिती लोड होत आहे..." : "Loading student records history..."} />
          ) : (
            <div>
              {/* TAB 1: ALLOCATION HISTORY */}
              {historyTab === 'ALLOCATION' && (
                <div>
                  {studentAllocation ? (
                    <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#166534', fontWeight: 800, fontSize: '1.05rem', marginBottom: '1rem' }}>
                        <CheckCircle size={20} />
                        <span>{isMr ? 'सक्रिय वसतिगृह व खाट वाटप' : 'Active Room & Bed Allocation'}</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', fontSize: '0.9rem' }}>
                        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{isMr ? 'वसतिगृह' : 'Hostel'}</span>
                          <div style={{ fontWeight: 800, color: 'var(--primary)', marginTop: '0.2rem' }}>
                            {studentAllocation.bed?.room?.hostel?.hostelName || (isMr ? 'वसतिगृह' : 'Hostel')}
                          </div>
                        </div>

                        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{isMr ? 'खोली क्रमांक' : 'Room Number'}</span>
                          <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#166534', marginTop: '0.2rem' }}>
                            {studentAllocation.bed?.room?.roomNumber || 'N/A'}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isMr ? 'मजला' : 'Floor'} {studentAllocation.bed?.room?.floor || 1}</span>
                        </div>

                        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{isMr ? 'खाट क्रमांक' : 'Bed Number'}</span>
                          <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#166534', marginTop: '0.2rem' }}>
                            {studentAllocation.bed?.bedNumber || 'N/A'}
                          </div>
                        </div>

                        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{isMr ? 'वाटप दिनांक' : 'Allocated Date'}</span>
                          <div style={{ fontWeight: 700, marginTop: '0.2rem' }}>
                            {studentAllocation.allocatedDate ? new Date(studentAllocation.allocatedDate).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2.5rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border)' }}>
                      <Bed size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
                      <h4 style={{ fontWeight: 700 }}>{isMr ? 'सध्या कोणतीही खोली वाटप केलेली नाही' : 'No Active Room Allocated'}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {isMr 
                          ? 'या विद्यार्थ्याचा अर्ज मंजूर झाल्यावर संबंधित वसतिगृह प्रमुख खाट वाटप करतील.'
                          : 'Bed can be allocated once student application is reviewed and approved.'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: APPLICATION HISTORY */}
              {historyTab === 'APPLICATION' && (
                <div>
                  {studentApplications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2.5rem', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                      <FileText size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
                      <h4 style={{ fontWeight: 700 }}>{isMr ? 'कोणतेही अर्ज रेकॉर्ड नाहीत' : 'No Applications Found'}</h4>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {studentApplications.map(app => (
                        <div key={app.id} style={{
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          padding: '1rem 1.25rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '1rem'
                        }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <strong>#{app.id}</strong>
                              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                                {app.hostel?.hostelName || (isMr ? 'वसतिगृह अर्ज' : 'Hostel Application')}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                              {isMr ? 'सादर दिनांक:' : 'Submitted on:'} {new Date(app.applicationDate).toLocaleDateString()}
                              {app.remarks && ` • Remarks: ${app.remarks}`}
                            </div>
                          </div>
                          <StatusBadge status={app.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PAYMENT RECEIPTS */}
              {historyTab === 'PAYMENTS' && (
                <div>
                  {studentPayments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2.5rem', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                      <CreditCard size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
                      <h4 style={{ fontWeight: 700 }}>{isMr ? 'कोणत्याही फी भरणा पावत्या नाहीत' : 'No Payment Records'}</h4>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {studentPayments.map(p => (
                        <div key={p.id} style={{
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          padding: '1rem 1.25rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '1rem'
                        }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <strong>{p.receiptNumber}</strong>
                              <span style={{ fontWeight: 800, color: 'var(--success)', fontSize: '1.05rem' }}>
                                ₹{Number(p.amount).toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                              {p.paymentMethod} • Txn: <code>{p.transactionId}</code> • {new Date(p.paymentDate).toLocaleDateString()}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <StatusBadge status={p.status} />
                            <Link to={`/student/receipt/${p.receiptNumber}`} target="_blank" className="btn btn-outline btn-sm">
                              <Download size={14} />
                              <span>{isMr ? 'पावती पहा' : 'View Receipt'}</span>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: PERSONAL & PARENT */}
              {historyTab === 'PROFILE' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem', fontSize: '0.9rem', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '8px' }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>PRN: </span><strong>{selectedStudent.studentId}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Gender: </span><strong>{selectedStudent.gender}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Mobile: </span><strong>{selectedStudent.mobile}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Email: </span><strong>{selectedStudent.email}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Course: </span><strong>{selectedStudent.course}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Roll No: </span><strong>{selectedStudent.rollNumber}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Parent Name: </span><strong>{selectedStudent.parentName}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Parent Mobile: </span><strong>{selectedStudent.parentMobile}</strong></div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Permanent Address: </span>
                    <span>{selectedStudent.address}, {selectedStudent.city}, {selectedStudent.state} - {selectedStudent.pincode}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.75rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <button onClick={() => setSelectedStudent(null)} className="btn btn-outline">
              {isMr ? 'बंद करा (Close)' : 'Close'}
            </button>
          </div>
        </Modal>
      )}

      {/* ========================================================
          2. ADMIN EDIT STUDENT DETAILS MODAL
         ======================================================== */}
      {editingStudent && (
        <Modal
          isOpen={!!editingStudent}
          onClose={() => setEditingStudent(null)}
          title={`${isMr ? 'विद्यार्थी माहिती बदल (Admin Edit)' : 'Edit Student Details'}: ${editingStudent.fullName}`}
          maxWidth="700px"
        >
          {editFeedback && (
            <div style={{
              padding: '0.85rem',
              borderRadius: '8px',
              backgroundColor: editFeedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
              color: editFeedback.type === 'success' ? '#047857' : '#b91c1c',
              border: `1px solid ${editFeedback.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
              marginBottom: '1.25rem',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {editFeedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span>{editFeedback.message}</span>
            </div>
          )}

          <form onSubmit={handleSaveStudent}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem' }}>
              <div>
                <label className="form-label">{isMr ? 'विद्यार्थ्याचे पूर्ण नाव' : 'Full Name'} *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">{isMr ? 'मोबाईल नंबर' : 'Mobile Number'} *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={editFormData.mobile}
                  onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">{isMr ? 'अभ्यासक्रम' : 'Course'} *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={editFormData.course}
                  onChange={(e) => setEditFormData({ ...editFormData, course: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">{isMr ? 'हजेरी क्रमांक (Roll No)' : 'Roll Number'} *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={editFormData.rollNumber}
                  onChange={(e) => setEditFormData({ ...editFormData, rollNumber: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">{isMr ? 'शैक्षणिक वर्ष' : 'Academic Year'}</label>
                <select
                  className="form-select"
                  value={editFormData.academicYear}
                  onChange={(e) => setEditFormData({ ...editFormData, academicYear: e.target.value })}
                >
                  <option value="First Year (FY)">First Year (FY)</option>
                  <option value="Second Year (SY)">Second Year (SY)</option>
                  <option value="Third Year (TY)">Third Year (TY)</option>
                  <option value="Post Graduate (PG-1)">Post Graduate (PG-1)</option>
                  <option value="Post Graduate (PG-2)">Post Graduate (PG-2)</option>
                </select>
              </div>

              <div>
                <label className="form-label">{isMr ? 'विभाग (Department)' : 'Department'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.department}
                  onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">{isMr ? 'पालकांचे नाव' : 'Parent Name'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.parentName}
                  onChange={(e) => setEditFormData({ ...editFormData, parentName: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">{isMr ? 'पालकांचा मोबाईल' : 'Parent Mobile'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.parentMobile}
                  onChange={(e) => setEditFormData({ ...editFormData, parentMobile: e.target.value })}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">{isMr ? 'घरचा पत्ता' : 'Permanent Address'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">{isMr ? 'शहर / गाव' : 'City'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.city}
                  onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">{isMr ? 'पिनकोड' : 'Pincode'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.pincode}
                  onChange={(e) => setEditFormData({ ...editFormData, pincode: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="btn btn-outline"
                disabled={savingEdit}
              >
                {isMr ? 'रद्द करा' : 'Cancel'}
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={savingEdit}
              >
                <Save size={16} />
                <span>{savingEdit ? (isMr ? 'जतन करत आहे...' : 'Saving...') : (isMr ? 'बदल जतन करा' : 'Save Changes')}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
