# Changelog

All notable changes to the Hospital Management SaaS project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-08-02

### Added

#### Core Features
- **AI Triage Engine**: Real-time classification with 30+ symptom keywords and vital sign thresholds
  - Emergency classification (chest pain, stroke, unconscious, breathing issues, etc.)
  - Urgent classification (fracture, high fever, allergic reaction, etc.)
  - Normal classification for routine consultations
- **Symptom → Specialization Auto-Routing**: Automatic assignment to 10 medical departments
  - Cardiology, Pulmonology, General Medicine, Pediatrics, Dermatology
  - Orthopedics, Neurology, Gastroenterology, Ophthalmology, ENT
- **Patient Management**: Complete patient registration with phone number upsert
- **Appointment System**: Doctor auto-assignment with conflict detection
- **Vital Signs Tracking**: Longitudinal monitoring (SpO2, BP, temperature, pulse)
- **Electronic Health Records (EHR)**: Diagnoses, prescriptions, medical notes
- **Billing Management**: Payment status tracking (Pending/Paid/Cancelled)
- **Bed Management**: Real-time status for ICU, Emergency, General, Private beds
- **White-label Configuration**: Custom hospital branding (name, logo, colors, API keys)

#### Frontend
- **Dashboard**: Live analytics with real-time Supabase data
  - Total patients count
  - Active consultations (today)
  - Available beds count
  - Pending pharmacy items
  - Patient intake trend (7-day chart)
  - Revenue trend (7-day chart)
- **Book Appointment Page**: Real-time triage badge while typing
- **Patient Records Page**: Search, filter, and history modal
- **Settings Page**: Branding and API configuration tabs
- **Billing Page**: Invoice management and payment tracking
- **Doctors Page**: Doctor scheduling and availability management
- **Reports Page**: Advanced analytics and reporting

#### Backend
- **RESTful API**: 14 endpoints for all operations
- **Rate Limiting**: General and appointment-specific rate limits
- **Input Validation**: Comprehensive validation with express-validator
- **Audit Logging**: Operation tracking for security and compliance
- **Security Headers**: Helmet middleware for enhanced security
- **Environment Validation**: Startup checks for required variables

#### Database
- **7 Tables**: patients, doctors, appointments, vital_signs, medical_records, beds, settings
- **Seed Data**: 10 doctors, 10 beds, default settings
- **Indexes**: Performance indexes on frequently queried columns
- **Row Level Security (RLS)**: Development mode policies
- **Triggers**: Automatic updated_at timestamps

#### Documentation
- **README.md**: Complete project overview and setup guide
- **INSTALLATION.md**: Detailed installation with troubleshooting
- **API_DOCUMENTATION.md**: Full OpenAPI-style API reference
- **ARCHITECTURE.md**: System architecture and data flow diagrams
- **LICENSE**: MIT license

#### DevOps
- **Docker Support**: Dockerfiles for backend and frontend
- **Docker Compose**: Multi-container orchestration
- **CI/CD Pipeline**: GitHub Actions workflow for testing
- **Environment Configuration**: .env.example for easy setup

#### Testing
- **Unit Tests**: Triage engine test suite
- **Integration Tests**: API endpoint testing
- **Jest Configuration**: Complete testing framework setup

#### Security
- **Rate Limiting**: Express-rate-limit middleware
- **Input Validation**: Express-validator rules
- **Audit Logging**: Comprehensive operation tracking
- **Security Headers**: Helmet middleware
- **CORS Configuration**: Proper cross-origin handling
- **Environment Validation**: Startup checks

### Changed

- Initial release - no previous versions

### Deprecated

- None

### Removed

- None

### Fixed

- None

### Security

- All endpoints include input validation
- Rate limiting prevents abuse
- Audit logging tracks critical operations
- Security headers applied via Helmet
- Environment variables validated on startup

---

## [Unreleased]

### Planned

- Twilio SMS integration for appointment reminders
- Lab management module
- Pharmacy management module
- AI-powered diagnosis suggestions
- React Native mobile application
- Multi-hospital SaaS with tenant management
- Advanced reporting and export capabilities
- Real-time notifications via WebSocket
- File upload for medical images and documents
- Integration with external lab systems
- Integration with pharmacy systems

---

**Version:** 1.0.0  
**Release Date:** 2026-08-02
