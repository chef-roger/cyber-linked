# CYBERLINK — Free Production Deployment Guide
### 100% Free · No Credit Card · MongoDB Atlas + Render + Vercel + GitHub Actions

---

## THE FREE STACK

```
GitHub (free)
    │
    ▼ push to main triggers...
GitHub Actions (free — 2,000 min/month)
    │
    ├──▶ Render (free) ─────────── Node.js backend + Socket.io
    │         └── connects to MongoDB Atlas (free 512MB)
    │
    └──▶ Vercel (free) ─────────── React frontend (global CDN)
```

**Every push to `main`:**
1. GitHub Actions runs tests + build check
2. Triggers Render to redeploy the backend (auto pulls latest code)
3. Deploys frontend to Vercel's global CDN

Total cost: **$0/month** forever on free tiers.

> ⚠️ **Free tier caveats:**
> - Render spins down after 15 min of inactivity — first request takes ~30s to wake up (upgrade to $7/mo Starter to avoid this)
> - MongoDB Atlas free: 512MB storage, shared cluster
> - Vercel free: 100GB bandwidth/month, unlimited deployments

---

## STEP 1 — MongoDB Atlas (Database)

### 1.1 Create account & cluster

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → **Try Free**
2. Sign up (Google works)
3. Choose **"Deploy a FREE cluster"** (M0 Sandbox — $0 forever)
4. Select any cloud provider & region (closest to your users)
5. Click **Create** — takes ~3 minutes

### 1.2 Create a database user

In Atlas dashboard → **Database Access** → **Add New Database User**
- Username: `cyberlink`
- Password: click **Autogenerate Secure Password** → **copy and save it**
- Role: **Atlas admin** (or Read/Write to any database)
- Click **Add User**

### 1.3 Allow network access

**Network Access** → **Add IP Address** → **Allow Access from Anywhere** (0.0.0.0/0)

> This is fine for free tier. You can restrict it later.

### 1.4 Get your connection string

**Database** → **Connect** → **Drivers** → Node.js

Copy the URI — it looks like:
```
mongodb+srv://cyberlink:YOUR_PASSWORD@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
```

Replace `<password>` with your actual password. **Save this URI** — you'll need it in the next steps.

---

## STEP 2 — Render (Backend)

### 2.1 Create account

