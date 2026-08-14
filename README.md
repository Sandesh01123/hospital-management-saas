# Hospital Management SaaS

## Overview
A production-ready Hospital Management SaaS with AI triage engine,
Electronic Health Records (EHR), patient management, billing, and
white-label configuration. Built for private hospitals and clinic
chains in India.

## Features
- AI Triage Engine: emergency/urgent/normal via 30+ symptom keywords + vitals
- Symptom → 10-department specialization auto-routing
- Patient registration with phone-number upsert (no duplicates)
- Doctor auto-assignment with time-slot conflict detection
- Vital signs tracking (SpO2, BP, temperature, pulse) — longitudinal
- Electronic Health Records per patient
- Billing management (Pending/Paid/Cancelled) with GST calculation
- Bed management (ICU/Emergency/General/Private)
- White-label settings (name, logo, colors, API keys)
- Live dashboard with real-time Supabase data and charts
- Patient history modal with vitals timeline

## Tech Stack
- Backend: Node.js + Express + TypeScript (port 5001)
- Frontend: Next.js 14 + TypeScript + Tailwind CSS (port 3000)
- Database: Supabase (PostgreSQL)

## Prerequisites
- Node.js >= 18
- npm >= 9
- Supabase account (free tier works)

## Quick Start
1. Run supabase-schema.sql in Supabase SQL Editor
2. Fill backend/.env and frontend/.env with your Supabase credentials
3. cd backend && npm install && npm run dev
4. cd frontend && npm install && npm run dev
5. Open http://localhost:3000

## Environment Variables

### backend/.env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (from Supabase → Settings → API → service_role)
PORT=5001

### frontend/.env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key (from Supabase → Settings → API → anon)
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |
| POST | /api/appointments | Book appointment (runs triage + routing) |
| GET | /api/appointments | List appointments with filters |
| PATCH | /api/appointments/:id/status | Update appointment status |
| POST | /api/patients | Create patient |
| GET | /api/patients/search | Search patients |
| GET | /api/patients/:id | Get patient by ID |
| GET | /api/patients/:id/history | Full patient history |
| POST | /api/medical-records | Create medical record |
| GET | /api/medical-records | List records |
| PATCH | /api/medical-records/:id/billing | Update billing status |
| GET | /api/settings | Get white-label settings |
| PUT | /api/settings | Update settings |
| POST | /api/settings/logo | Update logo URL |

## Triage Logic
Emergency: chest pain, heart attack, stroke, unconscious, severe bleeding,
  seizure, overdose, SpO2 < 94%, BP > 180 or < 90, Temp > 104°F

Urgent: fracture, migraine, asthma attack, burns, vomiting, allergic reaction,
  SpO2 94–96%, BP systolic 140–180, Temp 102–104°F

Normal: everything else

## Specialization Routing
chest/heart → Cardiology | breath/lung → Pulmonology
fever/cold → General Medicine | child/baby → Pediatrics
skin/rash → Dermatology | bone/joint → Orthopedics
brain/headache → Neurology | stomach/liver → Gastroenterology
eye/vision → Ophthalmology | ear/throat → ENT

## License
MIT
