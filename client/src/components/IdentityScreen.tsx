import React, { useEffect, useState } from 'react';
import { identityAPI, authAPI } from '../api';

interface IdentityScreenProps { isActive: boolean; }

const IdentityScreen: React.FC<IdentityScreenProps> = ({ isActive }) => {
  const [profile, setProfile] = useState<any>(null);
  const [docs, setDocs] = useState<any[]>([]);

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: 'Priya Sharma', bloodGroup: 'B+', nationality: 'Bengaluru', phone: '+91 9876543210' });

  useEffect(() => {
    const token = localStorage.getItem('raksha_token');
    if (!token) return;
    
    // Attempt backend fetch, fallback to defaults
    authAPI.getMe().then((r) => {
      const u = r.data?.data;
      if (u) {
        setProfile(u);
        setFormData({ name: u.name, bloodGroup: 'B+', nationality: 'India', phone: u.phone || '+91 9876543210' });
        identityAPI.getDocuments(u._id).then((dr) => setDocs(dr.data?.data || [])).catch(() => {});
      }
    }).catch(() => {
      // Mock Data if API not ready
      setProfile({ _id: 't-1421', name: 'Mock User', role: 'tourist' });
    });
  }, []);

  const handleSave = () => {
    // Usually touristAPI.update()
    setEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('raksha_token');
    window.location.reload();
  };

  const name = formData.name;
  const did = docs[0]?.did || 'did:ethr:0x8af3...2cd1';
  const ipfsHash = docs[0]?.ipfsCid ? `${docs[0].ipfsCid.slice(0, 4)}...${docs[0].ipfsCid.slice(-4)}` : 'Qm7x...3kd2';

  return (
    <section className={`screen ${isActive ? 'active' : ''}`}>
      <header className="header">
        <div className="header-inner glass">
          <div style={{ flex: 1 }}>
            <div className="eyebrow">User settings</div>
            <div className="title">Profile & ID</div>
          </div>
          <button className="icon-btn" onClick={handleLogout} style={{ fontSize: 12, padding: '0 12px', width: 'auto', background: 'rgba(239,68,68,0.2)', color: '#ef4444' }}>Out</button>
        </div>
      </header>

      <div className="stack">
        <article className="glass card">
          <div className="row" style={{ alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div className="label">Tourist profile</div>
              {editing ? (
                <input 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: 8, borderRadius: 6, marginTop: 8, fontSize: 20, width: '100%' }}
                />
              ) : (
                <div className="section-title" style={{ marginTop: 8, fontSize: 24 }}>{name}</div>
              )}
            </div>
            <button 
              onClick={() => editing ? handleSave() : setEditing(true)} 
              style={{ background: editing ? 'white' : 'rgba(255,255,255,0.1)', color: editing ? 'black' : 'white', padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}
            >
              {editing ? 'Save' : 'Edit'}
            </button>
          </div>
          
          <div className="subtext" style={{ marginTop: 6 }}>
            {profile?._id?.slice(0,6).toUpperCase() || 'T-1421'} · {formData.nationality} · verified at entry checkpoint.
          </div>
          <div className="grid-2" style={{ marginTop: 12 }}>
            <div className="kpi">
              <div className="mini-title">Ethereum DID</div>
              <div style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.35 }}>{did}</div>
            </div>
            <div className="kpi">
              <div className="mini-title">IPFS hash</div>
              <div style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.35 }}>{ipfsHash}</div>
            </div>
            <div className="kpi">
              <div className="mini-title">Phone</div>
              {editing ? (
                 <input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: 4, width: '100%', borderRadius: 4 }} />
              ) : (
                 <div style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.35 }}>{formData.phone}</div>
              )}
            </div>
            <div className="kpi">
              <div className="mini-title">Blood group</div>
              {editing ? (
                 <input value={formData.bloodGroup} onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: 4, width: '100%', borderRadius: 4 }} />
              ) : (
                 <div style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.35 }}>{formData.bloodGroup}</div>
              )}
            </div>
          </div>
        </article>

        <article className="glass card">
          <div className="section-title">Emergency packet</div>
          <div className="subtext" style={{ marginTop: 6 }}>
            Passport, nationality, contacts, medical notes, and responder-safe verification trail.
          </div>
          <div className="grid-2" style={{ marginTop: 12 }}>
            <div className="list-item">
              <strong>Contacts</strong>
              <div className="tiny" style={{ marginTop: 4 }}>
                {profile?.emergencyContacts?.length || 2} encrypted family contacts
              </div>
            </div>
            <div className="list-item">
              <strong>Medical</strong>
              <div className="tiny" style={{ marginTop: 4 }}>
                {profile?.medicalNotes || 'No allergy flags'}
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};

export default IdentityScreen;
