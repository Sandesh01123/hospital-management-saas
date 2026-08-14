# Hospital Management SaaS — API Documentation

Complete API reference for all endpoints in the Hospital Management SaaS system.

**Base URL:** `http://localhost:5001` (development) or your production domain

**Authentication:** Development mode uses no authentication. Production mode should implement JWT or similar.

**Content-Type:** All requests must use `Content-Type: application/json`

---

## Appointments

### POST /api/appointments

Create a new appointment with automatic triage classification and specialist routing.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "patient_name": "string (required, max 255 chars)",
  "phone_number": "string (required, 10-15 digits, + optional)",
  "age": "number (required, 0-150)",
  "blood_group": "string (required, A+, A-, B+, B-, AB+, AB-, O+, O-)",
  "symptoms_summary": "string (required, max 2000 chars)",
  "preferred_date": "string (required, YYYY-MM-DD format)",
  "preferred_time": "string (required, HH:MM format)",
  "temperature_f": "number (optional, 90-115)",
  "blood_pressure_systolic": "number (optional, 50-250)",
  "blood_pressure_diastolic": "number (optional, 30-150)",
  "pulse_rate": "number (optional, 30-200)",
  "spo2_percent": "number (optional, 70-100)"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "id": "uuid",
    "patient_id": "uuid",
    "doctor_id": "uuid",
    "appointment_date": "YYYY-MM-DD",
    "appointment_time": "HH:MM",
    "symptoms_summary": "string",
    "specialization": "string",
    "triage_status": "emergency|urgent|normal",
    "status": "scheduled",
    "consultation_fee": "number",
    "created_at": "ISO-8601 timestamp",
    "updated_at": "ISO-8601 timestamp",
    "patients": {
      "patient_name": "string",
      "phone_number": "string",
      "age": "number",
      "blood_group": "string"
    },
    "doctors": {
      "doctor_name": "string",
      "specialization": "string"
    },
    "triage_status": "emergency|urgent|normal",
    "vital_signs": {
      "temperature_f": "number|null",
      "blood_pressure_systolic": "number|null",
      "blood_pressure_diastolic": "number|null",
      "pulse_rate": "number|null",
      "spo2_percent": "number|null"
    }
  }
}
```

**Error Responses:**
- 400 Bad Request: Missing required fields or invalid data
- 404 Not Found: No active doctors for specialization
- 409 Conflict: Time slot already booked
- 500 Internal Server Error: Database or server error

**Example curl:**
```bash
curl -X POST http://localhost:5001/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patient_name": "John Doe",
    "phone_number": "9876543210",
    "age": 35,
    "blood_group": "O+",
    "symptoms_summary": "chest pain and difficulty breathing",
    "preferred_date": "2026-08-02",
    "preferred_time": "10:00",
    "temperature_f": 99.5,
    "blood_pressure_systolic": 130,
    "blood_pressure_diastolic": 85,
    "pulse_rate": 72,
    "spo2_percent": 95
  }'
```

---

### GET /api/appointments

Fetch appointments with optional filters.

**Query Parameters:**
- `date` (optional): Filter by appointment date (YYYY-MM-DD)
- `status` (optional): Filter by status (scheduled, in_progress, completed, cancelled)
- `doctor_id` (optional): Filter by doctor UUID

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "patient_id": "uuid",
      "doctor_id": "uuid",
      "appointment_date": "YYYY-MM-DD",
      "appointment_time": "HH:MM",
      "symptoms_summary": "string",
      "specialization": "string",
      "triage_status": "emergency|urgent|normal",
      "status": "scheduled|in_progress|completed|cancelled",
      "consultation_fee": "number",
      "created_at": "ISO-8601 timestamp",
      "updated_at": "ISO-8601 timestamp",
      "patients": {
        "patient_name": "string",
        "phone_number": "string",
        "age": "number",
        "blood_group": "string"
      },
      "doctors": {
        "doctor_name": "string",
        "specialization": "string"
      }
    }
  ]
}
```

