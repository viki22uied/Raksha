# RakshaSetu — Smart Tourist Safety Monitoring & Incident Response System

Production-ready backend for a tourist safety platform providing real-time monitoring, AI anomaly detection, geofencing, SOS emergency response, and secure identity storage via IPFS/Ethereum.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js + TypeScript |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Real-time | Socket.IO |
| Auth | JWT + bcrypt |
| Validation | Joi |
| File Upload | Multer |
| Blockchain | ethers.js (Ethereum) |
| Storage | IPFS HTTP API |
| Anomaly Detection | LSTM-compatible interface (heuristic fallback) |
| Logging | Pino |
| Scheduling | node-cron |
| Testing | Jest + Supertest |

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your MongoDB URI and JWT secret
```

### Run Development Server

```bash
npm run dev
```

Server starts on `http://localhost:3000`.

### Seed Database

```bash
npm run seed
```

Creates sample users, tourist profiles, geofences, location pings, alerts, SOS events, and analytics snapshots.

**Default credentials:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@raksha.gov.in | password123 |
| Responder | responder1@raksha.gov.in | password123 |
| Tourist | john@example.com | password123 |

### Run Tests

```bash
npm test
```

### Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user profile |

### Tourists
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tourists` | List all tourists |
| GET | `/api/tourists/:id` | Get tourist profile |
| PUT | `/api/tourists/:id` | Update tourist profile |
| POST | `/api/tourists/:id/docs` | Upload identity document |
| GET | `/api/tourists/:id/emergency-packet` | Get emergency packet |

### Location Tracking
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/locations/ping` | Submit single location ping |
| POST | `/api/locations/batch` | Submit batch pings |
| GET | `/api/locations/latest/:touristId` | Get latest location |
| GET | `/api/locations/history/:touristId` | Get location history |

### Geofences
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/geofences` | Create geofence (admin) |
| GET | `/api/geofences` | List geofences |
| GET | `/api/geofences/:id` | Get geofence |
| PUT | `/api/geofences/:id` | Update geofence (admin) |
| DELETE | `/api/geofences/:id` | Delete geofence (admin) |
| POST | `/api/geofences/check` | Check point against zones |

### SOS
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sos/trigger` | Trigger SOS (rate-limited) |
| GET | `/api/sos/events` | List SOS events |

### Alerts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alerts` | List alerts |
| GET | `/api/alerts/:id` | Get alert details |
| POST | `/api/alerts/:id/acknowledge` | Acknowledge alert |
| POST | `/api/alerts/:id/assign` | Assign responder |
| POST | `/api/alerts/:id/escalate` | Escalate alert |
| POST | `/api/alerts/:id/resolve` | Resolve alert |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/realtime` | Real-time metrics |
| GET | `/api/analytics/historical` | Historical snapshots |
| GET | `/api/analytics/overview` | System overview |
| GET | `/api/analytics/zones` | Zone analytics |
| GET | `/api/analytics/alerts` | Alert analytics |
| GET | `/api/analytics/behavior` | Behavior metrics |
| GET | `/api/analytics/performance` | Performance metrics |

### Identity (IPFS + Ethereum)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/identity/create` | Generate DID |
| POST | `/api/identity/upload` | Upload document to IPFS |
| GET | `/api/identity/:touristId` | Get identity documents |
| POST | `/api/identity/:touristId/verify` | Verify identity (admin) |
| GET | `/api/identity/:touristId/emergency-packet` | Emergency identity packet |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Full dashboard data |
| GET | `/api/admin/tourists/live` | Live tourist locations |
| GET | `/api/admin/responders` | Responder status |
| GET | `/api/admin/audit` | Audit log |
| GET | `/api/admin/export` | Export data (JSON/CSV) |
| POST | `/api/admin/assign-responder` | Assign responder to alert |
| POST | `/api/admin/recompute-analytics` | Recompute analytics |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |

## WebSocket Events

Connect via Socket.IO to receive real-time updates:

| Event | Description |
|-------|-------------|
| `tourist:location:update` | Tourist location changed |
| `tourist:sos:triggered` | SOS emergency activated |
| `alert:created` | New alert generated |
| `alert:updated` | Alert status changed |
| `anomaly:detected` | AI anomaly detected |
| `geofence:breach` | Geofence boundary crossed |
| `analytics:updated` | Analytics data refreshed |
| `responder:assigned` | Responder assigned to alert |
| `responder:eta` | Responder ETA updated |
| `admin:dashboard:update` | Dashboard data changed |

## Architecture

```
src/
├── app.ts                    # Express app configuration
├── server.ts                 # Server entry point
├── config/                   # Environment, DB, IPFS, Web3, WebSocket
├── models/                   # Mongoose schemas (10 models)
├── routes/                   # Express route definitions
├── controllers/              # Request handlers
├── services/                 # Business logic layer
├── middlewares/               # Auth, RBAC, validation, rate limiting, errors
├── utils/                    # Geo math, time helpers, constants, logger
├── jobs/                     # Cron jobs (analytics, anomaly, cleanup)
└── scripts/                  # Database seed script
```

## Environment Variables

See `.env.example` for all required variables.

## License

MIT
