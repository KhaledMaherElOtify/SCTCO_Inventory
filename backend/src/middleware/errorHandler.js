// Error handling middleware
// Centralized error response formatting

export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  // Log error
  if (status === 500) {
    console.error('Server Error:', err);
  }

  // Validation errors from express-validator
  if (err.errors && Array.isArray(err.errors)) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map(e => ({
        field: e.param,
        message: e.msg,
      })),
    });
  }

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
  });
}
