import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { siteClusters, zones, routePath, responderPositions, generateMockTourists } from '../data/mockData';
import { FilterIcon, CloseIcon } from './Icons';
import { analyticsAPI } from '../api';
import socketService from '../api/socket';

function InvalidateSize() {
  const map = useMap();
  useEffect(() => { setTimeout(() => map.invalidateSize(), 100); }, [map]);
  return null;
}

function createDotIcon(color: string, size: number) {
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:999px;background:${color};border:2.5px solid rgba(255,255,255,.95);box-shadow:0 5px 14px rgba(0,0,0,.16)"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createClusterIcon(count: number, color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="min-width:38px;height:38px;padding:0 10px;border-radius:999px;background:${color};color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;box-shadow:0 10px 25px rgba(0,0,0,.15);border:3px solid rgba(255,255,255,.94)">${count}</div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
}

function createResponderIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="width:18px;height:18px;border-radius:999px;background:#151515;border:3px solid rgba(255,255,255,.96);box-shadow:0 8px 18px rgba(0,0,0,.18)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

interface MapScreenProps {
  isActive: boolean;
}

const MapScreen: React.FC<MapScreenProps> = ({ isActive }) => {
  const [filter, setFilter] = useState<'all' | 'safe' | 'warning' | 'danger'>('all');
  const [sheetOpen, setSheetOpen] = useState(true);
  const [realtimeData, setRealtimeData] = useState<any>(null);
  const tourists = useMemo(() => generateMockTourists(), []);

  const filtered = filter === 'all' ? tourists : tourists.filter((t) => t.status === filter);

  const statusColor = (s: string) => s === 'safe' ? '#2f9b67' : s === 'warning' ? '#f59e0b' : '#ef4444';

  useEffect(() => {
    analyticsAPI.getRealtime().then(r => setRealtimeData(r.data?.data)).catch(() => {});
    socketService.on('tourist:location:update', (data: any) => {
      console.log('[WS] Location update:', data);
    });
    return () => { socketService.off('tourist:location:update'); };
  }, []);

  const totalTourists = realtimeData?.tourists?.total || 156;
  const activeAlerts = realtimeData?.alerts?.active || 7;

  return (
    <section className={`screen ${isActive ? 'active' : ''}`}>
      <header className="header">
        <div className="header-inner glass">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="eyebrow">Raksha Setu · Hampi command</div>
            <div className="title">Live map intelligence</div>
          </div>
          <button className="icon-btn" onClick={() => setSheetOpen(!sheetOpen)} aria-label="Open map details">
            <FilterIcon />
          </button>
        </div>
      </header>

      <div className="segmented glass-soft">
        {(['all', 'safe', 'warning', 'danger'] as const).map((f) => (
          <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f === 'safe' ? 'Safe' : f === 'warning' ? 'Watch' : 'Critical'}
          </button>
        ))}
      </div>

      <div className="map-wrap glass card-tight" style={{ padding: 10, marginBottom: 12 }}>
        <div className="map-overlay-top">
          <button className="chip active">{totalTourists} tourists</button>
          <button className="chip">12 geo-fences</button>
          <button className="chip">8 heritage sites</button>
          <button className="chip">12 responders</button>
          <button className="chip">3,500 locations</button>
        </div>
        <div className="map-container">
          <MapContainer center={[15.3368, 76.4615]} zoom={14.7} zoomControl={false} style={{ width: '100%', height: '100%', borderRadius: 30 }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} attribution="&copy; OpenStreetMap" />
            <InvalidateSize />

            {/* Geo-fence polygons */}
            {zones.map((z, i) => (
              <Polygon key={i} positions={z.coords} pathOptions={{ color: z.color, weight: 2, dashArray: z.dashed ? '6 6' : undefined, fillColor: z.color, fillOpacity: 0.08 }}>
                <Popup>{z.name}</Popup>
              </Polygon>
            ))}

            {/* Route polyline */}
            <Polyline positions={routePath} pathOptions={{ color: '#171717', weight: 4, opacity: 0.55 }} />

            {/* Cluster markers */}
            {siteClusters.map((c, i) => (
              <Marker key={`cluster-${i}`} position={c.center} icon={createClusterIcon(c.count, c.color)}>
                <Popup><strong>{c.name}</strong><br />{c.count} tourists active</Popup>
              </Marker>
            ))}

            {/* Tourist dot markers */}
            {filtered.map((t, i) => (
              <Marker key={`tourist-${i}`} position={t.coords} icon={createDotIcon(statusColor(t.status), 11)}>
                <Popup><strong>{t.id} · {t.name}</strong><br />{t.zone}<br />Status: {t.status}<br />Speed: {t.speed}</Popup>
              </Marker>
            ))}

            {/* Responder markers */}
            {responderPositions.map((pos, i) => (
              <Marker key={`resp-${i}`} position={pos} icon={createResponderIcon()}>
                <Popup><strong>Responder R-{i + 1}</strong><br />Patrol unit active</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: 12 }}>
        <article className="kpi"><div className="mini-title">GPS</div><div className="value">&lt;10m</div><div className="tiny">position accuracy</div></article>
        <article className="kpi"><div className="mini-title">AI</div><div className="value">92%</div><div className="tiny">anomaly detection</div></article>
        <article className="kpi dark"><div className="mini-title">Alerts</div><div className="value">1.8s</div><div className="tiny">dispatch time</div></article>
      </div>

      <div className="stack">
        <article className="glass card">
          <div className="row" style={{ alignItems: 'flex-start' }}>
            <div>
              <div className="section-title">Coverage summary</div>
              <div className="subtext" style={{ marginTop: 4 }}>Map-first view of tourists, responders, zone pressure, and route risk.</div>
            </div>
            <span className="badge"><span className="dot" style={{ background: 'var(--success)' }} />Live</span>
          </div>
          <div className="grid-2" style={{ marginTop: 12 }}>
            <div className="list-item"><div className="mini-title">Tracked tourists</div><div className="value">{totalTourists}</div><div className="tiny">active in monitored areas</div></div>
            <div className="list-item"><div className="mini-title">Safe zones</div><div className="value">12</div><div className="tiny">polygons monitored</div></div>
            <div className="list-item"><div className="mini-title">Open alerts</div><div className="value">{String(activeAlerts).padStart(2, '0')}</div><div className="tiny">high + medium priority</div></div>
            <div className="list-item"><div className="mini-title">Telemetry</div><div className="value">50</div><div className="tiny">GPS points per sequence</div></div>
          </div>
        </article>

        <article className="glass card">
          <div className="row">
            <div>
              <div className="section-title">Major monitored sites</div>
              <div className="subtext" style={{ marginTop: 4 }}>High-density tourist clusters in Hampi.</div>
            </div>
            <span className="badge"><span className="dot" style={{ background: 'var(--blue)' }} />8 sites</span>
          </div>
          <div className="list" style={{ marginTop: 12 }}>
            {[
              { name: 'Virupaksha Temple', info: '34 tourists · 2 responders · low risk', count: 34 },
              { name: 'Vittala Temple', info: '27 tourists · route corridor active', count: 27 },
              { name: 'Krishna Bazaar', info: '22 tourists · drift cases monitored', count: 22 },
            ].map((s) => (
              <div className="list-item" key={s.name}>
                <div className="row">
                  <div><strong>{s.name}</strong><div className="tiny">{s.info}</div></div>
                  <strong className="value" style={{ fontSize: 18 }}>{s.count}</strong>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      {/* Bottom Sheet */}
      <aside className={`sheet glass ${sheetOpen ? 'active' : ''}`}>
        <div className="sheet-handle" />
        <div className="row" style={{ marginBottom: 12 }}>
          <div><div className="eyebrow">Map detail layer</div><div className="section-title">Operational summary</div></div>
          <button className="icon-btn" onClick={() => setSheetOpen(false)}><CloseIcon /></button>
        </div>
        <div className="grid-2" style={{ marginBottom: 12 }}>
          <div className="kpi"><div className="mini-title">Tracked tourists</div><div className="value">{totalTourists}</div></div>
          <div className="kpi"><div className="mini-title">Open alerts</div><div className="value">{String(activeAlerts).padStart(2, '0')}</div></div>
        </div>
        <div className="list">
          {[
            { name: 'Virupaksha Temple', info: '34 tourists · low risk', status: 'Stable', color: 'var(--success)' },
            { name: 'Elephant Stables', info: '19 tourists · anomaly watch', status: 'Watch', color: 'var(--warn)' },
            { name: 'Matanga Hill', info: '11 tourists · deviation alerts', status: 'Critical', color: 'var(--danger)' },
          ].map((s) => (
            <div className="list-item" key={s.name}>
              <div className="row">
                <div><strong>{s.name}</strong><div className="tiny">{s.info}</div></div>
                <span className="badge"><span className="dot" style={{ background: s.color }} />{s.status}</span>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </section>
  );
};

export default MapScreen;
