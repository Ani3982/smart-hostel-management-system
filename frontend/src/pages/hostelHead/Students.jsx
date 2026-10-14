import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { wardenPortalService } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  Users, 
  Search, 
  Eye, 
  Building2, 
  DoorClosed, 
  Bed, 
  CreditCard, 
  Phone, 
  Mail, 
  GraduationCap, 
  MapPin,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const Students = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadStudents();
  }, [search, statusFilter]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter;

      // Calls /api/warden/students - isolated at database level by authenticated Warden's hostelId
      const res = await wardenPortalService.getStudents(params);
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  const isGirlsHostel = user?.hostelId === 2;
  const hostelTitle = isGirlsHostel ? 'Girls Hostel' : 'Boys Hostel';

  // Pagination calculation
  const totalPages = Math.ceil(students.length / pageSize) || 1;
  const paginatedStudents = students.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
            <span>{hostelTitle} Resident Directory</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.65rem)', fontWeight: 800 }}>Student Management</h1>
          <p style={{ opacity: 0.85, fontSize: '0.875rem', marginTop: '0.15rem' }}>
            View and manage student residents enrolled in {hostelTitle}.
          </p>
        </div>

        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          padding: '0.75rem 1.25rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Total Records</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{students.length}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card" style={{ padding: '1rem' }}>
        <div className="toolbar-responsive">
          
          {/* Status Filter */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', flex: '1 1 auto' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Filter Status:</span>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: 'auto', minWidth: '150px', flex: '1 1 auto', fontSize: '0.85rem' }}
            >
              <option value="ALL">All Applications</option>
              <option value="APPROVED">Approved / Resident</option>
              <option value="PENDING">Pending Review</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="toolbar-search">
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px', fontSize: '0.875rem', width: '100%' }}
              placeholder="Search by student PRN, name, course..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

        </div>
      </div>

      {/* Student Table */}
      {loading ? (
        <LoadingSpinner message="Loading students list..." />
      ) : paginatedStudents.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <Users size={48} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No Students Found</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {search ? 'Try modifying your search query.' : `No students have applied to ${hostelTitle} yet.`}
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-scroll-hint">← Scroll horizontally to view student records →</div>
          <div className="table-container" style={{ margin: 0 }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Course</th>
                  <th>Year</th>
                  <th>Mobile</th>
                  <th>Email</th>
                  <th>Room</th>
                  <th>Bed</th>
                  <th>Application Status</th>
                  <th>Payment Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((st) => (
                  <tr key={st.id}>
                    <td>
                      <span style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        backgroundColor: '#f1f5f9',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        color: '#0f172a'
                      }}>
                        {st.student_id || `STU${st.id}`}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{st.full_name}</div>
                    </td>
                    <td>
                      <span style={{ color: '#334155', fontWeight: 600 }}>{st.course}</span>
                    </td>
                    <td>
                      <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{st.academic_year || '1st Year'}</span>
                    </td>
                    <td style={{ color: '#334155' }}>{st.mobile}</td>
                    <td style={{ color: '#334155' }}>{st.email}</td>
                    <td>
                      {st.room_number ? (
                        <span style={{
                          fontWeight: 700,
                          backgroundColor: '#eff6ff',
                          color: '#1d4ed8',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <DoorClosed size={12} />
                          {st.room_number}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Unassigned</span>
                      )}
                    </td>
                    <td>
                      {st.bed_number ? (
                        <span style={{
                          fontWeight: 700,
                          backgroundColor: '#f0fdf4',
                          color: '#15803d',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <Bed size={12} />
                          Bed {st.bed_number}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Unassigned</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={st.application_status || 'PENDING'} />
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '9999px',
                        backgroundColor: st.payment_status === 'SUCCESS' ? '#ecfdf5' : '#fffbeb',
                        color: st.payment_status === 'SUCCESS' ? '#047857' : '#b45309'
                      }}>
                        <CreditCard size={11} />
                        {st.payment_status === 'SUCCESS' ? 'PAID' : 'PENDING'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedStudent(st)}
                        className="btn btn-outline btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.65rem' }}
                      >
                        <Eye size={14} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            padding: '1rem 1.25rem',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc'
          }}>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Showing {students.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, students.length)} of {students.length} students
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-outline btn-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>
                Page {currentPage} of {totalPages}
              </div>
              <button
                className="btn btn-outline btn-sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={`Student Profile: ${selectedStudent.full_name}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              flexWrap: 'wrap'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: isGirlsHostel ? '#be185d' : '#1e3a8a',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                fontWeight: 800
              }}>
                {selectedStudent.full_name?.charAt(0)}
              </div>
              <div style={{ minWidth: '200px', flex: '1 1 auto' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{selectedStudent.full_name}</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  PRN: {selectedStudent.student_id} • {selectedStudent.course} ({selectedStudent.academic_year || '1st Year'})
                </p>
              </div>
            </div>

            <div className="responsive-grid-2" style={{ gap: '1rem', fontSize: '0.875rem' }}>
              <div><strong>Roll Number:</strong> {selectedStudent.roll_number || 'N/A'}</div>
              <div><strong>Gender:</strong> {selectedStudent.gender}</div>
              <div><strong>Mobile:</strong> {selectedStudent.mobile}</div>
              <div><strong>Email:</strong> {selectedStudent.email}</div>
              <div><strong>Allocated Room:</strong> {selectedStudent.room_number || 'Not Allocated'}</div>
              <div><strong>Allocated Bed:</strong> {selectedStudent.bed_number ? `Bed ${selectedStudent.bed_number}` : 'Not Allocated'}</div>
              <div><strong>Application Status:</strong> <StatusBadge status={selectedStudent.application_status} /></div>
              <div><strong>Payment Status:</strong> {selectedStudent.payment_status === 'SUCCESS' ? 'PAID (Receipt Issued)' : 'PENDING'}</div>
              <div><strong>Parent Name:</strong> {selectedStudent.parent_name || 'N/A'}</div>
              <div><strong>Parent Mobile:</strong> {selectedStudent.parent_mobile || 'N/A'}</div>
              <div className="grid-span-all"><strong>Residential Address:</strong> {selectedStudent.address || 'N/A'}, {selectedStudent.city}, {selectedStudent.state}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedStudent(null)}>
                Close
              </button>
            </div>

          </div>
        </Modal>
      )}

    </div>
  );
};
