# PedalUp — Thapar Institute Cycle Bazaar

PedalUp is a complete, full-stack, deployable campus cycle resale marketplace designed specifically for **Thapar Institute of Engineering and Technology** (TIET) students. 

This platform allows verified students to buy, sell, and list pre-loved bicycles in a safe, campus-contained environment.

## 🚲 Key Features

* **Strict Domain Verification:** Sign-up is locked to `@thapar.edu` college email addresses. Only verified TIET members can access the marketplace.
* **Full-Featured Search & Filters:** Search for cycles, filter by type (Hybrid, Mountain, Road, etc.), condition, pickup hostel, price range, and sort results.
* **Realtime Chat Inbox:** Buy/sell communication using Supabase Realtime subscriptions. In-app message threads allow instant hand-over negotiations.
* **Direct Image Uploads:** client-side automatic image compression (caps uploads at <=1MB) directly to public Supabase Storage buckets.
* **Personal Dashboard ("My Bazaar"):** Manage active, sold, and saved listings.
* **Listing Reports:** Reporting logs to flag spam, theft, or fake listings.

## 🛠 Tech Stack

* **Frontend:** Next.js 14 (App Router) + Tailwind CSS + Lucide Icons
* **Backend:** Supabase (Auth, PostgreSQL DB, Storage, Realtime Pub/Sub)
* **Hosting:** Vercel

## 🚀 Setup & Launch

Check [DEPLOYMENT.md](file:///C:/Users/taran/.gemini/antigravity/scratch/pedalup/DEPLOYMENT.md) for step-by-step instructions.

```bash
# Install dependencies
npm install

# Run locally
npm run dev
```
# Pedal_up
