import { Request, Response } from 'express'
import { supabase } from '../lib/supabaseClient'

/**
 * Determines triage priority based on symptoms and vital signs
 * 
 * Priority order:
 * 1. Emergency keywords (highest priority)
 * 2. Emergency vitals (SpO2 < 94, BP > 180 or < 90, Temp > 104)
 * 3. Urgent keywords
 * 4. Urgent vitals (SpO2 94-96, BP 140-180, DBP ≥ 90, Temp 102-104)
 * 5. Normal (default)
 * 
 * @param symptoms - Patient symptoms description
 * @param temperature - Body temperature in Fahrenheit
 * @param bloodPressureSystolic - Systolic blood pressure
 * @param bloodPressureDiastolic - Diastolic blood pressure
 * @param spo2 - Oxygen saturation percentage
 * @returns Triage classification: 'emergency' | 'urgent' | 'normal'
 */
export function determineTriagePriority(
  symptoms: string,
  temperature?: number,
  bloodPressureSystolic?: number,
  bloodPressureDiastolic?: number,
  spo2?: number
): 'emergency' | 'urgent' | 'normal' {
  const symptomsLower = symptoms.toLowerCase()

  // Emergency keywords - returns 'emergency' if any match found
  const emergencyKeywords = [
    'chest pain', 'heart attack', 'cardiac arrest', 'severe bleeding',
    'unconscious', 'fainting', 'stroke', 'seizure', 'breathing issue',
    'shortness of breath', 'difficulty breathing', 'severe pain',
    'trauma', 'head injury', 'suicide', 'overdose'
  ]

  // Check emergency keywords first (highest priority)
  for (const keyword of emergencyKeywords) {
    if (symptomsLower.includes(keyword)) {
      return 'emergency'
    }
  }

  // Emergency vitals - critical thresholds requiring immediate attention
  // SpO2 below 94% indicates hypoxia
  if (spo2 !== undefined && spo2 < 94) return 'emergency'
  // BP systolic above 180 indicates hypertensive crisis, below 90 indicates hypotension
  if (bloodPressureSystolic !== undefined && (bloodPressureSystolic > 180 || bloodPressureSystolic < 90)) return 'emergency'
  // Temperature above 104°F indicates severe fever/hyperthermia
  if (temperature !== undefined && temperature > 104) return 'emergency'

  // Urgent keywords - returns 'urgent' if any match found
  const urgentKeywords = [
    'fracture', 'broken bone', 'high fever', 'severe pain',
    'dehydration', 'vomiting', 'diarrhea', 'allergic reaction',
    'asthma attack', 'migraine', 'severe headache', 'burns'
  ]

  for (const keyword of urgentKeywords) {
    if (symptomsLower.includes(keyword)) {
      return 'urgent'
    }
  }

  // Urgent vitals - concerning but not immediately life-threatening
  // SpO2 94-96% indicates mild hypoxia
  if (spo2 !== undefined && spo2 >= 94 && spo2 < 96) return 'urgent'
  // BP systolic 140-180 indicates stage 1-2 hypertension
  if (bloodPressureSystolic !== undefined && bloodPressureSystolic >= 140 && bloodPressureSystolic <= 180) return 'urgent'
  // BP diastolic ≥ 90 indicates diastolic hypertension
  if (bloodPressureDiastolic !== undefined && bloodPressureDiastolic >= 90) return 'urgent'
  // Temperature 102-104°F indicates high fever
  if (temperature !== undefined && temperature >= 102 && temperature <= 104) return 'urgent'

  return 'normal'
}

/**
 * Maps symptom keywords to medical specializations
 * 
 * Maps 40+ symptom keywords to 10 medical departments.
 * Falls back to 'General Medicine' if no keyword matches.
 * 
 * Keyword mappings:
 * - Cardiology: chest, heart, pulse, cardiac
 * - Pulmonology: breath, lung, respiratory, asthma
 * - General Medicine: fever, cold, flu, infection
 * - Pediatrics: child, baby, pediatric, infant, kid
 * - Dermatology: skin, rash, acne, dermatology
 * - Orthopedics: bone, joint, fracture, muscle, orthopedic
 * - Neurology: brain, headache, migraine, seizure, neurological
 * - Gastroenterology: stomach, digestive, liver, gastro
 * - Ophthalmology: eye, vision, cataract
 * - ENT: ear, throat, nose, hearing
 */
