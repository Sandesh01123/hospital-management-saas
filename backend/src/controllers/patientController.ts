import { Request, Response } from 'express'
import { supabase } from '../lib/supabaseClient'

/**
 * Creates a new patient record
 * 
 * Creates a patient with demographics and contact information.
 * Phone number must be unique (enforced by database constraint).
 * 
 * @param req - Express request with patient data in body
 * @param res - Express response
 * @returns 201 with created patient data, or error response
 */
export async function createPatient(req: Request, res: Response) {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database connection not available' })
    }

    const { patient_name, phone_number, age, blood_group, address, emergency_contact } = req.body

    const { data, error } = await supabase
      .from('patients')
      .insert({
        patient_name,
        phone_number,
        age,
        blood_group,
        address,
        emergency_contact
      })
      .select()
      .single()

    if (error || !data) {
      return res.status(500).json({ error: 'Failed to create patient', details: error?.message })
    }

    return res.status(201).json(data)
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}

/**
 * Searches patients by name or phone number with optional blood group filter
 * 
 * Performs case-insensitive search on patient_name and phone_number.
 * Joins with appointments table to show recent appointment history.
 * Results ordered by created_at (descending).
 * 
 * @param req - Express request with search and blood_group query parameters
 * @param res - Express response
 * @returns 200 with patients array, or error response
 */
export async function searchPatients(req: Request, res: Response) {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database connection not available' })
    }

    const { search, blood_group } = req.query

    let query = supabase
      .from('patients')
      .select(`
        *,
        appointments(id, appointment_date, appointment_time, triage_status, status)
      `)

    if (search) {
      query = query.or(`patient_name.ilike.%${search}%,phone_number.ilike.%${search}%`)
    }
    if (blood_group) {
      query = query.eq('blood_group', blood_group)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      return res.status(500).json({ error: 'Failed to search patients', details: error.message })
    }

    return res.json({ success: true, data })
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}

/**
 * Fetches a single patient by ID
 * 
 * Returns complete patient profile including demographics and contact information.
 * 
 * @param req - Express request with patient ID in params
 * @param res - Express response
 * @returns 200 with patient data, or 404 if not found
 */
export async function getPatientById(req: Request, res: Response) {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database connection not available' })
    }

    const { id } = req.params

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return res.status(404).json({ error: 'Patient not found', details: error?.message })
    }

    return res.json(data)
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}

/**
 * Fetches complete patient history including appointments and medical records
 * 
 * Runs two separate queries:
 * 1. Appointments with joins to doctors, medical_records, and vital_signs
 * 2. Medical records (standalone, can exist without appointments)
 * Returns combined data structure for complete patient timeline.
 * 
 * @param req - Express request with patient ID in params
 * @param res - Express response
 * @returns 200 with { appointments, medical_records }, or error response
 */
export async function getPatientHistory(req: Request, res: Response) {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database connection not available' })
    }

    const { id } = req.params

    // Query 1: Appointments with joins
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select(`
        *,
        doctors(doctor_name, specialization),
        medical_records(*),
        vital_signs(*)
      `)
      .eq('patient_id', id)
      .order('appointment_date', { ascending: false })

    if (appointmentsError) {
      return res.status(500).json({ error: 'Failed to fetch appointment history', details: appointmentsError.message })
    }

    // Query 2: Medical records
    const { data: medical_records, error: medicalRecordsError } = await supabase
      .from('medical_records')
      .select('*')
      .eq('patient_id', id)
      .order('created_at', { ascending: false })

    if (medicalRecordsError) {
      return res.status(500).json({ error: 'Failed to fetch medical records', details: medicalRecordsError.message })
    }

    return res.json({
      success: true,
      data: {
        appointments: appointments || [],
        medical_records: medical_records || []
      }
    })
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}
