-- Hospital Management SaaS Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PATIENTS TABLE
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    age INTEGER NOT NULL,
    blood_group VARCHAR(5) CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    address TEXT,
    emergency_contact VARCHAR(20),
    tenant_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DOCTORS TABLE
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_name VARCHAR(255) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    consultation_fee DECIMAL(10, 2) DEFAULT 500.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- APPOINTMENTS TABLE
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    symptoms_summary TEXT NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    triage_status VARCHAR(20) DEFAULT 'normal' CHECK (triage_status IN ('emergency', 'urgent', 'normal')),
    consultation_fee DECIMAL(10, 2) DEFAULT 500.00,
    tenant_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(doctor_id, appointment_date, appointment_time, status)
);

-- VITAL SIGNS TABLE
CREATE TABLE vital_signs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    temperature_f DECIMAL(5, 2) CHECK (temperature_f > 0 AND temperature_f < 120),
    blood_pressure_systolic INTEGER CHECK (blood_pressure_systolic > 50 AND blood_pressure_systolic < 250),
    blood_pressure_diastolic INTEGER CHECK (blood_pressure_diastolic > 30 AND blood_pressure_diastolic < 150),
    pulse_rate INTEGER CHECK (pulse_rate > 30 AND pulse_rate < 200),
    spo2_percent DECIMAL(5, 2) CHECK (spo2_percent >= 70 AND spo2_percent <= 100),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MEDICAL RECORDS TABLE
CREATE TABLE medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    diagnosis TEXT,
    prescription TEXT,
    notes TEXT,
    billing_status VARCHAR(50) DEFAULT 'Pending' CHECK (billing_status IN ('Pending', 'Paid', 'Cancelled')),
    amount DECIMAL(10, 2) DEFAULT 0.00,
    tenant_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BEDS TABLE
CREATE TABLE beds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bed_number VARCHAR(50) UNIQUE NOT NULL,
    bed_type VARCHAR(50) NOT NULL CHECK (bed_type IN ('ICU', 'Emergency', 'General', 'Private')),
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
    floor_number INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SETTINGS TABLE (White-label config)
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_name VARCHAR(255) DEFAULT 'Hospital Management SaaS',
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#0ea5e9',
    secondary_color VARCHAR(7) DEFAULT '#10b981',
    whatsapp_api_token TEXT,
    payment_gateway_credentials JSONB,
    custom_api_keys JSONB,
    tenant_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    ip_address VARCHAR(50),
    user_agent TEXT,
    request_body JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- SEED: 10 DOCTORS
INSERT INTO doctors (doctor_name, specialization, consultation_fee, is_active) VALUES
('Dr. Rajesh Kumar', 'Cardiology', 1000.00, true),
('Dr. Priya Sharma', 'Pediatrics', 800.00, true),
('Dr. Amit Patel', 'General Medicine', 500.00, true),
('Dr. Sunita Reddy', 'Dermatology', 700.00, true),
('Dr. Vikram Singh', 'Orthopedics', 900.00, true),
('Dr. Anjali Gupta', 'Neurology', 1200.00, true),
('Dr. Ramesh Iyer', 'Pulmonology', 850.00, true),
('Dr. Meena Krishnan', 'Gastroenterology', 950.00, true),
('Dr. Sunil Verma', 'Ophthalmology', 600.00, true),
('Dr. Kavita Nair', 'ENT', 750.00, true);

-- SEED: BEDS
INSERT INTO beds (bed_number, bed_type, status, floor_number) VALUES
('ICU-001', 'ICU', 'available', 3),
('ICU-002', 'ICU', 'available', 3),
('ICU-003', 'ICU', 'occupied', 3),
('EMG-001', 'Emergency', 'available', 1),
('EMG-002', 'Emergency', 'available', 1),
('GEN-001', 'General', 'available', 2),
('GEN-002', 'General', 'occupied', 2),
('GEN-003', 'General', 'available', 2),
('PVT-001', 'Private', 'available', 4),
('PVT-002', 'Private', 'available', 4);

-- SEED: DEFAULT SETTINGS
INSERT INTO settings (hospital_name, primary_color, secondary_color)
VALUES ('Hospital Management SaaS', '#0ea5e9', '#10b981');

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_patients_phone ON patients(phone_number);
CREATE INDEX idx_patients_name ON patients(patient_name);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_triage ON appointments(triage_status);
CREATE INDEX idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX idx_medical_records_billing ON medical_records(billing_status);
CREATE INDEX idx_beds_status ON beds(status);
CREATE INDEX idx_vital_signs_patient ON vital_signs(patient_id);
CREATE INDEX idx_vital_signs_appointment ON vital_signs(appointment_id);

-- ROW LEVEL SECURITY
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES (open for development — restrict per user/tenant in production)
CREATE POLICY "Enable all access for development" ON patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for development" ON doctors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for development" ON appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for development" ON medical_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for development" ON beds FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for development" ON settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for development" ON vital_signs FOR ALL USING (true) WITH CHECK (true);

-- AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  ip_address VARCHAR(50),
  user_agent TEXT,
  request_body TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open_dev_audit" ON audit_logs FOR ALL USING (true) WITH CHECK (true);

-- AUTO-UPDATE TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- APPLY TRIGGERS
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_beds_updated_at BEFORE UPDATE ON beds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