const symptomSpecializationMap: { [key: string]: string } = {
  'chest': 'Cardiology', 'heart': 'Cardiology', 'pulse': 'Cardiology', 'cardiac': 'Cardiology',
  'breath': 'Pulmonology', 'lung': 'Pulmonology', 'respiratory': 'Pulmonology', 'asthma': 'Pulmonology',
  'fever': 'General Medicine', 'cold': 'General Medicine', 'flu': 'General Medicine', 'infection': 'General Medicine',
  'child': 'Pediatrics', 'baby': 'Pediatrics', 'pediatric': 'Pediatrics', 'infant': 'Pediatrics', 'kid': 'Pediatrics',
  'skin': 'Dermatology', 'rash': 'Dermatology', 'acne': 'Dermatology', 'dermatology': 'Dermatology',
  'bone': 'Orthopedics', 'joint': 'Orthopedics', 'fracture': 'Orthopedics', 'muscle': 'Orthopedics', 'orthopedic': 'Orthopedics',
  'brain': 'Neurology', 'headache': 'Neurology', 'migraine': 'Neurology', 'seizure': 'Neurology', 'neurological': 'Neurology',
  'stomach': 'Gastroenterology', 'digestive': 'Gastroenterology', 'liver': 'Gastroenterology', 'gastro': 'Gastroenterology',
  'eye': 'Ophthalmology', 'vision': 'Ophthalmology', 'cataract': 'Ophthalmology',
  'ear': 'ENT', 'throat': 'ENT', 'nose': 'ENT', 'hearing': 'ENT',
}

/**
 * Determines medical specialization based on symptom keywords
 * 
 * @param symptoms - Patient symptoms description
 * @returns Medical specialization or 'General Medicine' as fallback
 */
function determineSpecialization(symptoms: string): string {
  const symptomsLower = symptoms.toLowerCase()
  for (const [keyword, specialization] of Object.entries(symptomSpecializationMap)) {
    if (symptomsLower.includes(keyword)) {
      return specialization
    }
  }
  return 'General Medicine'
}

/**
 * Creates a new appointment with automatic triage classification and specialist routing
 * 
 * Process:
 * 1. Validates required fields (patient_name, phone_number, age, blood_group, symptoms_summary)
 * 2. Validates vital sign ranges if provided
 * 3. Determines medical specialization based on symptoms
 * 4. Calculates triage priority (emergency/urgent/normal)
 * 5. Upserts patient (updates if exists by phone, creates if new)
 * 6. Assigns first available doctor in specialization
 * 7. Checks for time slot conflicts
 * 8. Creates appointment with all computed data
 * 9. Records vital signs if provided (non-blocking)
 * 
 * @param req - Express request with appointment data in body
 * @param res - Express response
 * @returns 201 with appointment data, or error response
 */
