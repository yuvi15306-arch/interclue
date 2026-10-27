# InterClue Cloud Deployment Guide

Follow this guide to deploy the InterClue backend and database to production environments on **Render**, **Railway**, and **Neon PostgreSQL**.

---

## 1. Database Provisioning (Neon PostgreSQL)

1. Sign up or log into [Neon Console](https://neon.tech).
2. Create a new project called `interclue-production`.
3. Copy the Postgres connection string from your dashboard:
   ```env
   DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-sparkling-wave-12345.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Optional: Run the SQL schema script in Neon SQL Editor:
   Copy and execute `database/schema.sql`.

---

## 2. Deploying Backend to Render

1. Go to [Render Dashboard](https://render.com) and click **New + -> Web Service**.
2. Connect your GitHub repository containing `interclue`.
3. Set the following build and start configurations:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. In **Environment Variables**, add:
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
5. Click **Create Web Service**. Render will deploy the API and provide a live URL such as `https://interclue-api.onrender.com`.

---

## 3. Deploying Backend to Railway

1. Install Railway CLI or go to [railway.app](https://railway.app).
2. Click **New Project -> Deploy from GitHub repo**.
3. Add a PostgreSQL plugin (or connect Neon DB string).
4. Set the root directory to `/backend`.
5. Set environment variables identical to Render.
6. Railway will automatically detect FastAPI and launch with Uvicorn.

---

## 4. Cloudinary Setup for Resumes & Audio

1. Register at [Cloudinary](https://cloudinary.com).
2. In Dashboard, copy your **Cloud Name**, **API Key**, and **API Secret**.
3. Supply them to the `CLOUDINARY_*` environment variables.

---

## 5. Google Play Billing Setup

1. In Google Play Console:
   - Create your application: `com.interclue.app`
   - Under **Monetization -> Subscriptions**, add:
     - Product ID: `interclue_pro_monthly` ($19.99/mo)
     - Product ID: `interclue_pro_annual` ($149.99/yr)
2. Setup **Real-time developer notifications (RTDN)**:
   - Create a Google Cloud Pub/Sub topic.
   - Point the notification webhook to `https://interclue-api.onrender.com/subscriptions/webhook`.
