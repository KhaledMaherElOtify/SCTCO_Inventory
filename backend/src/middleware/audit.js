// Audit logging middleware
// Tracks all significant operations for compliance

import { getDatabase } from '../config/database.js';

export async function logAudit(userId, action, entityType, entityId, oldValues = null, newValues = null, req = null) {
  const db = getDatabase();

  try {
    await db.run(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        action,
        entityType,
        entityId,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        req?.ip || 'unknown',
        req?.get('user-agent') || 'unknown',
      ]
    );
  } catch (error) {
    console.error('Audit logging failed:', error);
    // Don't throw - audit logging should not break the operation
  }
}

export function auditMiddleware(req, res, next) {
  // Attach audit logging function to request
  req.audit = (action, entityType, entityId, oldValues, newValues) => {
    if (req.user) {
      logAudit(req.user.id, action, entityType, entityId, oldValues, newValues, req);
    }
  };

  next();
}
