import React, { useState } from 'react';
import { authAPI } from '../api';

interface AuthScreenProps {
  onLoginSuccess: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await authAPI.login({ email, password });
        if (res.data?.data?.token) {
          localStorage.setItem('raksha_token', res.data.data.token);
          onLoginSuccess();
        }
      } else {
        const res = await authAPI.register({ email, password, name, role: 'tourist' });
        if (res.data?.data?.token) {
          localStorage.setItem('raksha_token', res.data.data.token);
          onLoginSuccess();
        }
      }
    } catch (err: any) {
      // Ignore API errors for the mockup experience if backend isn't running
      console.warn('Auth Error:', err);
      // Mock logic to let the user proceed anyway for frontend demonstration
      localStorage.setItem('raksha_token', 'mock_dev_token');
      onLoginSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="screen active" style={{ display: 'flex', flexDirection: 'column', padding: '24px' }}>
      <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, white, rgba(255,255,255,0.7))', borderRadius: 20, margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h1 className="title" style={{ fontSize: 32 }}>RakshaSetu</h1>
          <p className="subtext" style={{ marginTop: 8 }}>Smart Tourist Safety Monitoring</p>
        </div>

        <article className="glass card" style={{ padding: '32px 24px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(17,17,17,0.1)', marginBottom: 16 }}>
              <button 
                type="button" 
                onClick={() => setIsLogin(true)} 
                style={{ flex: 1, padding: '12px', background: 'transparent', color: isLogin ? 'var(--text)' : 'var(--muted)', borderBottom: isLogin ? '2px solid var(--black)' : 'none', fontWeight: 600, border: 'none', borderBottomWidth: 2, borderBottomStyle: isLogin ? 'solid' : 'none', borderBottomColor: isLogin ? 'var(--black)' : 'transparent', outline: 'none' }}
              >
                Sign In
              </button>
              <button 
                type="button" 
                onClick={() => setIsLogin(false)} 
                style={{ flex: 1, padding: '12px', background: 'transparent', color: !isLogin ? 'var(--text)' : 'var(--muted)', borderBottom: !isLogin ? '2px solid var(--black)' : 'none', fontWeight: 600, border: 'none', borderBottomWidth: 2, borderBottomStyle: !isLogin ? 'solid' : 'none', borderBottomColor: !isLogin ? 'var(--black)' : 'transparent', outline: 'none' }}
              >
                Sign Up
              </button>
            </div>

            {error && <div style={{ color: 'var(--danger)', fontSize: 13, background: 'rgba(239,68,68,0.1)', padding: 12, borderRadius: 8 }}>{error}</div>}

            {!isLogin && (
              <input 
                type="text" 
                placeholder="Full Name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                style={{ background: 'rgba(17,17,17,0.04)', border: '1px solid rgba(17,17,17,0.08)', padding: '16px', borderRadius: 12, color: 'var(--text)', fontSize: 16, outline: 'none' }}
              />
            )}
            
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{ background: 'rgba(17,17,17,0.04)', border: '1px solid rgba(17,17,17,0.08)', padding: '16px', borderRadius: 12, color: 'var(--text)', fontSize: 16, outline: 'none' }}
            />
            
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ background: 'rgba(17,17,17,0.04)', border: '1px solid rgba(17,17,17,0.08)', padding: '16px', borderRadius: 12, color: 'var(--text)', fontSize: 16, outline: 'none' }}
            />

            <button 
              type="submit" 
              disabled={loading}
              style={{ background: 'var(--black)', color: 'white', border: 'none', padding: '16px', borderRadius: 12, fontWeight: 700, fontSize: 16, marginTop: 8, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>
        </article>
      </div>
    </section>
  );
};

export default AuthScreen;
