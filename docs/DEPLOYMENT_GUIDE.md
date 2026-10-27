# InterClue Cloud Deployment Guide

Follow this guide to deploy the **Frontend on Vercel** and the **Backend & Database on Render, Railway, and Neon PostgreSQL**.

---

## 1. Deploying Frontend to Vercel

The frontend is an Expo / React Native Web application fully configured for static hosting on Vercel.

### Method A: Connect Git Repo (Recommended)
1. Log into your [Vercel Dashboard](https://vercel.com) and click **Add New -> Project**.
2. Select your `interclue` repository.
3. In **Project Configuration**:
   - **Framework Preset**: Other (or Expo)
   - **Root Directory**: Click `Edit` and select `frontend`
   - **Build Command**: `npx expo export -p web` (or `npm run build`)
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   ```env
   EXPO_PUBLIC_API_URL=https://your-render-backend-url.onrender.com
   ```
5. Click **Deploy**. Vercel will build and host the responsive web app at `https://<your-project>.vercel.app`.

*(Note: If you deploy with Root Directory left at repository root `./`, the root `vercel.json` will automatically orchestrate the frontend build for you!)*

---

## 2. Deploying Backend to Render

The backend is a FastAPI Python application with all database scripts and tests self-contained in `backend/`.

### Method A: 1-Click Render Blueprint (Fastest)
1. Log into [Render Dashboard](https://render.com).
2. Click **New + -> Blueprint**.
3. Connect your `interclue` repository.
4. Render will automatically read `render.yaml` from the repository root, pre-configuring:
   - Root directory: `backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Health check: `/health`
5. Supply your secrets (`DATABASE_URL`, `GEMINI_API_KEY`, etc.) and click **Apply**.

### Method B: Manual Web Service
1. In Render Dashboard, click **New + -> Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Name**: `interclue-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/health`
4. Under **Environment Variables**, configure:
   ```env
   ENVIRONMENT=production
   SECRET_KEY=generate-a-strong-random-64-char-string
   DATABASE_URL=postgresql://user:pass@ep-neon.us-east-2.aws.neon.tech/neondb?sslmode=require
   GEMINI_API_KEY=AIzaSy...your-gemini-key
   GEMINI_MODEL=gemini-1.5-flash
   REDIS_URL=redis://default:pass@redis-host:6379/0 (optional)
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   DEEPGRAM_API_KEY=your_deepgram_key
   ```
5. Click **Create Web Service**. Your API will be live at `https://<service-name>.onrender.com`.

---

## 3. Database Provisioning (Neon PostgreSQL)

1. Sign up or log into [Neon Console](https://neon.tech).
2. Create a new project called `interclue-production`.
3. Copy the Postgres connection string from your dashboard:
   ```env
   DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-sparkling-wave-12345.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Optional: Run the SQL schema script in Neon SQL Editor:
   Copy and execute `backend/database/schema.sql` (and `backend/database/seeds.sql` for demo questions).

---

## 4. Deploying Backend to Railway

1. Install Railway CLI or go to [railway.app](https://railway.app).
2. Click **New Project -> Deploy from GitHub repo**.
3. Add a PostgreSQL plugin (or connect Neon DB string).
4. Set the root directory to `/backend`.
5. Set environment variables identical to Render.
6. Railway detects FastAPI automatically and launches with Uvicorn.

---

## 5. Cloudinary Setup for Resumes & Audio

1. Register at [Cloudinary](https://cloudinary.com).
2. In Dashboard, copy your **Cloud Name**, **API Key**, and **API Secret**.
3. Supply them to the `CLOUDINARY_*` environment variables in your Render backend settings.

---

## 6. Google Play Billing Setup

1. In Google Play Console:
   - Create your application: `com.interclue.app`
   - Under **Monetization -> Subscriptions**, add:
     - Product ID: `interclue_pro_monthly` ($19.99/mo)
     - Product ID: `interclue_pro_annual` ($149.99/yr)
2. Setup **Real-time developer notifications (RTDN)**:
   - Create a Google Cloud Pub/Sub topic.
   - Point the notification webhook to `https://<your-backend>.onrender.com/subscriptions/webhook`.