**Example curl:**
```bash
curl "http://localhost:5001/api/appointments?date=2026-08-02&status=scheduled"
```

---

### PATCH /api/appointments/:id/status

Update appointment status.

**URL Parameters:**
- `id` (required): Appointment UUID

**Request Body:**
```json
{
  "status": "scheduled|in_progress|completed|cancelled"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "patient_id": "uuid",
  "doctor_id": "uuid",
  "appointment_date": "YYYY-MM-DD",
  "appointment_time": "HH:MM",
  "symptoms_summary": "string",
  "specialization": "string",
  "triage_status": "emergency|urgent|normal",
  "status": "updated_status",
  "consultation_fee": "number",
  "created_at": "ISO-8601 timestamp",
  "updated_at": "ISO-8601 timestamp"
}
```

**Example curl:**
```bash
curl -X PATCH http://localhost:5001/api/appointments/uuid-here/status \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

---

## Patients

### POST /api/patients

Create a new patient manually.

**Request Body:**
```json
{
  "patient_name": "string (required, max 255 chars)",
  "phone_number": "string (required, 10-15 digits, unique)",
  "age": "number (required, 0-150)",
  "blood_group": "string (required, A+, A-, B+, B-, AB+, AB-, O+, O-)",
  "address": "string (optional)",
  "emergency_contact": "string (optional)"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "patient_name": "string",
  "phone_number": "string",
  "age": "number",
  "blood_group": "string",
  "address": "string|null",
  "emergency_contact": "string|null",
  "created_at": "ISO-8601 timestamp",
  "updated_at": "ISO-8601 timestamp"
}
```

**Example curl:**
```bash
curl -X POST http://localhost:5001/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "patient_name": "Jane Smith",
    "phone_number": "9876543211",
    "age": 28,
    "blood_group": "A+",
    "address": "123 Main St",
    "emergency_contact": "9876543212"
  }'
```

---

### GET /api/patients/search

Search patients by name or phone number with optional blood group filter.

**Query Parameters:**
- `search` (optional): Search term (matches patient name or phone)
- `blood_group` (optional): Filter by blood group

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "patient_name": "string",
      "phone_number": "string",
      "age": "number",
      "blood_group": "string",
      "address": "string|null",
      "emergency_contact": "string|null",
      "created_at": "ISO-8601 timestamp",
      "updated_at": "ISO-8601 timestamp",
      "appointments": [
        {
          "id": "uuid",
          "appointment_date": "YYYY-MM-DD",
          "appointment_time": "HH:MM",
          "triage_status": "emergency|urgent|normal",
          "status": "string"
        }
      ]
    }
  ]
}
```

**Example curl:**
```bash
curl "http://localhost:5001/api/patients/search?search=John&blood_group=O+"
```

---

### GET /api/patients/:id

Get patient by ID.

**URL Parameters:**
- `id` (required): Patient UUID

**Response (200 OK):**
```json
{
  "id": "uuid",
  "patient_name": "string",
  "phone_number": "string",
  "age": "number",
  "blood_group": "string",
  "address": "string|null",
  "emergency_contact": "string|null",
  "created_at": "ISO-8601 timestamp",
  "updated_at": "ISO-8601 timestamp"
}
```

**Error Response:**
- 404 Not Found: Patient not found

**Example curl:**
```bash
curl http://localhost:5001/api/patients/uuid-here
```

---

### GET /api/patients/:id/history

Get complete patient history including appointments and medical records.

