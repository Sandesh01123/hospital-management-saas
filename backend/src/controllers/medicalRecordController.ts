import { Request, Response } from 'express'
import { supabase } from '../lib/supabaseClient'

/**
 * Creates a new medical record
 * 
 * Creates a medical record with diagnosis, prescription, notes, and billing information.
 * Can be linked to an appointment or created standalone.
 * Defaults billing_status to 'Pending' and amount to 0 if not provided.
 * 
 * @param req - Express request with medical record data in body
 * @param res - Express response
 * @returns 201 with created medical record data, or error response
 */
export async function createMedicalRecord(req: Request, res: Response) {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database connection not available' })
    }

    const { patient_id, appointment_id, diagnosis, prescription, notes, billing_status, amount } = req.body

    const { data, error } = await supabase
      .from('medical_records')
      .insert({
        patient_id,
        appointment_id,
        diagnosis,
        prescription,
        notes,
        billing_status: billing_status || 'Pending',
        amount: amount || 0
      })
      .select()
      .single()

    if (error || !data) {
      return res.status(500).json({ error: 'Failed to create medical record', details: error?.message })
    }

    return res.status(201).json(data)
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}

/**
 * Fetches medical records with optional filtering
 * 
 * Supports filtering by patient_id and billing_status.
 * Joins with patients and appointments tables for complete context.
 * Results ordered by created_at (descending).
 * 
 * @param req - Express request with patient_id and billing_status query parameters
 * @param res - Express response
 * @returns 200 with medical records array, or error response
 */
export async function getMedicalRecords(req: Request, res: Response) {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database connection not available' })
    }

    const { patient_id, billing_status } = req.query

    let query = supabase
      .from('medical_records')
      .select(`
        *,
        patients(patient_name, phone_number),
        appointments(appointment_date, symptoms_summary)
      `)

    if (patient_id) {
      query = query.eq('patient_id', patient_id)
    }
    if (billing_status) {
      query = query.eq('billing_status', billing_status)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch medical records', details: error.message })
    }

    return res.json({ success: true, data })
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}

/**
 * Updates billing status of a medical record
 * 
 * Updates the billing_status field and automatically sets updated_at timestamp.
 * Common transitions: Pending → Paid, or Pending → Cancelled.
 * 
 * @param req - Express request with medical record ID in params and billing_status in body
 * @param res - Express response
 * @returns 200 with updated medical record data, or error response
 */
export async function updateBillingStatus(req: Request, res: Response) {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database connection not available' })
    }

    const { id } = req.params
    const { billing_status } = req.body

    const { data, error } = await supabase
      .from('medical_records')
      .update({ billing_status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      return res.status(500).json({ error: 'Failed to update billing status', details: error?.message })
    }

    return res.json(data)
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}
