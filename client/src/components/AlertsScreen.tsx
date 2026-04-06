import React, { useEffect, useState } from 'react';
import { alertAPI } from '../api';
import socketService from '../api/socket';

interface AlertScreenProps { isActive: boolean; }

interface AlertItem {
  label: string;
  labelColor: string;
  title: string;
  description: string;
}

const fallbackAlerts: AlertItem[] = [
  { label: 'HIGH PRIORITY', labelColor: 'var(--danger)', title: 'Matanga Hill route deviation', description: 'T-1138 moved 146 meters off route. Nearby responder R-04 auto-suggested.' },
  { label: 'STATIONARY ANOMALY', labelColor: 'var(--warn)', title: 'Elephant Stables inactivity cluster', description: 'T-1098 inactive for 18 minutes with low battery and heat exposure risk.' },
  { label: 'BOUNDARY PRESSURE', labelColor: 'var(--blue)', title: 'Riverside edge geo-fence load', description: '11 near-boundary warnings in the last hour. Predictive alerting active.' },
  { label: 'RESOLVED', labelColor: 'var(--success)', title: 'Medical assist completed', description: 'Tourist rerouted to lower-risk corridor after verification and hydration support.' },
];

const AlertsScreen: React.FC<AlertScreenProps> = ({ isActive }) => {
  const [chipFilter, setChipFilter] = useState('all');
  const [alerts, setAlerts] = useState<AlertItem[]>(fallbackAlerts);
  const [alertCount, setAlertCount] = useState(7);

  useEffect(() => {
    alertAPI.getAll({ limit: 10 }).then((r) => {
      const apiAlerts = r.data?.data;
      if (apiAlerts && apiAlerts.length > 0) {
        const mapped = apiAlerts.map((a: any) => {
          const labelMap: Record<string, { label: string; color: string }> = {
            sos: { label: 'HIGH PRIORITY', color: 'var(--danger)' },
            anomaly: { label: 'ANOMALY DETECTED', color: 'var(--warn)' },
            geofence_breach: { label: 'BOUNDARY PRESSURE', color: 'var(--blue)' },
            manual: { label: 'MANUAL', color: 'var(--muted)' },
          };
          const info = labelMap[a.type] || { label: a.type?.toUpperCase(), color: 'var(--muted)' };
          if (a.status === 'resolved') { info.label = 'RESOLVED'; info.color = 'var(--success)'; }
          return { label: info.label, labelColor: info.color, title: a.cause, description: a.description || a.cause };
        });
        setAlerts(mapped);
        setAlertCount(apiAlerts.length);
      }
    }).catch(() => {});

    socketService.on('alert:created', () => setAlertCount((c) => c + 1));
    return () => { socketService.off('alert:created'); };
  }, []);

  const chips = ['All alerts', 'Anomalies', 'Geo-fence', 'SOS'];

  return (
    <section className={`screen ${isActive ? 'active' : ''}`}>
      <header className="header">
        <div className="header-inner glass">
          <div style={{ flex: 1 }}>
            <div className="eyebrow">AI + geofence events</div>
            <div className="title">Alerts</div>
          </div>
          <button className="icon-btn dark">{alertCount}</button>
        </div>
      </header>

      <div className="chips" style={{ marginBottom: 12 }}>
        {chips.map((c) => (
          <button key={c} className={`chip ${chipFilter === c ? 'active' : ''}`} onClick={() => setChipFilter(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="stack">
        {alerts.map((alert, i) => (
          <article className="glass card" key={i}>
            <div className="label" style={{ color: alert.labelColor }}>{alert.label}</div>
            <div className="section-title" style={{ marginTop: 8 }}>{alert.title}</div>
            <div className="subtext" style={{ marginTop: 6 }}>{alert.description}</div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default AlertsScreen;
