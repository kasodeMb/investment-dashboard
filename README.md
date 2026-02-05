# Investment Dashboard 📊

A modern web application for tracking S&P 500 and Bitcoin investments with real-time price data, portfolio analytics, and Banco Nacional participation tracking.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-LTS-339933?logo=nodedotjs)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)

## Features

- **Google OAuth Authentication**: Secure login with Google account
- **Multi-User Support**: Each user has their own isolated transactions and settings
- **Remember Me**: Optional persistent sessions that survive browser restarts
- **Transaction Management**: Add, edit, and delete investment transactions
- **Real-time Prices**: Fetches current prices from multiple free APIs (Stooq, CoinGecko)
- **Historical Pricing**: Attempts to fetch price at purchase date with fallback logic
- **Portfolio Analytics**:
  - Total invested, current value, and unrealized gains
  - Compounded annual commission calculations
  - Per-asset breakdown with expandable details
- **Historical Charts**:
  - Price history graphs for S&P 500 and Bitcoin
  - Banco Nacional participation value charts
  - Running average cost visualization
- **Banco Nacional Support**: Track Costa Rican participation funds with custom metrics
- **Premium UI**: Dark theme with glassmorphism design and smooth animations
- **Docker Ready**: Full containerization for easy deployment

## Tech Stack

| Layer          | Technology                             |
| -------------- | -------------------------------------- |
| Frontend       | React 18, Vite, React Router, Recharts |
| Backend        | Node.js, Express, Passport.js, JWT     |
| Database       | MySQL 8.0                              |
| Auth           | Google OAuth 2.0                       |
| Infrastructure | Docker Compose, Nginx                  |

## Quick Start

### Prerequisites

- Node.js (LTS version, managed via `.nvmrc`)
- Docker & Docker Compose
- Google Cloud Console project with OAuth 2.0 credentials

### 1. Clone and Install

```bash
cd investment-dashboard

# Use correct Node version
nvm use

# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your settings:

- Database credentials
- **Google OAuth credentials** (Client ID and Secret from Google Cloud Console)
- JWT secret key

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API" or "Google People API"
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Select "Web application"
6. Add authorized redirect URI: `http://localhost:3001/api/auth/google/callback`
7. Copy Client ID and Client Secret to your `.env` file

### 4. Start with Docker (Recommended)

```bash
# Build and start all services (MySQL, Backend, Frontend)
docker-compose up --build -d

# View logs
docker-compose logs -f
```

Open [http://localhost](http://localhost) in your browser.

### 5. Development Mode (Alternative)

```bash
# Start database
docker-compose up -d mysql

# Initialize database schema
docker exec -i investment-db mysql -uinvestment_user -pinvestment_pass investments < server/db/schema.sql

# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
investment-dashboard/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── context/            # Auth context
│   ├── pages/              # Route pages (Dashboard, Charts, Login)
│   ├── services/           # API client
│   └── index.css           # Global styles
├── server/                 # Express backend
│   ├── middleware/         # Auth middleware
│   ├── routes/             # API endpoints
│   ├── services/           # Price fetching services
│   └── db/schema.sql       # Database schema
├── docker-compose.yml      # Full stack containers
├── Dockerfile              # Frontend container
├── nginx.conf              # Frontend proxy config
└── .env.example            # Environment template
```

## API Endpoints

All endpoints (except auth) require `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint                    | Description           |
| ------ | --------------------------- | --------------------- |
| GET    | `/api/auth/google`          | Initiate Google OAuth |
| GET    | `/api/auth/google/callback` | OAuth callback        |
| GET    | `/api/auth/me`              | Get current user      |
| POST   | `/api/auth/refresh`         | Refresh access token  |
| POST   | `/api/auth/logout`          | Logout user           |

### Protected Resources

| Method | Endpoint                 | Description              |
| ------ | ------------------------ | ------------------------ |
| GET    | `/api/transactions`      | List user's transactions |
| POST   | `/api/transactions`      | Create transaction       |
| PUT    | `/api/transactions/:id`  | Update transaction       |
| DELETE | `/api/transactions/:id`  | Delete transaction       |
| GET    | `/api/portfolio/summary` | Get portfolio analytics  |
| GET    | `/api/prices/current`    | Get current prices       |
| GET    | `/api/settings`          | Get user settings        |
| PUT    | `/api/settings`          | Update user settings     |

## Deployment

For production deployment on a mini PC or server:

1. Update `.env` with production values:

   ```env
   GOOGLE_CALLBACK_URL=http://YOUR_IP:3001/api/auth/google/callback
   FRONTEND_URL=http://YOUR_IP
   JWT_SECRET=your-secure-random-secret
   ```

2. Add the callback URL to Google Cloud Console

3. Deploy:
   ```bash
   docker-compose up --build -d
   ```

## License

MIT
