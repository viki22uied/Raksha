import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, BarChart, Bar, CartesianGrid } from 'recharts';

interface AnalyticsScreenProps {
  isActive: boolean;
}

const hourlyData = [
  { time: '06:00', tourists: 120 }, { time: '08:00', tourists: 450 },
  { time: '10:00', tourists: 1200 }, { time: '12:00', tourists: 2100 },
  { time: '14:00', tourists: 2300 }, { time: '16:00', tourists: 1800 },
  { time: '18:00', tourists: 1100 }, { time: '20:00', tourists: 400 },
];

const pieData = [
  { name: 'Virupaksha', value: 450, color: '#3b82f6' },
  { name: 'Vittala', value: 380, color: '#10b981' },
  { name: 'Matanga', value: 150, color: '#f59e0b' },
  { name: 'Others', value: 200, color: '#8b5cf6' },
];

const radarData = [
  { subject: 'Tracking', A: 98, fullMark: 100 },
  { subject: 'LSTM', A: 92, fullMark: 100 },
  { subject: 'SOS Resp', A: 95, fullMark: 100 },
  { subject: 'Blockchain', A: 100, fullMark: 100 },
  { subject: 'Uptime', A: 99, fullMark: 100 },
];

const barData = [
  { name: 'Mon', alerts: 12 }, { name: 'Tue', alerts: 8 }, { name: 'Wed', alerts: 15 },
  { name: 'Thu', alerts: 5 }, { name: 'Fri', alerts: 20 }, { name: 'Sat', alerts: 35 }, { name: 'Sun', alerts: 42 }
];

const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ isActive }) => {
  return (
    <section className={`screen ${isActive ? 'active' : ''}`}>
      <header className="header">
        <div className="header-inner glass">
          <div style={{ flex: 1 }}>
            <div className="eyebrow">Executive Summary</div>
            <div className="title">AI Analytics Command</div>
          </div>
          <button className="icon-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
          </button>
        </div>
      </header>

      <div className="stack" style={{ paddingBottom: 100 }}>
        {/* KPI Row */}
        <div className="grid-2">
          <article className="glass card" style={{ padding: 16 }}>
            <div className="mini-title">LSTM Confidence</div>
            <div className="value" style={{ fontSize: 26, color: '#10b981' }}>94.2%</div>
            <div className="tiny" style={{ marginTop: 4 }}>Real-time inference</div>
          </article>
          <article className="glass card" style={{ padding: 16 }}>
            <div className="mini-title">Total Active IDs</div>
            <div className="value" style={{ fontSize: 26, color: '#3b82f6' }}>1,180</div>
            <div className="tiny" style={{ marginTop: 4 }}>Anchored on Ethereum</div>
          </article>
        </div>

        {/* Area Chart: Crowd Volume */}
        <article className="glass card">
          <div className="label">24h Prediction Model</div>
          <div className="section-title" style={{ marginTop: '4px', marginBottom: '16px' }}>Tourists Volume & Forecast</div>
          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTourists" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="tourists" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTourists)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* Pie Row */}
        <div className="grid-2">
          <article className="glass card" style={{ padding: 16 }}>
             <div className="label">Geospatial Load</div>
             <div style={{ width: '100%', height: 140, marginTop: 8 }}>
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value" stroke="none">
                     {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                   </Pie>
                   <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                 </PieChart>
               </ResponsiveContainer>
             </div>
             <div className="tiny" style={{ textAlign: 'center', marginTop: 4 }}>Density across 4 zones</div>
          </article>
          
          <article className="glass card" style={{ padding: 16 }}>
             <div className="label">System Health</div>
             <div style={{ width: '100%', height: 140, marginTop: 8 }}>
               <ResponsiveContainer width="100%" height="100%">
                 <RadarChart cx="50%" cy="50%" outerRadius={45} data={radarData}>
                   <PolarGrid stroke="#e5e7eb" />
                   <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fill: '#666' }} />
                   <Radar name="Platform" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                 </RadarChart>
               </ResponsiveContainer>
             </div>
             <div className="tiny" style={{ textAlign: 'center', marginTop: 4 }}>End-to-end diagnostic</div>
          </article>
        </div>

        {/* Bar Chart: Alerts */}
        <article className="glass card">
          <div className="label">LSTM Alert Generation</div>
          <div className="section-title" style={{ marginTop: '4px', marginBottom: '16px' }}>Weekly Anomaly Triggers</div>
          <div style={{ width: '100%', height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666' }} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="alerts" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

      </div>
    </section>
  );
};

export default AnalyticsScreen;
