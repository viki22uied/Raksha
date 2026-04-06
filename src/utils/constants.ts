// Roles
export const ROLES = {
  TOURIST: 'tourist',
  ADMIN: 'admin',
  RESPONDER: 'responder',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Alert severities
export const ALERT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export type AlertSeverity = (typeof ALERT_SEVERITY)[keyof typeof ALERT_SEVERITY];

// Alert statuses
export const ALERT_STATUS = {
  PENDING: 'pending',
  ACKNOWLEDGED: 'acknowledged',
  ASSIGNED: 'assigned',
  ESCALATED: 'escalated',
  RESOLVED: 'resolved',
} as const;

export type AlertStatus = (typeof ALERT_STATUS)[keyof typeof ALERT_STATUS];

// Alert types
export const ALERT_TYPE = {
  SOS: 'sos',
  GEOFENCE_BREACH: 'geofence_breach',
  ANOMALY: 'anomaly',
  MANUAL: 'manual',
} as const;

export type AlertType = (typeof ALERT_TYPE)[keyof typeof ALERT_TYPE];

// SOS statuses
export const SOS_STATUS = {
  ACTIVE: 'active',
  ACKNOWLEDGED: 'acknowledged',
  RESOLVED: 'resolved',
  FALSE_ALARM: 'false_alarm',
} as const;

export type SosStatus = (typeof SOS_STATUS)[keyof typeof SOS_STATUS];

// Anomaly types
export const ANOMALY_TYPE = {
  SUDDEN_STOP: 'sudden_stop',
  ROUTE_DRIFT: 'route_drift',
  PROLONGED_STATIONARY: 'prolonged_stationary',
  ERRATIC_MOVEMENT: 'erratic_movement',
  BOUNDARY_PRESSURE: 'boundary_pressure',
} as const;

export type AnomalyType = (typeof ANOMALY_TYPE)[keyof typeof ANOMALY_TYPE];

// Geofence risk levels
export const RISK_LEVEL = {
  SAFE: 'safe',
  CAUTION: 'caution',
  DANGER: 'danger',
  RESTRICTED: 'restricted',
} as const;

export type RiskLevel = (typeof RISK_LEVEL)[keyof typeof RISK_LEVEL];

// Identity verification statuses
export const IDENTITY_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
} as const;

export type IdentityStatus = (typeof IDENTITY_STATUS)[keyof typeof IDENTITY_STATUS];

// Admin action types
export const ADMIN_ACTION_TYPE = {
  ALERT_ACKNOWLEDGE: 'alert_acknowledge',
  ALERT_ASSIGN: 'alert_assign',
  ALERT_ESCALATE: 'alert_escalate',
  ALERT_RESOLVE: 'alert_resolve',
  RESPONDER_ASSIGN: 'responder_assign',
  GEOFENCE_CREATE: 'geofence_create',
  GEOFENCE_UPDATE: 'geofence_update',
  GEOFENCE_DELETE: 'geofence_delete',
  IDENTITY_VERIFY: 'identity_verify',
  ANALYTICS_RECOMPUTE: 'analytics_recompute',
  EXPORT_DATA: 'export_data',
} as const;

export type AdminActionType = (typeof ADMIN_ACTION_TYPE)[keyof typeof ADMIN_ACTION_TYPE];

// WebSocket event names
export const WS_EVENTS = {
  TOURIST_LOCATION_UPDATE: 'tourist:location:update',
  TOURIST_SOS_TRIGGERED: 'tourist:sos:triggered',
  ALERT_CREATED: 'alert:created',
  ALERT_UPDATED: 'alert:updated',
  ANOMALY_DETECTED: 'anomaly:detected',
  GEOFENCE_BREACH: 'geofence:breach',
  ANALYTICS_UPDATED: 'analytics:updated',
  RESPONDER_ASSIGNED: 'responder:assigned',
  RESPONDER_ETA: 'responder:eta',
  ADMIN_DASHBOARD_UPDATE: 'admin:dashboard:update',
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Anomaly detection thresholds
export const ANOMALY_THRESHOLDS = {
  SCORE_LOW: 0.3,
  SCORE_MEDIUM: 0.6,
  SCORE_HIGH: 0.8,
  SEQUENCE_LENGTH: 20,
  STATIONARY_MINUTES: 30,
  SPEED_ERRATIC_THRESHOLD: 50, // km/h sudden change
  DRIFT_DISTANCE_METERS: 500,
} as const;
