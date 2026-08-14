'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Navigation from '@/components/Navigation'
import { User, Phone, Activity, Stethoscope, CheckCircle } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'

// TRIAGE ENGINE (mirrors backend logic)
function determineTriagePriority(
  symptoms: string,
  temperature?: number,
  bloodPressureSystolic?: number,
  bloodPressureDiastolic?: number,
  spo2?: number
): 'emergency' | 'urgent' | 'normal' {
  const symptomsLower = symptoms.toLowerCase()

  const emergencyKeywords = [
    'chest pain', 'heart attack', 'cardiac arrest', 'severe bleeding',
    'unconscious', 'fainting', 'stroke', 'seizure', 'breathing issue',
    'shortness of breath', 'difficulty breathing', 'severe pain',
    'trauma', 'head injury', 'suicide', 'overdose'
  ]

  for (const keyword of emergencyKeywords) {
    if (symptomsLower.includes(keyword)) {
      return 'emergency'
    }
  }

  if (spo2 !== undefined && spo2 < 94) return 'emergency'
  if (bloodPressureSystolic !== undefined && (bloodPressureSystolic > 180 || bloodPressureSystolic < 90)) return 'emergency'
  if (temperature !== undefined && temperature > 104) return 'emergency'

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

  if (spo2 !== undefined && spo2 >= 94 && spo2 < 96) return 'urgent'
  if (bloodPressureSystolic !== undefined && bloodPressureSystolic >= 140 && bloodPressureSystolic <= 180) return 'urgent'
  if (bloodPressureDiastolic !== undefined && bloodPressureDiastolic >= 90) return 'urgent'
  if (temperature !== undefined && temperature >= 102 && temperature <= 104) return 'urgent'

  return 'normal'
}

