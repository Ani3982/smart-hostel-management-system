import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hostel_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Auth APIs
export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getCurrentUser: () => api.get('/auth/me')
};

// Dashboard APIs (dynamically computed from backend)
export const dashboardService = {
  getHostelStats: (hostelId) => api.get(`/dashboard/hostel/${hostelId}`),
  getPublicSummary: () => api.get('/dashboard/public/summary'),
  getPublicMatrix: (hostelType) => api.get(`/dashboard/public/matrix${hostelType ? `?hostelType=${encodeURIComponent(hostelType)}` : ''}`)
};

// Hostel APIs
export const hostelService = {
  getAll: () => api.get('/hostels'),
  getById: (id) => api.get(`/hostels/${id}`)
};

// Room & Bed APIs
export const roomService = {
  getAll: () => api.get('/rooms'),
  getByHostel: (hostelId, search = '') => api.get(`/rooms/hostel/${hostelId}${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getById: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`)
};

export const bedService = {
  getAll: () => api.get('/beds'),
  getByRoom: (roomId) => api.get(`/beds/room/${roomId}`),
  getByHostel: (hostelId) => api.get(`/beds/hostel/${hostelId}`),
  getAvailable: (hostelId) => api.get(`/beds/available/${hostelId}`),
  create: (data) => api.post('/beds', data),
  update: (id, data) => api.put(`/beds/${id}`, data),
  updateStatus: (id, status) => api.put(`/beds/${id}/status?status=${status}`)
};

// Application APIs
export const applicationService = {
  submit: (data) => api.post('/applications', data),
  checkPublicStatus: (data) => api.post('/applications/public-status', data),
  getAll: () => api.get('/applications'),
  getPending: () => api.get('/applications/pending'),
  getByHostel: (hostelId, search = '') => api.get(`/applications/hostel/${hostelId}${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getPendingByHostel: (hostelId) => api.get(`/applications/hostel/${hostelId}/pending`),
  getMyApplication: () => api.get('/applications/my-application'),
  getById: (id) => api.get(`/applications/${id}`),
  approve: (id) => api.put(`/applications/${id}/approve`),
  reject: (id, reason) => api.put(`/applications/${id}/reject`, { reason })
};

// Allocation APIs
export const allocationService = {
  allocate: (data) => api.post('/allocations', data),
  getByHostel: (hostelId) => api.get(`/allocations/hostel/${hostelId}`),
  getByStudent: (studentId) => api.get(`/allocations/student/${studentId}`),
  getMyAllocation: () => api.get('/allocations/my-allocation'),
  deallocate: (id) => api.delete(`/allocations/${id}`)
};

// Payment APIs
export const paymentService = {
  create: (data) => api.post('/payments/create', data),
  verify: (data) => api.post('/payments/verify', data),
  createRazorpayOrder: (amount = 15000) => api.post('/payments/razorpay/create-order', { amount }),
  sendConfirmationEmail: (receiptNumber) => api.post(`/payments/send-confirmation-email/${receiptNumber}`),
  getAll: () => api.get('/payments'),
  getByHostel: (hostelId) => api.get(`/payments/hostel/${hostelId}`),
  getByStudent: (studentId) => api.get(`/payments/student/${studentId}`),
  getMyPayments: () => api.get('/payments/my-payments'),
  getReceipt: (receiptNumber) => api.get(`/payments/receipt/${receiptNumber}`)
};

// Student APIs
export const studentService = {
  getAll: (search = '') => api.get(`/students${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getById: (id) => api.get(`/students/${id}`),
  getByUserId: (userId) => api.get(`/students/user/${userId}`),
  getByHostel: (hostelId) => api.get(`/students/hostel/${hostelId}`),
  update: (id, data) => api.put(`/students/${id}`, data)
};

// Notification APIs
export const notificationService = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all')
};

// Document APIs
export const documentService = {
  upload: (documentType, file) => {
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('file', file);
    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getByStudent: (studentId) => api.get(`/documents/student/${studentId}`),
  getMyDocuments: () => api.get('/documents/my-documents'),
  verify: (id, status) => api.put(`/documents/${id}/verify?status=${status}`)
};

// Dedicated Warden Portal APIs (strictly isolated by JWT session)
export const wardenPortalService = {
  getProfile: () => api.get('/warden/profile'),
  getDashboard: (params = {}) => api.get('/warden/dashboard', { params }),
  getApplications: (params = {}) => api.get('/warden/applications', { params }),
  getApplicationById: (id) => api.get(`/warden/applications/${id}`),
  approveApplication: (id) => api.put(`/warden/applications/${id}/approve`),
  rejectApplication: (id, reason) => api.put(`/warden/applications/${id}/reject`, { reason }),
  getStudents: (params = {}) => api.get('/warden/students', { params }),
  getRooms: () => api.get('/warden/rooms'),
  getBeds: (params = {}) => api.get('/warden/beds', { params }),
  getAllocations: () => api.get('/warden/allocations'),
  createAllocation: (data) => api.post('/warden/allocations', data),
  getPayments: (params = {}) => api.get('/warden/payments', { params }),
  getReports: () => api.get('/warden/reports')
};

// Complaints APIs (Bi-directional student & warden)
export const complaintService = {
  getAll: (params = {}) => api.get('/complaints', { params }),
  create: (data) => api.post('/complaints', data),
  updateStatus: (id, status, remarks) => api.patch(`/complaints/${id}/status`, { status, remarks }),
  delete: (id) => api.delete(`/complaints/${id}`)
};


export default api;