export async function createAppointment(req: Request, res: Response) {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database connection not available' })
    }

    const {
      patient_name,
      phone_number,
      age,
      blood_group,
      symptoms_summary,
      preferred_date,
      preferred_time,
      temperature_f,
      blood_pressure_systolic,
      blood_pressure_diastolic,
      pulse_rate,
      spo2_percent
    } = req.body

    // Required fields validation
    if (!patient_name || !phone_number || !age || !blood_group || !symptoms_summary) {
      return res.status(400).json({ error: 'Missing required fields: patient_name, phone_number, age, blood_group, symptoms_summary' })
    }

    // Vital sign validations
    if (temperature_f !== undefined && (temperature_f <= 0 || temperature_f >= 120)) {
      return res.status(400).json({ error: 'temperature_f must be > 0 and < 120' })
    }
    if (blood_pressure_systolic !== undefined && (blood_pressure_systolic <= 50 || blood_pressure_systolic >= 250)) {
      return res.status(400).json({ error: 'blood_pressure_systolic must be > 50 and < 250' })
    }
    if (blood_pressure_diastolic !== undefined && (blood_pressure_diastolic <= 30 || blood_pressure_diastolic >= 150)) {
      return res.status(400).json({ error: 'blood_pressure_diastolic must be > 30 and < 150' })
    }
    if (pulse_rate !== undefined && (pulse_rate <= 30 || pulse_rate >= 200)) {
      return res.status(400).json({ error: 'pulse_rate must be > 30 and < 200' })
    }
    if (spo2_percent !== undefined && (spo2_percent < 70 || spo2_percent > 100)) {
      return res.status(400).json({ error: 'spo2_percent must be >= 70 and <= 100' })
    }

    // Step 1: Determine specialization
    const specialization = determineSpecialization(symptoms_summary)

    // Step 2: Determine triage status
    const triage_status = determineTriagePriority(
      symptoms_summary,
      temperature_f,
      blood_pressure_systolic,
      blood_pressure_diastolic,
      spo2_percent
    )

    // Step 3: Check if patient exists by phone_number
    const { data: existingPatient, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('phone_number', phone_number)
      .single()

    let patientId: string

    if (existingPatient && !patientError) {
      // Update existing patient
      const { error: updateError } = await supabase
        .from('patients')
        .update({
          patient_name,
          age,
          blood_group,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPatient.id)

      if (updateError) {
        return res.status(500).json({ error: 'Failed to update patient', details: updateError.message })
      }
      patientId = existingPatient.id
    } else {
      // Insert new patient
      const { data: newPatient, error: insertError } = await supabase
        .from('patients')
        .insert({
          patient_name,
          phone_number,
          age,
          blood_group
        })
        .select('id')
        .single()

      if (insertError || !newPatient) {
        return res.status(500).json({ error: 'Failed to create patient', details: insertError?.message })
      }
      patientId = newPatient.id
    }

    // Step 4: Query doctors by specialization
    const { data: doctors, error: doctorsError } = await supabase
      .from('doctors')
      .select('*')
      .eq('specialization', specialization)
      .eq('is_active', true)

    if (doctorsError || !doctors || doctors.length === 0) {
      return res.status(404).json({ error: 'No active doctors found for this specialization' })
    }

    const assignedDoctor = doctors[0]

    // Step 5: Check for time slot conflicts
    const { data: conflicts, error: conflictError } = await supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', assignedDoctor.id)
      .eq('appointment_date', preferred_date)
      .eq('appointment_time', preferred_time)
      .in('status', ['scheduled', 'in_progress'])

    if (conflictError) {
      return res.status(500).json({ error: 'Failed to check for conflicts', details: conflictError.message })
    }

    if (conflicts && conflicts.length > 0) {
      return res.status(409).json({ error: 'Time slot already booked for this doctor' })
    }

    // Step 6: Insert appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        patient_id: patientId,
        doctor_id: assignedDoctor.id,
        appointment_date: preferred_date,
        appointment_time: preferred_time,
        symptoms_summary,
        specialization,
        triage_status,
        status: 'scheduled',
        consultation_fee: assignedDoctor.consultation_fee || 500
      })
      .select(`
        *,
        patients(patient_name, phone_number, age, blood_group),
        doctors(doctor_name, specialization)
      `)
      .single()

    if (appointmentError || !appointment) {
      return res.status(500).json({ error: 'Failed to create appointment', details: appointmentError?.message })
    }

    // Step 7: Insert vital signs if provided
    let vitalSignsData = null
    if (temperature_f !== undefined || blood_pressure_systolic !== undefined ||
        blood_pressure_diastolic !== undefined || pulse_rate !== undefined || spo2_percent !== undefined) {
      const { data: vitalSigns, error: vitalSignsError } = await supabase
        .from('vital_signs')
        .insert({
          patient_id: patientId,
          appointment_id: appointment.id,
          temperature_f,
          blood_pressure_systolic,
          blood_pressure_diastolic,
          pulse_rate,
          spo2_percent,
          recorded_at: new Date().toISOString()
        })
        .select()
        .single()

      if (!vitalSignsError && vitalSigns) {
        vitalSignsData = {
          temperature_f: vitalSigns.temperature_f,
          blood_pressure_systolic: vitalSigns.blood_pressure_systolic,
          blood_pressure_diastolic: vitalSigns.blood_pressure_diastolic,
          pulse_rate: vitalSigns.pulse_rate,
          spo2_percent: vitalSigns.spo2_percent
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: {
        ...appointment,
        triage_status,
        vital_signs: vitalSignsData
      }
    })
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}

/**
 * Fetches appointments with optional filtering
 * 
 * Supports filtering by date, status, and doctor_id.
 * Joins with patients and doctors tables for complete data.
 * Results ordered by appointment_date and appointment_time (ascending).
 * 
 * @param req - Express request with optional query parameters
 * @param res - Express response
 * @returns 200 with appointments array, or error response
 */
export async function getAppointments(req: Request, res: Response) {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database connection not available' })
    }

    const { date, status, doctor_id } = req.query

    let query = supabase
      .from('appointments')
      .select(`
        *,
        patients(patient_name, phone_number, age, blood_group),
        doctors(doctor_name, specialization)
      `)

    if (date) {
      query = query.eq('appointment_date', date)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (doctor_id) {
      query = query.eq('doctor_id', doctor_id)
    }

    query = query.order('appointment_date', { ascending: true }).order('appointment_time', { ascending: true })

    const { data, error } = await query

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch appointments', details: error.message })
    }

    return res.json({ success: true, data })
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}

/**
 * Updates appointment status
 * 
 * Updates the status field and automatically sets updated_at timestamp.
 * Common status transitions: scheduled → in_progress → completed, or scheduled → cancelled
 * 
 * @param req - Express request with appointment ID in params and status in body
 * @param res - Express response
 * @returns 200 with updated appointment data, or error response
 */
export async function updateAppointmentStatus(req: Request, res: Response) {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database connection not available' })
    }

    const { id } = req.params
    const { status } = req.body

    const { data, error } = await supabase
      .from('appointments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      return res.status(500).json({ error: 'Failed to update appointment status', details: error?.message })
    }

    return res.json(data)
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}