**URL Parameters:**
- `id` (required): Patient UUID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "id": "uuid",
        "patient_id": "uuid",
        "doctor_id": "uuid",
        "appointment_date": "YYYY-MM-DD",
        "appointment_time": "HH:MM",
        "symptoms_summary": "string",
        "specialization": "string",
        "triage_status": "emergency|urgent|normal",
        "status": "string",
        "consultation_fee": "number",
        "created_at": "ISO-8601 timestamp",
        "updated_at": "ISO-8601 timestamp",
        "doctors": {
          "doctor_name": "string",
          "specialization": "string"
        },
        "medical_records": [
          {
            "id": "uuid",
            "patient_id": "uuid",
            "appointment_id": "uuid",
            "diagnosis": "string|null",
            "prescription": "string|null",
            "notes": "string|null",
            "billing_status": "Pending|Paid|Cancelled",
            "amount": "number",
            "created_at": "ISO-8601 timestamp",
            "updated_at": "ISO-8601 timestamp"
          }
        ],
        "vital_signs": [
          {
            "id": "uuid",
            "patient_id": "uuid",
            "appointment_id": "uuid",
            "temperature_f": "number|null",
            "blood_pressure_systolic": "number|null",
            "blood_pressure_diastolic": "number|null",
            "pulse_rate": "number|null",
            "spo2_percent": "number|null",
            "recorded_at": "ISO-8601 timestamp",
            "created_at": "ISO-8601 timestamp"
          }
        ]
      }
    ],
    "medical_records": [
      {
        "id": "uuid",
        "patient_id": "uuid",
        "appointment_id": "uuid|null",
        "diagnosis": "string|null",
        "prescription": "string|null",
        "notes": "string|null",
        "billing_status": "Pending|Paid|Cancelled",
        "amount": "number",
        "created_at": "ISO-8601 timestamp",
        "updated_at": "ISO-8601 timestamp"
      }
    ]
  }
}
```

**Example curl:**
```bash
curl http://localhost:5001/api/patients/uuid-here/history
```

---

## Medical Records

### POST /api/medical-records

Create a new medical record.

**Request Body:**
```json
{
  "patient_id": "uuid (required)",
  "appointment_id": "uuid (optional)",
  "diagnosis": "string (optional)",
  "prescription": "string (optional)",
  "notes": "string (optional)",
  "billing_status": "Pending|Paid|Cancelled (optional, default: Pending)",
  "amount": "number (optional, default: 0)"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "patient_id": "uuid",
  "appointment_id": "uuid|null",
  "diagnosis": "string|null",
  "prescription": "string|null",
  "notes": "string|null",
  "billing_status": "Pending|Paid|Cancelled",
  "amount": "number",
  "created_at": "ISO-8601 timestamp",
  "updated_at": "ISO-8601 timestamp"
}
```

**Example curl:**
```bash
curl -X POST http://localhost:5001/api/medical-records \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "uuid-here",
    "appointment_id": "uuid-here",
    "diagnosis": "Acute bronchitis",
    "prescription": "Amoxicillin 500mg twice daily",
    "notes": "Follow up in 5 days",
    "billing_status": "Pending",
    "amount": 500
  }'
```

---

### GET /api/medical-records

Get medical records with optional filters.

**Query Parameters:**
- `patient_id` (optional): Filter by patient UUID
- `billing_status` (optional): Filter by billing status

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "patient_id": "uuid",
      "appointment_id": "uuid|null",
      "diagnosis": "string|null",
      "prescription": "string|null",
      "notes": "string|null",
      "billing_status": "Pending|Paid|Cancelled",
      "amount": "number",
      "created_at": "ISO-8601 timestamp",
      "updated_at": "ISO-8601 timestamp",
      "patients": {
        "patient_name": "string",
        "phone_number": "string"
      },
      "appointments": {
        "appointment_date": "YYYY-MM-DD",
        "symptoms_summary": "string"
      }
    }
  ]
}
```

**Example curl:**
```bash
curl "http://localhost:5001/api/medical-records?patient_id=uuid-here&billing_status=Pending"
```

---

### PATCH /api/medical-records/:id/billing

Update billing status of a medical record.

**URL Parameters:**
- `id` (required): Medical record UUID

**Request Body:**
```json
{
  "billing_status": "Pending|Paid|Cancelled"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "patient_id": "uuid",
  "appointment_id": "uuid|null",
  "diagnosis": "string|null",
  "prescription": "string|null",
  "notes": "string|null",
  "billing_status": "updated_status",
  "amount": "number",
  "created_at": "ISO-8601 timestamp",
  "updated_at": "ISO-8601 timestamp"
}
```

