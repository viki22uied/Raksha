import { ROLES, ALERT_SEVERITY, ALERT_STATUS, ALERT_TYPE, WS_EVENTS, ANOMALY_THRESHOLDS } from '../src/utils/constants';

describe('Constants', () => {
  it('should have all roles', () => {
    expect(ROLES.TOURIST).toBe('tourist');
    expect(ROLES.ADMIN).toBe('admin');
    expect(ROLES.RESPONDER).toBe('responder');
  });

  it('should have all alert severities', () => {
    expect(Object.values(ALERT_SEVERITY)).toHaveLength(4);
    expect(ALERT_SEVERITY.CRITICAL).toBe('critical');
  });

  it('should have all alert statuses', () => {
    expect(Object.values(ALERT_STATUS)).toHaveLength(5);
    expect(ALERT_STATUS.PENDING).toBe('pending');
    expect(ALERT_STATUS.RESOLVED).toBe('resolved');
  });

  it('should have all alert types', () => {
    expect(Object.values(ALERT_TYPE)).toHaveLength(4);
  });

  it('should have WebSocket events', () => {
    expect(WS_EVENTS.TOURIST_SOS_TRIGGERED).toBe('tourist:sos:triggered');
    expect(WS_EVENTS.ALERT_CREATED).toBe('alert:created');
  });

  it('should have anomaly thresholds', () => {
    expect(ANOMALY_THRESHOLDS.SEQUENCE_LENGTH).toBe(20);
    expect(ANOMALY_THRESHOLDS.SCORE_HIGH).toBeGreaterThan(ANOMALY_THRESHOLDS.SCORE_MEDIUM);
  });
});
