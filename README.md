# Investment Dashboard 📊

A modern web application for tracking S&P 500 and Bitcoin investments with real-time price data, portfolio analytics, and Banco Nacional participation tracking.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-LTS-339933?logo=nodedotjs)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)

## Features

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

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router, Recharts |
| Backend | Node.js, Express |
| Database | MySQL 8.0 |
| Infrastructure | Docker Compose |

## Quick Start

### Prerequisites

- Node.js (LTS version, managed via `.nvmrc`)
- Docker & Docker Compose

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
# Edit .env with your settings (database credentials, API keys if needed)
```

### 3. Start Database

```bash
docker-compose up -d
```

### 4. Initialize Database Schema

```bash
# Connect to MySQL and run the schema
docker exec -i investment-mysql mysql -uroot -prootpassword investments < server/db/schema.sql
```

### 5. Start Development Servers

```bash
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
│   ├── pages/              # Route pages (Dashboard, Charts)
│   ├── services/           # API client
│   └── index.css           # Global styles
├── server/                 # Express backend
│   ├── routes/             # API endpoints
│   ├── services/           # Price fetching services
│   └── db/schema.sql       # Database schema
├── docker-compose.yml      # MySQL container
└── .env.example            # Environment template
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | List all transactions |
| POST | `/api/transactions` | Create transaction |
| PUT | `/api/transactions/:id` | Update transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |
| GET | `/api/portfolio/summary` | Get portfolio analytics |
| GET | `/api/prices/:asset` | Get current price |
| GET | `/api/settings` | Get app settings |
| PUT | `/api/settings` | Update settings |

## License

MIT
