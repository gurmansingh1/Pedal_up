# PedalUp — Deployment Guide

Follow this guide step-by-step to configure Supabase, set up environment variables, test the app locally, and deploy it live on Vercel.

---

## Step 1: Create Supabase Project

1. Go to [Supabase Console](https://supabase.com) and click **New Project**.
2. Name the project **PedalUp**, configure your database password, select the closest region, and hit **Create**.
3. Wait for the database provisioning to complete.

---

## Step 2: Initialize Database Schema

1. In the Supabase Sidebar, go to **SQL Editor** → click **New query**.
2. Open the local file [supabase/schema.sql](file:///C:/Users/taran/.gemini/antigravity/scratch/pedalup/supabase/schema.sql) and copy the entire SQL script content.
3. Paste it into the query editor and click **Run**.
4. You should see a confirmation that all tables, indexes, row-level security (RLS) policies, and new-user triggers were created successfully.

---

## Step 3: Configure Storage Bucket

1. In the Supabase Sidebar, click **Storage**.
2. Click **New bucket**.
3. Set the Name to exactly `listing-images`.
4. Make sure to toggle **Public** to **ON** (Public-read capability).
5. Click **Save**.
6. Go back to the **SQL Editor** → click **New query**.
7. Copy the contents of the local file [supabase/storage.sql](file:///C:/Users/taran/.gemini/antigravity/scratch/pedalup/supabase/storage.sql), paste it into the editor, and click **Run** to set RLS rules for the storage bucket.

---

## Step 4: Configure Supabase Auth Emails (Optional but Recommended)

Since this app uses email OTP to verify Thapar students:
1. In the Supabase Sidebar, go to **Project Settings** → **Auth**.
2. Under **Email Templates** → **Confirmation Signup / Magic Link**:
   - Customize the template text (e.g. adding Thapar branding details).
3. Once Vercel deployment is completed, update the **Site URL** in Auth Settings to your production `.vercel.app` domain so login redirects work correctly.

---

## Step 5: Configure Local Environment

1. Duplicate `.env.local.example` and name the file `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
2. Retrieve your Supabase settings from **Project Settings** → **API**:
   - Set `NEXT_PUBLIC_SUPABASE_URL` to your project's URL.
   - Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` to your `anon` public key.
3. Confirm that the configuration is locked to Thapar details:
   - `NEXT_PUBLIC_COLLEGE_DOMAIN=thapar.edu`
   - `NEXT_PUBLIC_COLLEGE_NAME=Thapar Institute of Engineering and Technology`

---

## Step 6: Test Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your web browser.
4. Try to sign up with a test email like `student@thapar.edu`:
   - Enforce domain checks will allow the request.
   - Retrieve the magic link/OTP code from your Supabase Dashboard's **Auth** tab logs (or check email inboxes if real SMTP is set up).
   - Complete the onboarding steps.
5. Create a listing, verify images upload correctly, and check the dashboard filters.

---

## Step 7: Push to GitHub & Deploy on Vercel

1. Initialize a git repository and commit the code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of PedalUp"
   ```
2. Push the codebase to a new repository on GitHub.
3. Open [Vercel Dashboard](https://vercel.com) and click **Add New** → **Project**.
4. Import your GitHub repository.
5. Under **Environment Variables**, add the variables from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_COLLEGE_DOMAIN` (set to `thapar.edu`)
   - `NEXT_PUBLIC_COLLEGE_NAME`
   - `NEXT_PUBLIC_COLLEGE_SHORT`
6. Click **Deploy**. Vercel will build the Next.js bundle and provide a live URL!