export default function BookingsPage() {
  const [formData, setFormData] = useState({
    patient_name: '',
    phone_number: '',
    age: '',
    blood_group: '',
    symptoms_summary: '',
    preferred_date: '',
    preferred_time: '',
    temperature_f: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    pulse_rate: '',
    spo2_percent: ''
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [triageStatus, setTriageStatus] = useState<'emergency' | 'urgent' | 'normal' | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Recalculate triage status when relevant fields change
    if (['symptoms_summary', 'temperature_f', 'blood_pressure_systolic', 'blood_pressure_diastolic', 'pulse_rate', 'spo2_percent'].includes(name)) {
      calculateTriageStatus()
    }
  }

  const calculateTriageStatus = () => {
    const symptoms = formData.symptoms_summary
    const temp = formData.temperature_f ? parseFloat(formData.temperature_f) : undefined
    const bpSys = formData.blood_pressure_systolic ? parseInt(formData.blood_pressure_systolic) : undefined
    const bpDia = formData.blood_pressure_diastolic ? parseInt(formData.blood_pressure_diastolic) : undefined
    const spo2 = formData.spo2_percent ? parseFloat(formData.spo2_percent) : undefined

    if (symptoms) {
      const status = determineTriagePriority(symptoms, temp, bpSys, bpDia, spo2)
      setTriageStatus(status)
    } else {
      setTriageStatus(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to book appointment')
      }

      setSuccess(true)
      setFormData({
        patient_name: '',
        phone_number: '',
        age: '',
        blood_group: '',
        symptoms_summary: '',
        preferred_date: '',
        preferred_time: '',
        temperature_f: '',
        blood_pressure_systolic: '',
        blood_pressure_diastolic: '',
        pulse_rate: '',
        spo2_percent: ''
      })
      setTriageStatus(null)

      setTimeout(() => setSuccess(false), 5000)
    } catch (err: any) {
      setError(err.message || 'Failed to book appointment')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navigation />
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #00d4aa, #2ed573)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '36px', boxShadow: '0 0 40px rgba(0,212,170,0.5)' }}>✓</div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#e2e8f0', marginBottom: '8px' }}>Appointment Booked!</h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '28px' }}>Patient has been registered and appointment confirmed</p>
          <button className="gradient-btn gradient-btn-medical" onClick={() => setSuccess(false)} style={{ padding: '12px 28px' }}>Book Another</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '28px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#e2e8f0', marginBottom: '6px' }}>Book Appointment</h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>AI-powered triage • Auto specialist routing</p>
        </div>

        {/* Triage Status Indicator */}
        {triageStatus && (
          <div style={{ marginBottom: '24px' }}>
            {triageStatus === 'emergency' ? (
              <div style={{ background: 'rgba(255,71,87,0.12)', border: '2px solid rgba(255,71,87,0.6)', borderRadius: '14px', padding: '20px', animation: 'emergency-pulse 1.5s infinite', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>🚨</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#ff4757', marginBottom: '4px' }}>EMERGENCY</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,71,87,0.8)' }}>Immediate medical attention required</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>→ Will be routed to Emergency Department</div>
              </div>
            ) : triageStatus === 'urgent' ? (
              <div style={{ background: 'rgba(255,165,2,0.1)', border: '2px solid rgba(255,165,2,0.4)', borderRadius: '14px', padding: '20px', animation: 'urgent-pulse 2s infinite', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>⚠️</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#ffa502', marginBottom: '4px' }}>URGENT</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,165,2,0.8)' }}>Priority medical attention recommended</div>
              </div>
            ) : (
              <div style={{ background: 'rgba(46,213,115,0.08)', border: '1px solid rgba(46,213,115,0.3)', borderRadius: '14px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>✅</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#2ed573', marginBottom: '4px' }}>NORMAL</div>
                <div style={{ fontSize: '12px', color: 'rgba(46,213,115,0.7)' }}>Routine consultation</div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Information Section */}
          <div className="glass-card">
            <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, rgba(102,126,234,0.15), rgba(118,75,162,0.1))', borderRadius: '12px 12px 0 0', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '20px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#a78bfa' }}>👤 Patient Information</span>
            </div>
            <div style={{ padding: '0 20px 20px' }}>
            
            {/* Patient Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Patient Full Name
              </label>
              <input
                type="text"
                name="patient_name"
                value={formData.patient_name}
                onChange={handleChange}
                required
                className="w-full glass-input px-4 py-3 text-white placeholder-slate-400"
                placeholder="Enter patient name"
              />
            </div>

            {/* Phone Number */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
                className="w-full glass-input px-4 py-3 text-white placeholder-slate-400"
                placeholder="Enter phone number"
              />
            </div>

          {/* Age and Blood Group */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                min="0"
                max="150"
                className="w-full glass-input px-4 py-3 text-white placeholder-slate-400"
                placeholder="Enter age"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Blood Group</label>
              <select
                name="blood_group"
                value={formData.blood_group}
                onChange={handleChange}
                required
                className="w-full glass-input px-4 py-3 text-white"
              >
                <option value="">Select blood group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          {/* Symptoms */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Primary Symptoms
            </label>
            <textarea
              name="symptoms_summary"
              value={formData.symptoms_summary}
              onChange={handleChange}
              required
              rows={4}
              className="w-full glass-input px-4 py-3 text-white placeholder-slate-400 resize-none"
              placeholder="Describe your symptoms..."
            />
            <p className="text-slate-500 text-sm mt-1">Our system will automatically assign you to the appropriate specialist based on your symptoms.</p>
          </div>

          {/* Preferred Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Preferred Date</label>
              <input
                type="date"
                name="preferred_date"
                value={formData.preferred_date}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full glass-input px-4 py-3 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Preferred Time</label>
              <input
                type="time"
                name="preferred_time"
                value={formData.preferred_time}
                onChange={handleChange}
                required
                className="w-full glass-input px-4 py-3 text-white"
              />
            </div>
          </div>
            </div>
          </div>

        {/* Vital Signs Section */}
        <div className="glass-card">
          <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, rgba(0,212,170,0.12), rgba(14,165,233,0.08))', borderRadius: '12px 12px 0 0', borderBottom: '1px solid rgba(0,212,170,0.1)', marginBottom: '20px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#00d4aa' }}>💊 Vital Signs</span>
            <span style={{ fontSize: '11px', color: '#475569', marginLeft: '8px' }}>(Optional — helps triage accuracy)</span>
          </div>
          <div style={{ padding: '0 20px 20px' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Temperature °F</label>
              <input
                type="number"
                name="temperature_f"
                value={formData.temperature_f}
                onChange={handleChange}
                step="0.1"
                min="95"
                max="110"
                className="w-full glass-input px-4 py-3 text-white placeholder-slate-400"
                placeholder="98.6"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">BP Systolic</label>
              <input
                type="number"
                name="blood_pressure_systolic"
                value={formData.blood_pressure_systolic}
                onChange={handleChange}
                min="70"
                max="200"
                className="w-full glass-input px-4 py-3 text-white placeholder-slate-400"
                placeholder="120"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">BP Diastolic</label>
              <input
                type="number"
                name="blood_pressure_diastolic"
                value={formData.blood_pressure_diastolic}
                onChange={handleChange}
                min="40"
                max="120"
                className="w-full glass-input px-4 py-3 text-white placeholder-slate-400"
                placeholder="80"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Pulse bpm</label>
              <input
                type="number"
                name="pulse_rate"
                value={formData.pulse_rate}
                onChange={handleChange}
                min="40"
                max="180"
                className="w-full glass-input px-4 py-3 text-white placeholder-slate-400"
                placeholder="72"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">SpO2 %</label>
              <input
                type="number"
                name="spo2_percent"
                value={formData.spo2_percent}
                onChange={handleChange}
                min="70"
                max="100"
                step="0.1"
                className="w-full glass-input px-4 py-3 text-white placeholder-slate-400"
                placeholder="98"
              />
            </div>
          </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="gradient-btn gradient-btn-medical"
            style={{ width: '100%', padding: '16px', fontSize: '15px', borderRadius: '14px', marginTop: '24px' }}
          >
            {loading ? '⏳ Processing...' : '📅 Book Appointment'}
          </button>
        </form>
      </div>
    </div>
  )
}
