const jwt = require('jsonwebtoken');

function auth(requiredRole) {
  return (req, res, next) => {
    const token = (req.cookies && req.cookies.token) || (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = payload;
      if (requiredRole) {
        const roles = Array.isArray(payload.roles) ? payload.roles : [payload.role].filter(Boolean);
        if (!roles.includes(requiredRole) && payload.role !== 'Admin') {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }
      next();
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

module.exports = auth;




