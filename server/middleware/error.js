const logger = require('../logger');

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  logger.error({ err, path: req.path }, message);
  res.status(status).json({ error: message });
};




