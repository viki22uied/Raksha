import React from 'react';

interface AnalyticsScreenProps {
  isActive: boolean;
}

const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ isActive }) => {
  return (
    <section className={`screen ${isActive ? 'active' : ''}`}>
      <header className="header">
        <div className="header-inner glass">
          <div style={{ flex: 1 }}>
            <div className="eyebrow">Performance Metrics</div>
            <div className="title">Analytics Engine</div>
          </div>
          <button className="icon-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
          </button>
        </div>
      </header>

      <div className="stack">
        <article className="glass card">
          <div className="row">
            <div className="label">System Capabilities</div>
            <div className="badge"><div className="dot" style={{background: 'var(--success)'}}></div>Live</div>
          </div>
          <div className="grid-2" style={{ marginTop: '12px' }}>
            <div className="kpi">
              <div className="mini-title">LSTM Anomaly</div>
              <div className="value">92%</div>
              <div className="tiny" style={{ marginTop: '4px' }}>Accuracy rate</div>
            </div>
            <div className="kpi">
              <div className="mini-title">Geo-Fencing</div>
              <div className="value">&lt;10m</div>
              <div className="tiny" style={{ marginTop: '4px' }}>GPS precision</div>
            </div>
            <div className="kpi">
              <div className="mini-title">Alert Response</div>
              <div className="value">&lt;2s</div>
              <div className="tiny" style={{ marginTop: '4px' }}>Latency</div>
            </div>
            <div className="kpi">
              <div className="mini-title">System Uptime</div>
              <div className="value">99.5%</div>
              <div className="tiny" style={{ marginTop: '4px' }}>SLA Met</div>
            </div>
          </div>
        </article>

        <article className="glass card">
          <div className="label">LSTM Performance</div>
          <div className="section-title" style={{ marginTop: '8px' }}>Anomaly Types Detected</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <div>
              <div className="row" style={{ marginBottom: '4px' }}>
                <span className="tiny" style={{ fontWeight: 600 }}>Route Drift</span>
                <span className="tiny">320 events</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '85%', height: '100%', background: 'linear-gradient(90deg, var(--warn), #fbbf24)', borderRadius: '4px' }}></div>
              </div>
            </div>
            
            <div>
              <div className="row" style={{ marginBottom: '4px' }}>
                <span className="tiny" style={{ fontWeight: 600 }}>Erratic Movement</span>
                <span className="tiny">184 events</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '60%', height: '100%', background: 'linear-gradient(90deg, var(--danger), #f87171)', borderRadius: '4px' }}></div>
              </div>
            </div>
            
            <div>
              <div className="row" style={{ marginBottom: '4px' }}>
                <span className="tiny" style={{ fontWeight: 600 }}>Prolonged Stationary</span>
                <span className="tiny">142 events</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '45%', height: '100%', background: 'linear-gradient(90deg, var(--blue), #60a5fa)', borderRadius: '4px' }}></div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};

export default AnalyticsScreen;
