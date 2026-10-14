const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || '404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970';

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Full authentication is required to access this resource',
      data: null
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: parseInt(decoded.sub, 10),
      email: decoded.email,
      name: decoded.name,
      role: decoded.role.startsWith('ROLE_') ? decoded.role : `ROLE_${decoded.role}`
    };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      data: null
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
    }

    const userRole = req.user.role.replace(/^ROLE_/, '');
    const allowed = roles.some(r => {
      const allowedRole = r.replace(/^ROLE_/, '');
      if (allowedRole === userRole) return true;
      if ((allowedRole === 'HOSTEL_HEAD') && (userRole === 'BOYS_WARDEN' || userRole === 'GIRLS_WARDEN' || userRole === 'HOSTEL_HEAD')) return true;
      if ((allowedRole === 'BOYS_WARDEN' || allowedRole === 'GIRLS_WARDEN') && (userRole === allowedRole || userRole === 'HOSTEL_HEAD')) return true;
      return false;
    });

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: insufficient permissions',
        data: null
      });
    }

    next();
  };
};

// Strict data isolation middleware: Prevents Boys Warden from accessing Girls data and vice versa
const enforceHostelIsolation = (req, res, next) => {
  if (!req.user) return next();
  const rawRole = (req.user.role || '').toUpperCase().replace(/^ROLE_/, '');
  const reqHostelId = req.params.hostelId ? parseInt(req.params.hostelId, 10) : null;
  const bodyHostelId = req.body?.hostelId || req.body?.hostel_id ? parseInt(req.body.hostelId || req.body.hostel_id, 10) : null;
  const targetHostelId = reqHostelId || bodyHostelId;

  if (targetHostelId) {
    if (rawRole === 'BOYS_WARDEN' && targetHostelId !== 1) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Boys Warden can only view and manage Boys Hostel data (Hostel 1).',
        data: null
      });
    }

    if (rawRole === 'GIRLS_WARDEN' && targetHostelId !== 2) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Girls Warden can only view and manage Girls Hostel data (Hostel 2).',
        data: null
      });
    }
  }

  next();
};

module.exports = { authenticate, authorize, enforceHostelIsolation, JWT_SECRET };

