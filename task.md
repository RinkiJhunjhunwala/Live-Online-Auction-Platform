# Live Online Auction Platform - Deployment Checklist

Everything is prepared for production! Follow these steps to deploy the application completely free.

## 1. Push to GitHub
If you haven't already:
```bash
git add .
git commit -m "Ready for production"
git push origin main
```

## 2. Deploy Backend to Render (Free Tier)
1. Go to [Render](https://render.com/) and create a new **Web Service**.
2. Connect your GitHub repository.
3. Keep the **Root Directory** empty (or blank), but configure the following settings:
   - **Environment**: Docker (Render will automatically detect our `backend/Dockerfile` if we moved it. Wait! In Phase 8, we moved `Dockerfile` to `backend/`. So set the root directory to `backend`)
   - **Root Directory**: `backend`
4. Add the following **Environment Variables**:
   - `PORT`: `3000`
   - `FRONTEND_URL`: temporarily leave blank (we will add the Vercel URL here later).
5. Click **Deploy**. When it succeeds, copy the final Render URL (e.g., `https://auction-backend.onrender.com`).

## 3. Deploy Frontend to Vercel (Free Tier)
1. Go to [Vercel](https://vercel.com/) and create a **New Project**.
2. Connect the same GitHub repository.
3. In the "Configure Project" step:
   - **Framework Preset**: Vite
   - **Root Directory**: Select `frontend` (Important!)
4. Next, add an **Environment Variable** exactly matching this key:
   - `VITE_BACKEND_URL`: Paste the Render URL here (e.g., `https://auction-backend.onrender.com`).
5. Click **Deploy**. Vercel will provide you with a frontend domain (e.g., `https://auction-p1.vercel.app`).

## 4. Final Security Tuning (CORS constraints)
1. Go back to your backend **Environment Variables** in Render.
2. Edit the `FRONTEND_URL` and paste your newly created Vercel frontend URL.
3. The Render service will quickly automatically redeploy, restricting Socket.io/API access securely to your specific web portal only!

## Done!
You now have a fully scalable, real-time synchronized live-bidding SPA running exclusively on modern serverless edge architecture. 
