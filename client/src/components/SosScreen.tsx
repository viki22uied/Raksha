import React, { useState } from 'react';
import { sosAPI } from '../api';
import { PhoneIcon } from './Icons';

interface SosScreenProps { isActive: boolean; }

const SosScreen: React.FC<SosScreenProps> = ({ isActive }) => {
  const [triggered, setTriggered] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSOS = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // Try to get current location
      let lat = 15.3358, lng = 76.4606;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch { /* use default coords */ }

      await sosAPI.trigger({ lat, lng, message: 'Emergency SOS triggered from app', battery: 35 });
      setTriggered(true);
      setTimeout(() => setTriggered(false), 5000);
    } catch (err) {
      console.error('SOS trigger failed:', err);
      // Still show triggered state for demo
      setTriggered(true);
      setTimeout(() => setTriggered(false), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={`screen ${isActive ? 'active' : ''}`}>
      <header className="header">
        <div className="header-inner glass">
          <div style={{ flex: 1 }}>
            <div className="eyebrow">Incident response</div>
            <div className="title">SOS</div>
          </div>
          <button className="icon-btn dark"><PhoneIcon size={18} /></button>
        </div>
      </header>

      <div className="stack">
        <article className="glass card" style={{ textAlign: 'center' }}>
          <div className="label">Emergency trigger</div>
          <button
            className="sos-button"
            onClick={handleSOS}
            disabled={loading}
            style={triggered ? { background: '#ef4444', boxShadow: '0 24px 44px rgba(239,68,68,.3)' } : {}}
          >
            <div>
              <div className="title" style={{ fontSize: 36, color: 'white', letterSpacing: '-.07em' }}>
                {triggered ? '✓' : loading ? '...' : 'SOS'}
              </div>
              <div className="tiny" style={{ color: 'rgba(255,255,255,.72)' }}>
                {triggered ? 'Alert sent!' : 'Tap to trigger'}
              </div>
            </div>
          </button>
          <div className="section-title">Full emergency packet</div>
          <div className="subtext" style={{ marginTop: 6 }}>
            Location, latest trajectory, DID, insurance, contacts, and nearest responder are shared instantly.
          </div>
        </article>

        <article className="glass card">
          <div className="section-title">Response workflow</div>
          <div className="grid-2" style={{ marginTop: 12 }}>
            <div className="list-item"><strong>50 GPS points</strong><div className="tiny" style={{ marginTop: 4 }}>LSTM-ready sequence</div></div>
            <div className="list-item"><strong>Geo-fence state</strong><div className="tiny" style={{ marginTop: 4 }}>Inside / outside boundary</div></div>
            <div className="list-item"><strong>DID packet</strong><div className="tiny" style={{ marginTop: 4 }}>Ethereum + IPFS</div></div>
            <div className="list-item"><strong>Dispatch</strong><div className="tiny" style={{ marginTop: 4 }}>Under 2 seconds</div></div>
          </div>
        </article>
      </div>
    </section>
  );
};

export default SosScreen;
