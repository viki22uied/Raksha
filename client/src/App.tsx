import React, { useState, useEffect } from 'react';
import MapScreen from './components/MapScreen';
import AlertsScreen from './components/AlertsScreen';
import IdentityScreen from './components/IdentityScreen';
import SosScreen from './components/SosScreen';
import AnalyticsScreen from './components/AnalyticsScreen';
import { MapIcon, AlertIcon, PinIcon, UserIcon, PhoneIcon } from './components/Icons';
import socketService from './api/socket';
import AuthScreen from './components/AuthScreen';
import './index.css';

type Screen = 'map' | 'alerts' | 'analytics' | 'identity' | 'sos';

const ChartIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
);

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('raksha_token'));
  const [activeScreen, setActiveScreen] = useState<Screen>('map');

  useEffect(() => {
    if (isAuthenticated) {
      socketService.connect();
      socketService.joinAdmin();
    }
    return () => { socketService.disconnect(); };
  }, [isAuthenticated]);

  const handleScreenChange = (screen: Screen) => {
    setActiveScreen(screen);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const navItems: { screen: Screen; icon: React.FC<{ size?: number }>; label: string }[] = [
    { screen: 'map', icon: MapIcon, label: 'Map' },
    { screen: 'alerts', icon: AlertIcon, label: 'Alerts' },
    { screen: 'analytics', icon: ChartIcon, label: 'Metrics' },
    { screen: 'identity', icon: UserIcon, label: 'Profile' },
    { screen: 'sos', icon: PhoneIcon, label: 'SOS' },
  ];

  if (!isAuthenticated) {
    return (
      <main className="app">
        <AuthScreen onLoginSuccess={() => setIsAuthenticated(true)} />
      </main>
    );
  }

  return (
    <main className="app">
      <MapScreen isActive={activeScreen === 'map'} />
      <AlertsScreen isActive={activeScreen === 'alerts'} />
      <AnalyticsScreen isActive={activeScreen === 'analytics'} />
      <IdentityScreen isActive={activeScreen === 'identity'} />
      <SosScreen isActive={activeScreen === 'sos'} />

      <nav className="fab-nav glass">
        {navItems.map(({ screen, icon: Icon, label }) => (
          <button
            key={screen}
            className={activeScreen === screen ? 'active' : ''}
            onClick={() => handleScreenChange(screen)}
            aria-label={label}
          >
            <Icon size={22} />
          </button>
        ))}
      </nav>
    </main>
  );
};

export default App;
