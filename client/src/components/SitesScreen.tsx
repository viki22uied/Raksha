import React, { useEffect, useState } from 'react';
import { analyticsAPI, geofenceAPI } from '../api';

interface SitesScreenProps { isActive: boolean; }

interface SiteData {
  name: string;
  description: string;
  status: string;
  statusColor: string;
  kpis: { label: string; value: string }[];
}

const fallbackSites: SiteData[] = [
  {
    name: 'Virupaksha Temple cluster', description: 'Core heritage zone with strong responder coverage.',
    status: 'Stable', statusColor: 'var(--success)',
    kpis: [{ label: 'Tourists', value: '34' }, { label: 'Responders', value: '2' }, { label: 'Geo-fence', value: 'On' }, { label: 'Risk', value: 'Low' }],
  },
  {
    name: 'Vittala Temple corridor', description: 'Long walking route with crowd-density variation.',
    status: 'Busy', statusColor: 'var(--blue)',
    kpis: [{ label: 'Tourists', value: '27' }, { label: 'Alerts', value: '3' }, { label: 'Avg speed', value: '3.9' }, { label: 'Route flow', value: 'Good' }],
  },
  {
    name: 'Matanga Hill climb', description: 'Fatigue and off-route risk zone.',
    status: 'Critical', statusColor: 'var(--danger)',
    kpis: [{ label: 'Tourists', value: '11' }, { label: 'Deviation', value: '4' }, { label: 'Responder ETA', value: '5m' }, { label: 'Weather risk', value: 'Med' }],
  },
];

const SitesScreen: React.FC<SitesScreenProps> = ({ isActive }) => {
  const [sites, setSites] = useState<SiteData[]>(fallbackSites);

  useEffect(() => {
    analyticsAPI.getZones().then((r) => {
      const z = r.data?.data;
      if (z && z.length > 0) {
        const mapped = z.map((zone: any) => {
          const pressure = zone.pressure || 0;
          let status = 'Stable', statusColor = 'var(--success)';
          if (pressure > 80) { status = 'Critical'; statusColor = 'var(--danger)'; }
          else if (pressure > 50) { status = 'Busy'; statusColor = 'var(--blue)'; }
          return {
            name: zone.name, description: `Risk: ${zone.riskLevel} · Priority: ${zone.watchPriority}`,
            status, statusColor,
            kpis: [
              { label: 'Tourists', value: String(zone.currentOccupancy || 0) },
              { label: 'Breaches', value: String(zone.breachCount || 0) },
              { label: 'Capacity', value: zone.maxCapacity ? `${Math.round(pressure)}%` : 'N/A' },
              { label: 'Risk', value: zone.riskLevel || 'safe' },
            ],
          };
        });
        setSites(mapped);
      }
    }).catch(() => {});
  }, []);

  return (
    <section className={`screen ${isActive ? 'active' : ''}`}>
      <header className="header">
        <div className="header-inner glass">
          <div style={{ flex: 1 }}>
            <div className="eyebrow">Destination intelligence</div>
            <div className="title">Sites</div>
          </div>
          <button className="icon-btn">{sites.length}</button>
        </div>
      </header>

      <div className="stack">
        {sites.map((site, i) => (
          <article className="glass card" key={i}>
            <div className="row">
              <div>
                <div className="section-title">{site.name}</div>
                <div className="subtext" style={{ marginTop: 4 }}>{site.description}</div>
              </div>
              <span className="badge"><span className="dot" style={{ background: site.statusColor }} />{site.status}</span>
            </div>
            <div className="grid-2" style={{ marginTop: 12 }}>
              {site.kpis.map((kpi) => (
                <div className="kpi" key={kpi.label}>
                  <div className="mini-title">{kpi.label}</div>
                  <div className="value">{kpi.value}</div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default SitesScreen;
