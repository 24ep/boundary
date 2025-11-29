const auditService = require('../src/services/auditService');

// Generic audit middleware for admin routes
// Logs non-GET requests with status and basic metadata after response is sent
module.exports.auditAdminRequests = function() {
  return function(req, res, next) {
    const start = Date.now();

    // Only audit write operations
    const shouldAudit = req.method !== 'GET';
    const end = res.end;

    res.end = function(chunk, encoding) {
      const durationMs = Date.now() - start;
      const statusCode = res.statusCode;
      try {
        if (shouldAudit) {
          const userId = req.user && (req.user.id || req.user.userId) || null;
          const action = 'API_CALL';
          const details = {
            method: req.method,
            path: req.originalUrl || req.url,
            statusCode,
            durationMs,
            requestId: req.requestId,
          };
          auditService.logAPIEvent(userId, auditService.auditActions[action], details.path, details);
        }
      } catch (e) {
        // Do not block response on audit failure
        // eslint-disable-next-line no-console
        console.error('Audit middleware error:', e);
      }
      end.call(this, chunk, encoding);
    };

    next();
  };
};



