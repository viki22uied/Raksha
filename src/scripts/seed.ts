import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { User } from '../models/User';
import { TouristProfile } from '../models/TouristProfile';
import { GeoFence } from '../models/GeoFence';
import { Alert } from '../models/Alert';
import { SosEvent } from '../models/SosEvent';
import { LocationPing } from '../models/LocationPing';
import { AnalyticsSnapshot } from '../models/AnalyticsSnapshot';
import { ROLES, ALERT_TYPE, ALERT_SEVERITY, ALERT_STATUS, RISK_LEVEL, SOS_STATUS } from '../utils/constants';

async function seed() {
  console.log('🌱 Starting seed...');
  await mongoose.connect(env.MONGO_URI);
  console.log('📦 Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}), TouristProfile.deleteMany({}), GeoFence.deleteMany({}),
    Alert.deleteMany({}), SosEvent.deleteMany({}), LocationPing.deleteMany({}),
    AnalyticsSnapshot.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  const password = await bcrypt.hash('password123', 12);

  // Create users
  const admin = await User.create({ email: 'admin@raksha.gov.in', password, name: 'Admin Kumar', role: ROLES.ADMIN, phone: '+919876543210' });
  const responder1 = await User.create({ email: 'responder1@raksha.gov.in', password, name: 'Raj Sharma', role: ROLES.RESPONDER, phone: '+919876543211' });
  const responder2 = await User.create({ email: 'responder2@raksha.gov.in', password, name: 'Priya Singh', role: ROLES.RESPONDER, phone: '+919876543212' });
  const tourist1 = await User.create({ email: 'john@example.com', password, name: 'John Smith', role: ROLES.TOURIST, phone: '+14155551234' });
  const tourist2 = await User.create({ email: 'emma@example.com', password, name: 'Emma Wilson', role: ROLES.TOURIST, phone: '+447700900123' });
  const tourist3 = await User.create({ email: 'akira@example.com', password, name: 'Akira Tanaka', role: ROLES.TOURIST, phone: '+81312345678' });
  console.log('👤 Users created');

  // Tourist profiles
  await TouristProfile.create([
    {
      userId: tourist1._id, nationality: 'American', passportNumber: 'US123456', gender: 'male', bloodGroup: 'O+',
      emergencyContacts: [{ name: 'Jane Smith', phone: '+14155555678', relationship: 'spouse' }],
      travelStartDate: new Date('2024-12-01'), travelEndDate: new Date('2024-12-15'), accommodation: 'Taj Hotel, Mumbai',
      lastKnownLocation: { lat: 19.076, lng: 72.8777, timestamp: new Date() }, isOnline: true,
    },
    {
      userId: tourist2._id, nationality: 'British', passportNumber: 'GB789012', gender: 'female', bloodGroup: 'A+',
      medicalNotes: 'Allergic to peanuts',
      emergencyContacts: [{ name: 'David Wilson', phone: '+447700900456', relationship: 'father' }],
      travelStartDate: new Date('2024-12-05'), travelEndDate: new Date('2024-12-20'), accommodation: 'ITC Grand, Delhi',
      lastKnownLocation: { lat: 28.6139, lng: 77.209, timestamp: new Date() }, isOnline: true,
    },
    {
      userId: tourist3._id, nationality: 'Japanese', passportNumber: 'JP345678', gender: 'male', bloodGroup: 'B+',
      emergencyContacts: [{ name: 'Yuki Tanaka', phone: '+81367891234', relationship: 'sibling' }],
      travelStartDate: new Date('2024-12-10'), travelEndDate: new Date('2024-12-25'), accommodation: 'Lake Palace, Udaipur',
      lastKnownLocation: { lat: 24.5854, lng: 73.6853, timestamp: new Date() }, isOnline: false,
    },
  ]);
  console.log('🧳 Tourist profiles created');

  // Geofences
  const gf1 = await GeoFence.create({
    name: 'Gateway of India Zone', description: 'Safe tourist zone around Gateway of India, Mumbai',
    polygon: [
      { lat: 18.924, lng: 72.832 }, { lat: 18.924, lng: 72.838 },
      { lat: 18.920, lng: 72.838 }, { lat: 18.920, lng: 72.832 },
    ],
    riskLevel: RISK_LEVEL.SAFE, maxCapacity: 500, currentOccupancy: 120, watchPriority: 3, createdBy: admin._id,
  });
  const gf2 = await GeoFence.create({
    name: 'India Gate Zone', description: 'Safe tourist zone around India Gate, Delhi',
    polygon: [
      { lat: 28.614, lng: 77.228 }, { lat: 28.614, lng: 77.232 },
      { lat: 28.611, lng: 77.232 }, { lat: 28.611, lng: 77.228 },
    ],
    riskLevel: RISK_LEVEL.SAFE, maxCapacity: 1000, currentOccupancy: 340, watchPriority: 5, createdBy: admin._id,
  });
  const gf3 = await GeoFence.create({
    name: 'Restricted Construction Area', description: 'Under construction — restricted access',
    polygon: [
      { lat: 19.080, lng: 72.870 }, { lat: 19.080, lng: 72.875 },
      { lat: 19.077, lng: 72.875 }, { lat: 19.077, lng: 72.870 },
    ],
    riskLevel: RISK_LEVEL.RESTRICTED, watchPriority: 8, createdBy: admin._id,
  });
  console.log('🗺️  Geofences created');

  // Location pings
  const now = Date.now();
  const pings = [];
  for (let i = 0; i < 20; i++) {
    pings.push({
      touristId: tourist1._id, lat: 19.076 + (Math.random() - 0.5) * 0.01,
      lng: 72.8777 + (Math.random() - 0.5) * 0.01, speed: Math.random() * 15,
      heading: Math.random() * 360, battery: 80 - i, altitude: 10,
      accelerometer: { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: 9.8 + Math.random() * 0.5 },
      timestamp: new Date(now - i * 60000), zoneId: gf1._id, zoneName: gf1.name, isInsideSafeZone: true,
    });
  }
  await LocationPing.insertMany(pings);
  console.log('📍 Location pings created');

  // Alerts
  await Alert.create([
    {
      type: ALERT_TYPE.GEOFENCE_BREACH, severity: ALERT_SEVERITY.MEDIUM,
      cause: 'Tourist exited India Gate Zone', touristId: tourist2._id,
      location: { lat: 28.6139, lng: 77.209 }, geofenceId: gf2._id,
      status: ALERT_STATUS.PENDING, timestamp: new Date(now - 3600000),
    },
    {
      type: ALERT_TYPE.SOS, severity: ALERT_SEVERITY.CRITICAL,
      cause: 'SOS triggered by tourist', touristId: tourist1._id,
      location: { lat: 19.076, lng: 72.877 }, status: ALERT_STATUS.ASSIGNED,
      assignedTo: responder1._id, assignedAt: new Date(now - 1800000),
      acknowledgedAt: new Date(now - 2400000), responseTime: 600, timestamp: new Date(now - 3000000),
    },
    {
      type: ALERT_TYPE.ANOMALY, severity: ALERT_SEVERITY.HIGH,
      cause: 'Erratic movement detected', touristId: tourist3._id,
      location: { lat: 24.585, lng: 73.685 }, status: ALERT_STATUS.RESOLVED,
      assignedTo: responder2._id, resolvedAt: new Date(now - 600000), resolvedBy: responder2._id,
      resolutionNotes: 'Tourist was jogging. No threat.', responseTime: 300, resolutionTime: 2400,
      timestamp: new Date(now - 3600000),
    },
  ]);
  console.log('🚨 Alerts created');

  // SOS events
  await SosEvent.create({
    touristId: tourist1._id, location: { lat: 19.076, lng: 72.877 },
    status: SOS_STATUS.ACTIVE, message: 'I need help! Lost in the crowd.',
    battery: 35, timestamp: new Date(now - 3000000),
  });
  console.log('🆘 SOS events created');

  // Analytics snapshot
  await AnalyticsSnapshot.create({
    date: new Date(), period: 'daily', totalTourists: 3, activeTourists: 2, newRegistrations: 1,
    totalAlerts: 3, pendingAlerts: 1, resolvedAlerts: 1,
    alertsByType: { geofence_breach: 1, sos: 1, anomaly: 1 },
    alertsBySeverity: { medium: 1, critical: 1, high: 1 },
    averageResponseTimeSeconds: 450, averageResolutionTimeSeconds: 2400, resolutionRate: 33.3,
    totalAnomalies: 1, anomaliesByType: { erratic_movement: 1 }, averageAnomalyScore: 0.72,
    totalSosEvents: 1, activeSosEvents: 1, falseAlarmRate: 0,
    totalLocationPings: 20, averageSpeed: 7.5, uptime: 99.9,
  });
  console.log('📊 Analytics snapshot created');

  console.log('\n✅ Seed completed successfully!');
  console.log('─────────────────────────────────');
  console.log('Admin:     admin@raksha.gov.in / password123');
  console.log('Responder: responder1@raksha.gov.in / password123');
  console.log('Tourist:   john@example.com / password123');
  console.log('─────────────────────────────────');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => { console.error('Seed failed:', err); process.exit(1); });