**Example curl:**
```bash
curl -X PATCH http://localhost:5001/api/medical-records/uuid-here/billing \
  -H "Content-Type: application/json" \
  -d '{"billing_status": "Paid"}'
```

---

## Settings

### GET /api/settings

Get white-label configuration settings.

**Response (200 OK):**
```json
{
  "id": "uuid",
  "hospital_name": "string",
  "logo_url": "string|null",
  "primary_color": "string (hex)",
  "secondary_color": "string (hex)",
  "whatsapp_api_token": "string|null",
  "payment_gateway_credentials": "object|null",
  "custom_api_keys": "object|null",
  "created_at": "ISO-8601 timestamp",
  "updated_at": "ISO-8601 timestamp"
}
```

**Default Response (if no settings exist):**
```json
{
  "hospital_name": "Hospital Management SaaS",
  "logo_url": null,
  "primary_color": "#0ea5e9",
  "secondary_color": "#10b981",
  "whatsapp_api_token": null,
  "payment_gateway_credentials": null,
  "custom_api_keys": {}
}
```

**Example curl:**
```bash
curl http://localhost:5001/api/settings
```

---

### PUT /api/settings

Update white-label configuration settings.

**Request Body:**
```json
{
  "hospital_name": "string (optional)",
  "logo_url": "string (optional)",
  "primary_color": "string (optional, hex format)",
  "secondary_color": "string (optional, hex format)",
  "whatsapp_api_token": "string (optional)",
  "payment_gateway_credentials": "object (optional)",
  "custom_api_keys": "object (optional)"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "hospital_name": "string",
  "logo_url": "string|null",
  "primary_color": "string",
  "secondary_color": "string",
  "whatsapp_api_token": "string|null",
  "payment_gateway_credentials": "object|null",
  "custom_api_keys": "object|null",
  "created_at": "ISO-8601 timestamp",
  "updated_at": "ISO-8601 timestamp"
}
```

**Example curl:**
```bash
curl -X PUT http://localhost:5001/api/settings \
  -H "Content-Type: application/json" \
  -d '{
    "hospital_name": "City Hospital",
    "primary_color": "#ff6b6b",
    "secondary_color": "#4ecdc4"
  }'
```

---

### POST /api/settings/logo

Update hospital logo URL.

**Request Body:**
```json
{
  "logo_url": "string (required, URL or base64)"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "hospital_name": "string",
  "logo_url": "string",
  "primary_color": "string",
  "secondary_color": "string",
  "whatsapp_api_token": "string|null",
  "payment_gateway_credentials": "object|null",
  "custom_api_keys": "object|null",
  "created_at": "ISO-8601 timestamp",
  "updated_at": "ISO-8601 timestamp"
}
```

**Example curl:**
```bash
curl -X POST http://localhost:5001/api/settings/logo \
  -H "Content-Type: application/json" \
  -d '{"logo_url": "https://example.com/logo.png"}'
```

---

## Health Check

### GET /health

Health check endpoint to verify backend is running.

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "ISO-8601 timestamp"
}
```

**Example curl:**
```bash
curl http://localhost:5001/health
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 429 | Too Many Requests (rate limit exceeded) |
| 500 | Internal Server Error |

## Error Response Format

```json
{
  "error": "Error message",
  "details": "Detailed error information (optional)"
}
```

## Rate Limiting

- **General Rate Limit**: 100 requests per 15 minutes per IP
- **Appointment Rate Limit**: 20 appointment requests per 15 minutes per IP

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1627987200
```

## Security Headers

All responses include security headers via Helmet:
- X-Content-Type-Options: nosniff
- X-Frame-Options: deny
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000; includeSubDomains

## CORS Configuration

**Development:** Allows requests from http://localhost:3000 and http://localhost:3001

**Production:** Configure FRONTEND_URL in backend/.env to allow requests from your production domain.

---

**API Version:** 1.0.0  
**Last Updated:** 2026-08-02
