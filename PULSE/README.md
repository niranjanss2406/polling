# PULSE – Every Vote. Every Voice. In Real Time.

[![Go Version](https://img.shields.io/badge/Go-1.23+-00ADD8?style=flat&logo=go)](https://golang.org)
[![React Version](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=flat&logo=mongodb)](https://mongodb.com)
[![Redis](https://img.shields.io/badge/Redis-7.2-DC382D?style=flat&logo=redis)](https://redis.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> A production-grade, distributed real-time interactive audience polling platform built for the **HCL GUVI Developer Internship Technical Assessment**.

---

## 🌟 Overview

**PULSE** empowers presenters, educators, event hosts, and teams to create live interactive polls, instantly distribute them via shareable links or dynamically generated QR codes, and watch audience opinions materialize in real time with sub-50ms latency.

Unlike standard polling tools that rely on fragile client polling intervals or heavy polling overhead, **PULSE** is powered by a high-throughput **Go Gin** backend, **Redis atomic counters**, **Redis Pub/Sub** distributed channels, and bidirectional **Gorilla WebSockets**, backed by **MongoDB Atlas** as the permanent source of truth.

---

## 🚀 Key Features

* **⚡ Sub-50ms Live Telemetry**: Votes cast anywhere in the world trigger instantaneous WebSocket fan-out without page reloads.
* **🛡️ Fraud & Duplicate Prevention**: Server-issued anonymous voter tokens combined with MongoDB compound unique indexes guarantee vote integrity.
* **📊 Visual Analytics**: Live animated progress indicators and responsive charts powered by **Recharts**.
* **📱 Instant QR & Sharing**: Built-in SVG/PNG QR code generator, one-click link copy, and Twitter/WhatsApp sharing shortcuts.
* **🎨 SaaS Commercial UI/UX**: Dark navy and violet aesthetic, Linear/Vercel-inspired glassmorphism, responsive navigation drawer, and theme toggling.
* **⏱️ Expiration & Poll Lifecycle**: Automatic deadline countdown, real-time status transitions (`active` / `closed`), and manual toggle switches for poll owners.
* **👥 Live Audience Counter**: Tracks concurrent connected WebSocket viewers in each live room.
* **🔄 Automatic Resync & Fault Tolerance**: If Redis goes cold or experiences a restart, counters are automatically reconstructed from MongoDB vote ground truth.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 (Vite 6 SPA)
- **Styling**: Tailwind CSS 3.4 with custom SaaS navy/violet palettes
- **Routing**: React Router DOM 6
- **HTTP Client**: Axios with automatic JWT interceptors
- **Visuals**: Recharts (dynamic bar charts), Lucide React (vector icons), Canvas Confetti
- **QR Code**: `qrcode.react` SVG generator with download capability

### Backend
- **Language**: Go (Golang 1.23)
- **HTTP Engine**: Gin Web Framework (High performance, low memory footprint)
- **WebSockets**: Gorilla WebSocket (Thread-safe Hub & Client connection management)
- **Authentication**: Stateless JSON Web Tokens (JWT) & bcrypt password hashing
- **Concurrency**: Goroutines, channels, and sync primitives

### Database & Real-Time Engine
- **Primary Database**: MongoDB 7.0 (Official MongoDB Go Driver)
- **In-Memory Cache & Pub/Sub**: Redis 7.2 (`go-redis/v9`) with atomic pipelines (`INCR`, `INCRBY`) and channel subscriptions (`poll:{id}:updates`)

---

## 📁 Project Folder Structure

```
PULSE/
├── frontend/
│   ├── public/               # Favicons, logo SVGs
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/       # Navbar, Footer, Loader, ProtectedRoute
│   │   │   ├── dashboard/    # StatsCard, PollCard, Sidebar
│   │   │   ├── polls/        # PollForm, PollOption, VotingForm, SharePoll
│   │   │   └── results/      # LiveResults, ResultChart, ProgressBar
│   │   ├── pages/            # Landing, Login, Register, Dashboard, MyPolls, PublicPoll, PollResults, NotFound
│   │   ├── context/          # AuthContext (JWT session, Theme state)
│   │   ├── hooks/            # useAuth, usePoll, useWebSocket
│   │   ├── services/         # Axios api instance, authService, pollService, voteService
│   │   ├── utils/            # Date formatters, validators, status checks
│   │   ├── App.jsx           # Application routing tree
│   │   ├── main.jsx          # React DOM entry point
│   │   └── index.css         # Tailwind directives & glassmorphism styles
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
├── backend/
│   ├── config/               # Environment & config loader
│   ├── database/             # MongoDB connection & indexes, Redis connection
│   ├── models/               # User, Poll, Vote, DTO structs
│   ├── repositories/         # Mongo query implementations
│   ├── services/             # Core business logic (Auth, Poll, Vote, Result)
│   ├── controllers/          # HTTP request handlers
│   ├── middleware/           # JWT auth, CORS headers, IP rate limiter
│   ├── websocket/            # Gorilla WS Hub, Client read/write pumps, handler
│   ├── redis/                # Atomic vote counter, event publisher, pub/sub subscriber
│   ├── utils/                # Password bcrypt, JWT token helpers, response formatters
│   ├── tests/                # Unit & integration tests
│   ├── main.go               # Backend entry point & graceful shutdown
│   ├── go.mod
│   ├── go.sum
│   └── .env.example
│
├── docs/
│   ├── architecture.md       # Distributed system architecture design
│   └── api-documentation.md  # Detailed REST & WebSocket API specification
│
├── deployment/
│   ├── Dockerfile.backend    # Multi-stage alpine Go builder
│   ├── Dockerfile.frontend   # Node builder + Nginx production server
│   └── docker-compose.yml    # Complete multi-container orchestration
│
├── README.md
├── LICENSE
└── .gitignore
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- Node.js 18+ and npm
- Go 1.22+ (or bundled portable SDK)
- MongoDB (Local instance or MongoDB Atlas URI)
- Redis (Local instance or Redis Cloud URL)

### 1. Backend Setup

```bash
cd backend

# Copy environment template
cp .env.example .env

# Configure your connection strings in .env:
# MONGODB_URI=mongodb://localhost:27017
# REDIS_URL=localhost:6379
# JWT_SECRET=your_secure_secret_key

# Run tests
go test -v ./tests

# Run server
go run main.go
```
The Go API and WebSocket server will start on `http://localhost:8080`.

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🐳 Docker Orchestration

Run the entire four-tier stack (Frontend, Backend, MongoDB, Redis) with a single command:

```bash
docker-compose -f deployment/docker-compose.yml up --build -d
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:8080/api/health](http://localhost:8080/api/health)
- MongoDB: `localhost:27017`
- Redis: `localhost:6379`

To view logs or stop services:
```bash
docker-compose -f deployment/docker-compose.yml logs -f
docker-compose -f deployment/docker-compose.yml down
```

---

## 🧪 Testing

### Backend Unit & Integration Tests
Run all test suites including authentication, token validation, poll options validation, expiration handling, vote counters, and results calculations:

```bash
cd backend
go test -v ./tests
```

### Real-Time Concurrency Verification (3-Session Test)
1. Open Session A (Browser 1): Log in as creator and create a poll. Open `/results/:id`.
2. Open Session B (Browser 2 / Incognito): Open `/poll/:id` and select Option 1.
3. Open Session C (Browser 3 / Mobile device): Open `/poll/:id`.
4. Cast vote in Session B: Watch Sessions A and C immediately update vote tallies and animated progress bars within ~20ms without browser reload.
5. Cast vote in Session C: Verify update propagates to Session A and Session B instantaneously.

---

## ☁️ Cloud Deployment Guide

### Frontend on Vercel
1. Link your GitHub repository in Vercel.
2. Set Root Directory to `frontend`.
3. Set Build Command to `npm run build` and Output Directory to `dist`.
4. Add Environment Variables:
   - `VITE_API_URL`: Your deployed backend URL (e.g., `https://pulse-api.onrender.com`)
   - `VITE_WS_URL`: Your deployed WebSocket URL (e.g., `wss://pulse-api.onrender.com`)

### Backend on Render / Railway
1. Create a new Web Service pointing to `backend/Dockerfile` or Go runtime.
2. Set environment variables:
   - `MONGODB_URI`: MongoDB Atlas connection string (`mongodb+srv://...`)
   - `REDIS_URL`: Redis Cloud connection string (`redis://default:...`)
   - `JWT_SECRET`: High-entropy random key
   - `FRONTEND_URL`: Your Vercel frontend URL
   - `GIN_MODE`: `release`

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

*Developed with precision for HCL GUVI Technical Evaluation.*

