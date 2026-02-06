# ARTHA Trading Dashboard

A professional-grade AI-powered trading dashboard with real-time ML predictions, paper trading, and portfolio analytics.

![ARTHA Dashboard](docs/dashboard-preview.png)

## 🚀 Features

### Core Features
- **ML Predictions** - Real-time stock predictions using trained CNN models
- **Paper Trading** - Practice trading with $100,000 virtual balance
- **Portfolio Analytics** - Track P&L, positions, and performance metrics
- **Risk Heatmap** - Visualize portfolio correlation and diversification

### Power Features
- **AI Market Context ("The Why Widget")** - AI-generated explanations for market movements
- **Command Palette (⌘K)** - Quick navigation and instant trades
- **Gamified Leaderboard** - Compete with other traders
- **Real-time Data** - Live price updates and WebSocket streaming

## 📂 Project Structure

```
trading_dashboard/
├── backend/                  # FastAPI Backend
│   ├── main.py              # App entry point
│   ├── config.py            # Environment configuration
│   ├── database.py          # SQLAlchemy setup
│   ├── auth.py              # JWT authentication
│   ├── dependencies.py      # FastAPI dependencies
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic schemas
│   ├── repositories/        # Data access layer
│   ├── services/            # Business logic
│   └── routers/             # API endpoints
│
├── frontend/                 # Next.js Frontend
│   ├── app/                 # App Router pages
│   ├── components/          # React components
│   │   ├── layout/         # Header, Sidebar, CommandPalette
│   │   ├── ui/             # StatsCard, Toaster
│   │   └── features/       # PositionsTable, PredictionPanel, etc.
│   ├── hooks/              # TanStack Query hooks
│   ├── lib/                # API client, utilities
│   └── types/              # TypeScript interfaces
│
├── src/                      # ML Model Code
│   ├── inference.py         # Model inference
│   └── data/               # Data preprocessing
│
└── checkpoints/             # Trained model files
```

## 🛠️ Tech Stack

### Backend
- **FastAPI** - High-performance async web framework
- **SQLAlchemy 2.0** - Async ORM with SQLite/PostgreSQL
- **Pydantic v2** - Data validation and settings management
- **JWT (python-jose)** - Secure authentication
- **SlowAPI** - Rate limiting

### Frontend
- **Next.js 14** - React framework with App Router
- **TailwindCSS** - Utility-first styling
- **TanStack Query** - Data fetching and caching
- **Radix UI** - Accessible components
- **CMDK** - Command palette

## 🚦 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at http://localhost:8000
- API Docs: http://localhost:8000/api/docs

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at http://localhost:3000

## 🔑 Environment Variables

### Backend (.env)
```env
ENVIRONMENT=development
DEBUG=true
DATABASE_URL=sqlite+aiosqlite:///./artha.db
JWT_SECRET_KEY=your-secret-key-here
CORS_ORIGINS=["http://localhost:3000"]
INITIAL_PAPER_BALANCE=100000.0
MODEL_CHECKPOINT_PATH=checkpoints/best_multitask_cnn.pt
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get tokens
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Predictions
- `GET /api/stocks` - List available stocks
- `GET /api/predictions/{symbol}` - Get ML prediction
- `GET /api/market-context/{symbol}` - Get AI sentiment
- `GET /api/live-price/{symbol}` - Get current price

### Trading
- `POST /api/trade/buy` - Execute buy order
- `POST /api/trade/sell` - Execute sell order
- `POST /api/trade/quick` - Quick trade command
- `GET /api/trade/positions` - Get positions
- `GET /api/trade/history` - Get trade history

### Portfolio
- `GET /api/portfolio/summary` - Portfolio overview
- `GET /api/portfolio/analysis` - Correlation matrix
- `GET /api/portfolio/performance` - Performance metrics

### Community
- `GET /api/community/leaderboard` - Trader rankings

## 🎨 Design System

The dashboard uses a professional finance terminal theme:

- **Background**: Dark grays (#0a0a0a, #141414, #1f1f1f)
- **Accent**: Blue (#3b82f6)
- **Success**: Green (#22c55e)
- **Danger**: Red (#ef4444)
- **Typography**: Inter (UI), JetBrains Mono (numbers)

## 🔒 Security

- JWT authentication with token refresh
- bcrypt password hashing
- Rate limiting on auth endpoints
- CORS whitelisting
- SQL injection prevention via ORM
- XSS protection in React

## 📜 License

This project is for educational purposes only. Paper trading with virtual money only.

---

Built with ❤️ for the ARTHA Stock Prediction project.
