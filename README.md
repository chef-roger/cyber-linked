# ⚡ CYBERLINK — Neural Chat Network

A cyberpunk real-time chat application with full CI/CD pipeline.

## Stack

- **Frontend:** React + Vite (cyberpunk UI)
- **Backend:** Node.js + Express + Socket.io
- **Database:** MongoDB
- **Reverse Proxy:** nginx
- **CI/CD:** GitHub Actions → Docker → ghcr.io → VPS

## Features

- 🔐 JWT authentication (login / register)
- 🔍 User search
- 👥 Friend requests & friends list
- 💬 Real-time chat via WebSockets
- ⌨️ Typing indicators
- 🟢 Online presence indicators

## Local Development

```bash
# Clone the repo
git clone https://github.com/YOURUSERNAME/cyberlink.git
cd cyberlink

# Start all services with hot reload
docker compose -f docker-compose.dev.yml up

# App: http://localhost:3000
# API: http://localhost:5000
```

## Production Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the complete step-by-step guide.

**Quick version:**
1. Push to `main` → GitHub Actions runs
2. Images build and push to ghcr.io
3. Server auto-pulls and restarts — live in ~2 minutes

## Project Structure

```
cyberlink/
├── backend/             # Node.js API + Socket.io
│   └── src/
│       ├── models/      # MongoDB schemas
│       ├── routes/      # REST API
│       ├── middleware/  # Auth (JWT)
│       └── socket/      # Real-time events
├── frontend/            # React app
│   └── src/
│       ├── pages/       # Auth, Search, Friends+Chat
│       ├── components/  # Layout, shared UI
│       └── context/     # Auth, Socket providers
├── nginx/               # Reverse proxy config
├── .github/workflows/   # CI/CD pipeline
├── docker-compose.yml   # Production
└── docker-compose.dev.yml # Development
```