Go to [render.com](https://render.com) → **Get Started for Free** → sign up with GitHub

### 2.2 Create the Web Service

1. Dashboard → **New +** → **Web Service**
2. **Connect a repository** → select your `cyberlink` repo
3. Configure:

| Field | Value |
|-------|-------|
| Name | `cyberlink-backend` |
| Root Directory | `backend` |
| Runtime | `Node` |
| Build Command | `npm ci` |
| Start Command | `npm start` |
| Plan | **Free** |

4. Click **Advanced** → **Add Environment Variable** — add all four:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGO_URI` | `mongodb+srv://cyberlink:PASSWORD@cluster0...` |
| `JWT_SECRET` | any long random string (e.g. `openssl rand -base64 48` output) |
| `CLIENT_URL` | leave blank for now — fill in after Vercel deploy |
| `PORT` | `5000` |

5. Click **Create Web Service**

Render will deploy and give you a URL like:
```
https://cyberlink-backend.onrender.com
```

**Save this URL** — needed for Vercel env vars.

### 2.3 Get the Deploy Hook URL

In your Render service dashboard → **Settings** → scroll to **Deploy Hook**

Click **Generate Deploy Hook** → copy the URL. It looks like:
```
https://api.render.com/deploy/srv-abc123?key=xyz789
```

**Save this URL** — goes into GitHub Secrets next.

---

## STEP 3 — Vercel (Frontend)

### 3.1 Create account

Go to [vercel.com](https://vercel.com) → **Sign Up** → **Continue with GitHub**

### 3.2 Import project

1. Dashboard → **Add New...** → **Project**
2. Select your `cyberlink` repo → **Import**
3. Configure:

| Field | Value |
|-------|-------|
| Framework Preset | **Vite** |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

4. **Environment Variables** → Add:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://cyberlink-backend.onrender.com` |

5. Click **Deploy**

Vercel gives you a URL like:
```
https://cyberlink-abc123.vercel.app
```

Or add a custom domain in Vercel settings (free).

### 3.3 Update Render with the Vercel URL

Go back to Render → your service → **Environment** → edit `CLIENT_URL`:
```
https://cyberlink-abc123.vercel.app
```

Click **Save Changes** — Render redeploys automatically.

### 3.4 Get Vercel credentials for GitHub Actions

You need 3 values from Vercel:

**Token:**
- vercel.com → top-right avatar → **Settings** → **Tokens** → **Create**
- Name: `github-actions`, scope: Full Account → **Create**
- Copy the token

**Org ID + Project ID:**
```bash
# Install Vercel CLI locally
npm i -g vercel

# In your frontend/ folder:
cd frontend
vercel link

# After linking, check .vercel/project.json:
cat .vercel/project.json
# Shows: { "orgId": "team_xxx", "projectId": "prj_xxx" }
```

---

## STEP 4 — GitHub Actions Secrets

Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add all five:

| Secret Name | Value |
|-------------|-------|
| `RENDER_DEPLOY_HOOK_URL` | The hook URL from Render Step 2.3 |
| `VERCEL_TOKEN` | Token from Vercel Step 3.4 |
| `VERCEL_ORG_ID` | From `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | From `.vercel/project.json` |
| `VITE_API_URL` | `https://cyberlink-backend.onrender.com` |

---

## STEP 5 — Push & Watch it Deploy

```bash
# In the cyberlink/ project folder:
git init
git add .
git commit -m "feat: cyberlink chat app"
git branch -M main

# Create repo on github.com first, then:
git remote add origin https://github.com/YOURUSERNAME/cyberlink.git
git push -u origin main
```

Go to **Actions** tab in your repo — watch the pipeline run:

```
✅ Test          (~1 min)
✅ Deploy Backend → Render   (~30s — Render does the rest)
✅ Deploy Frontend → Vercel  (~2 min)
```

Visit your Vercel URL — your app is live. 🎉

---

## STEP 6 — Every Future Deploy

From now on, the workflow is:

```bash
# Make any change to the code
git add .
git commit -m "fix: whatever you changed"
git push
```

GitHub Actions fires automatically → backend and frontend both update within ~3 minutes.

---

## LOCAL DEVELOPMENT

For local dev, the Docker Compose dev stack still works:

```bash
# Requires Docker Desktop
docker compose -f docker-compose.dev.yml up

# App:  http://localhost:3000
# API:  http://localhost:5000
```

Or run without Docker:

```bash
# Terminal 1 — Backend
cd backend
cp ../.env.example .env   # fill in MONGO_URI from Atlas
npm install
npm run dev

# Terminal 2 — Frontend
cd frontend
echo "VITE_API_URL=" > .env.local   # empty = use proxy
npm install
npm run dev
```

---

## TROUBLESHOOTING

| Problem | Fix |
|---------|-----|
| Backend returns 502 | Render may be sleeping — wait 30s and retry. Check Render logs. |
| CORS error in browser | Make sure `CLIENT_URL` in Render env matches your exact Vercel URL |
| Socket.io not connecting | Check `VITE_API_URL` in Vercel env vars matches your Render URL |
| MongoDB connection failed | Check `MONGO_URI` in Render env. Make sure Atlas allows 0.0.0.0/0 |
| Vercel deploy fails | Check `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` secrets |
| Render deploy not triggering | Verify the deploy hook URL is correct in `RENDER_DEPLOY_HOOK_URL` |
| Frontend shows blank page | Check browser console. Usually a missing `VITE_API_URL` env var. |

---

## UPGRADE PATH (when you outgrow free)

| Service | Free | Paid | What you get |
|---------|------|------|-------------|
| Render | Sleeps after 15min | $7/mo Starter | Always-on, faster |
| MongoDB Atlas | 512MB shared | $9/mo M10 | Dedicated, more storage |
| Vercel | 100GB bandwidth | $20/mo Pro | More bandwidth, team features |

---

## SECRETS SUMMARY

| Where | Secret | What |
|-------|--------|------|
| GitHub Secrets | `RENDER_DEPLOY_HOOK_URL` | Triggers Render redeploy |
| GitHub Secrets | `VERCEL_TOKEN` | Vercel auth |
| GitHub Secrets | `VERCEL_ORG_ID` | Your Vercel org |
| GitHub Secrets | `VERCEL_PROJECT_ID` | Your Vercel project |
| GitHub Secrets | `VITE_API_URL` | Backend URL for build |
| Render Env Vars | `MONGO_URI` | MongoDB Atlas URI |
| Render Env Vars | `JWT_SECRET` | Token signing secret |
| Render Env Vars | `CLIENT_URL` | Vercel frontend URL |

*Total monthly cost: $0*
