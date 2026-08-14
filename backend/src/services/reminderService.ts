import { supabase } from '../lib/supabaseClient'

/**
 * Reminder service for sending appointment reminders
 * 
 * Currently logs reminders to console for demonstration.
 * Production integration would use:
 * - Twilio for SMS reminders
 * - SendGrid for email reminders
 */

interface AppointmentReminderData {
  patient_name: string
  phone_number: string
  doctor_name: string
  specialization: string
  appointment_date: string
  appointment_time: string
}

/**
 * Sends an appointment reminder
 * 
 * Builds a reminder message and logs it.
 * In production, this would send SMS via Twilio or email via SendGrid.
 * Logs the reminder to audit_logs for compliance.
 * 
 * @param appointment - Appointment data with patient and doctor information
 * @returns Success status with message preview
 */
export async function sendAppointmentReminder(appointment: AppointmentReminderData): Promise<{
  success: boolean
  message: string
  preview: string
}> {
  // Build reminder message
  const message = `Dear ${appointment.patient_name}, your appointment with ${appointment.doctor_name} (${appointment.specialization}) is scheduled on ${appointment.appointment_date} at ${appointment.appointment_time}. Please arrive 15 minutes early. Hospital Management SaaS`

  // Log SMS reminder (connect Twilio to activate)
  console.log('[SMS REMINDER]:', message)
  console.log('[NOTE]: Connect Twilio to activate SMS reminders')

  // Log email reminder (connect SendGrid to activate)
  console.log('[EMAIL REMINDER]:', message)
  console.log('[NOTE]: Connect SendGrid to activate email reminders')

  // Log to audit_logs for compliance
  try {
    if (supabase) {
      await supabase.from('audit_logs').insert({
        action: 'REMINDER_SENT',
        table_name: 'appointments',
        request_body: {
          patient_name: appointment.patient_name,
          phone_number: appointment.phone_number,
          appointment_date: appointment.appointment_date,
          appointment_time: appointment.appointment_time
        },
        ip_address: 'system',
        user_agent: 'reminder-service'
      })
    }
  } catch (error) {
    console.error('Failed to log reminder to audit:', error)
  }

  return {
    success: true,
    message: 'Reminder queued successfully',
    preview: message
  }
}
