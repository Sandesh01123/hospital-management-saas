# Installation Guide

## Step 1 — Prerequisites
node --version  (must be >= 18)
npm --version   (must be >= 9)

## Step 2 — Supabase Setup
1. Go to https://supabase.com → Create new project
2. Go to SQL Editor → New Query
3. Copy and paste the entire supabase-schema.sql file
4. Click Run — you should see "Success"
5. Go to Settings → API
6. Copy: Project URL, anon public key, service_role secret key

## Step 3 — Backend Setup
cd hospital_saas/backend
Create .env file with:
  SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
  PORT=5001

npm install
npm run dev

Verify: open http://localhost:5001/health
Expected: { "status": "ok", "timestamp": "..." }

## Step 4 — Frontend Setup
cd hospital_saas/frontend
Create .env file with:
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  NEXT_PUBLIC_BACKEND_URL=http://localhost:5001

npm install
npm run dev

Verify: open http://localhost:3000
Expected: Dashboard loads with 0 values (not errors)

## Step 5 — Test Booking
Go to http://localhost:3000/bookings
Fill in: Name, Phone, Age, Blood Group, Symptoms: "chest pain"
Watch the red EMERGENCY badge appear in real time
Click Book Appointment
Go to Patients tab — the patient should appear

## Troubleshooting

Problem: "Database connection not available"
Fix: Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env

Problem: "No active doctors found"
Fix: Re-run the seed section of supabase-schema.sql

Problem: Frontend shows errors, backend shows CORS
Fix: Ensure backend is running on port 5001, not 5000

Problem: Triage badge not appearing
Fix: Check that 'use client' is at top of bookings/page.tsx

Problem: TypeScript build errors
Fix: cd backend && npm run build to see exact error

Problem: Patients not appearing after booking
Fix: Check RLS policies were applied in supabase-schema.sql

Problem: Settings page not loading
Fix: Ensure default settings row was inserted (check schema seed section)

Problem: npm install fails
Fix: Delete node_modules/ and package-lock.json, then npm install again

Problem: Port 5001 already in use
Fix: Change PORT in backend/.env to 5002 and update frontend .env

Problem: supabase-schema.sql fails
Fix: Run sections one at a time — CREATE EXTENSION first, then tables
