# Demo Script — 3.5 Minutes

## Scene 1 — Dashboard (30s)
Open http://localhost:3000
Point to 4 KPI cards: "All live from Supabase."
Point to charts: "Real patient data, not fake."

## Scene 2 — Triage Engine (60s)
Go to /bookings
Fill Name: "Test Patient", Phone: any 10 digits, Age: 45, Blood Group: O+
In Symptoms: type "chest" — watch EMERGENCY badge appear instantly in red
Change to "headache" — watch it change to URGENT in amber
Change to "routine checkup" — watch NORMAL in green
"This runs in real time as the doctor types."
Submit with "chest pain" symptoms. Show success screen.

## Scene 3 — Patient History (30s)
Go to /patients
Find the patient just created. Click "View History"
Show the appointment in the modal with triage badge.
"Complete history per patient — every visit, every vital sign."

## Scene 4 — Billing (30s)
Go to /billing
Show the pending record from the booking.
Click View → show invoice with GST calculation.
Click "Mark as Paid" — show it updates immediately.

## Scene 5 — Settings (30s)
Go to /settings
Change hospital name. Change primary color.
Show the branding tab and API portal tab.
"Full white-label — deploy this as your own product."

## Scene 6 — Docker (optional, 30s)
Show terminal: docker-compose up
Both services start. "One command. Done."

Total: ~3.5 minutes
