# MarineGuard - Smart Fishing Vessel Monitoring & Safety System

Government of India - Maritime Security Initiative

A production-grade full-stack MERN application for monitoring fishing vessels, catch records, fishing zones, weather alerts, fuel consumption, and regulatory compliance.

## Tech Stack

- **Frontend**: React.js + Vite, Tailwind CSS, Leaflet, Recharts, Socket.IO Client
- **Backend**: Node.js + Express.js, MongoDB + Mongoose, Socket.IO, JWT + bcrypt
- **Maps**: Leaflet + OpenStreetMap
- **Charts**: Recharts
- **Weather**: Open-Meteo API (live, free, no API key)

## Quick Start

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)

### Setup

```bash
# Backend
cd backend
npm install
cp .env.example .env   # Configure your MongoDB URI and JWT secret
npm run seed            # Create initial admin account only

# Frontend
cd frontend
npm install
```

### Run

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Initial Admin Account

After running `npm run seed`:

| Field | Value |
|-------|-------|
| Email | admin@marineguard.gov.in |
| Password | MarineGuard@2024 |
| Role | Marine Authority |

**Change this password immediately after first login.**

## User Registration Flow

1. User registers via the registration portal with official details
2. Account is created in **pending** state
3. Admin reviews and approves/rejects the registration
4. Only approved and active users can log in

## Environment Variables

### Backend (.env)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/marineguard
JWT_SECRET=<generate a strong random string>
JWT_EXPIRE=7d
NODE_ENV=development
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## Features

- Real-time vessel tracking via Socket.IO
- Live weather forecast (Open-Meteo API)
- Interactive fishing zone management
- Catch recording and analytics
- Fuel consumption tracking
- Compliance scoring and monitoring
- Violation detection and management
- Role-based access control
- User approval workflow
- Responsive government-grade UI

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | Public | Register new account |
| POST | /api/auth/login | Public | Login |
| GET | /api/auth/me | Auth | Get current user |
| GET | /api/auth/users | Admin | List all users |
| PUT | /api/auth/users/:id/approve | Admin | Approve user |
| PUT | /api/auth/users/:id/reject | Admin | Reject user |
| GET/POST | /api/vessels | Auth | Manage vessels |
| GET/POST | /api/trips | Auth | Manage trips |
| GET/POST | /api/catches | Auth | Manage catches |
| GET/POST | /api/fuel | Auth | Manage fuel records |
| GET/POST | /api/zones | Admin | Manage fishing zones |
| GET | /api/weather/live | Auth | Live weather |
| GET | /api/weather/forecast | Auth | 7-day forecast |
| GET | /api/weather/alerts | Auth | Weather + auto alerts |
| GET/POST | /api/violations | Auth | Manage violations |
| GET/POST | /api/compliance | Auth | Manage compliance |
| GET | /api/dashboard | Auth | Dashboard statistics |

## Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Import on Vercel
3. Root directory: `frontend`
4. Build: `npm run build`
5. Output: `dist`
6. Env: `VITE_API_URL=https://your-backend.onrender.com`

### Backend (Render)

1. Push to GitHub
2. Create Web Service on Render
3. Root directory: `backend`
4. Build: `npm install`
5. Start: `npm start`
6. Add env variables from `.env.example`

## Project Structure

```
MarineGuard/
├── backend/
│   ├── config/         # Database config
│   ├── controllers/    # Route handlers
│   ├── middleware/      # Auth & error middleware
│   ├── models/         # Mongoose schemas (10 models)
│   ├── routes/         # REST API routes
│   ├── seeds/          # Initial admin setup
│   ├── services/       # Weather + simulation services
│   └── server.js       # Entry point
├── frontend/
│   ├── src/
│   │   ├── context/    # Auth context
│   │   ├── layouts/    # Sidebar layout
│   │   ├── pages/      # 13 pages
│   │   ├── services/   # API + Socket.IO
│   │   └── utils/      # Helpers
│   └── index.html
└── README.md
```
