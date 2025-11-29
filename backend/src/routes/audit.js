const express = require('express');
const router = express.Router();
const auditService = require('../services/auditService');

// GET /api/audit/logs
router.get('/logs', async (req, res) => {
  try {
    const { userId, action, category, level, startDate, endDate, limit, offset } = req.query;
    const result = await auditService.getAuditLogs({
      userId: userId || null,
      action: action || null,
      category: category || null,
      level: level || null,
      startDate: startDate || null,
      endDate: endDate || null,
      limit: limit ? Number(limit) : 100,
      offset: offset ? Number(offset) : 0,
    });
    // Normalize timestamps to ISO strings for the client
    const logs = (result.logs || []).map((l) => ({ ...l, timestamp: new Date(l.timestamp).toISOString() }));
    res.json({ ...result, logs });
  } catch (e) {
    console.error('GET /api/audit/logs error', e);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// GET /api/audit/stats
router.get('/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const result = await auditService.getAuditStatistics({ startDate: startDate || null, endDate: endDate || null });
    res.json(result);
  } catch (e) {
    console.error('GET /api/audit/stats error', e);
    res.status(500).json({ error: 'Failed to fetch audit stats' });
  }
});

// GET /api/audit/export?format=csv|json
router.get('/export', async (req, res) => {
  try {
    const { startDate, endDate, format = 'csv' } = req.query;
    const result = await auditService.exportAuditLogs({ startDate: startDate || null, endDate: endDate || null }, String(format).toLowerCase());
    const filename = result.filename || `audit_logs_${Date.now()}.${result.format || format}`;
    if (result.format === 'json') {
      res.setHeader('Content-Type', 'application/json');
    } else {
      res.setHeader('Content-Type', 'text/csv');
    }
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(result.data);
  } catch (e) {
    console.error('GET /api/audit/export error', e);
    res.status(500).json({ error: 'Failed to export audit logs' });
  }
});

module.exports = router;


