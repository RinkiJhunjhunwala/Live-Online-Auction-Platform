# Live Online Auction Platform

![Project Status](https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge) ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white) ![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)

A responsive, highly functional real-time bidding application. The architecture is designed to provide users with a near instantaneous, server-synced bidding experience with advanced UI features.

## 🌟 Key Features

- **Real-Time Bidding Engine:** All user connectivity and auction state is managed globally through WebSockets using **Socket.io**.
- **Immutable Clock Syncing:** Custom `useServerNow()` React hook compensates for variable client network delays matching the client's `performance.now()` directly to the Express server clock to prevent user-side auction manipulation.
- **Micro-Animations & Glassmorphism UI:** Built with custom vanilla CSS targeting the exact thresholds of premium UX details (Pulsing critical 10-second timers, gradient overlays).
- **Concurrency Protection:** The server specifically validates active statuses and checks outbid statuses to prevent race-condition anomalies where two participants bid identically at the same millisecond. 
- **Automated Lifecycle Logic:** Background interval handles transitions from `active` → `timeout break` → `auto-restart` seamlessly.

## 🛠 Tech Stack

### Frontend Directory (`/frontend`)
- **Framework:** React + Vite
- **Networking:** Fetch API, Socket.io-Client
- **Routing & State:** React Hooks (`useState`, `useEffect`)
- **Styling:** Custom CSS built with modern glassmorphism design parameters (No bulky libraries).

### Backend Directory (`/backend`)
- **Environment:** Node.js (v18 Alpine)
- **Framework:** Express.js 
- **Websockets:** Socket.io
- **Storage:** Hardened In-Memory Map (Configured specifically to restart loop)
- **Containerization:** Docker (`Dockerfile` setup for Render optimization)

## 🚀 Live Demo URLs (Production)

- **Frontend Application (Vercel):** [https://live-online-auction-platform.vercel.app](https://live-online-auction-platform.vercel.app)
- **Backend API (Render):** [https://live-online-auction-platform.onrender.com](https://live-online-auction-platform.onrender.com)

---

## 💻 Local Development Setup

If you want to clone this repository and test the synchronization locally, follow these steps.

### Prerequisites
- [Node.js](https://nodejs.org/) v18+

### 1. Start the Backend
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Start the local server (runs on localhost:3000)
npm run dev
```

### 2. Start the Frontend
Open a **new terminal tab**.
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Launch Vite (runs on localhost:5173)
npm run dev
```

### 3. Verification & Testing
1. Visit `http://localhost:5173` in your browser.
2. Provide a mock username when prompted.
3. Open a second entirely independent browser tab/window and join with a second alias.
4. Bid! Watch your socket events seamlessly synchronize the timers and bid states across all simulated devices.

## 🔒 Security & CORS

This application uses strict Cross-Origin Resource Sharing validations. Under the current build setup:
- The Render Node.js backend relies on `process.env.CLIENT_URL` to solely whitelist the Vercel frontend.
- The Vercel React frontend leverages `import.meta.env.VITE_BACKEND_URL` to prevent arbitrary rogue API invocations.

## 📄 License
This application is provided under the ISC License. Contact the project administrator for more structural use-case modifications.
