'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import { Search, X, Calendar, Activity, DollarSign, Users } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'

interface Patient {
  id: string
  patient_name: string
  phone_number: string
  age: number
  blood_group: string
  created_at: string
  appointments?: Array<{
    id: string
    appointment_date: string
    appointment_time: string
    triage_status: 'emergency' | 'urgent' | 'normal'
    status: string
  }>
}

interface PatientHistory {
  appointments: any[]
  medical_records: any[]
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [bloodGroupFilter, setBloodGroupFilter] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [patientHistory, setPatientHistory] = useState<PatientHistory | null>(null)
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)

  const fetchPatients = async () => {
    const supabase = (await import('@/lib/supabaseClient')).getSupabase()
    if (!supabase) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*, appointments(id, appointment_date, appointment_time, triage_status, status)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPatients(data || [])
      setFilteredPatients(data || [])
    } catch (error) {
      console.error('Error fetching patients:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPatientHistory = async (patient: Patient) => {
    setHistoryLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/patients/${patient.id}/history`)
      const data = await response.json()
      if (data.success) {
        setPatientHistory(data.data)
      }
    } catch (error) {
      console.error('Error fetching patient history:', error)
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  useEffect(() => {
    let filtered = patients

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(
        patient =>
          patient.patient_name.toLowerCase().includes(lowerSearch) ||
          patient.phone_number.includes(searchTerm)
      )
    }

    if (bloodGroupFilter) {
      filtered = filtered.filter(patient => patient.blood_group === bloodGroupFilter)
    }

    setFilteredPatients(filtered)
  }, [patients, searchTerm, bloodGroupFilter])

  const getTriageBadge = (status: string) => {
    switch (status) {
      case 'emergency':
        return <span className="badge-gradient-red">🔴 Emergency</span>
      case 'urgent':
        return <span className="badge-gradient-amber">🟡 Urgent</span>
      default:
        return <span className="badge-gradient-green">🟢 Normal</span>
    }
  }

  const getBillingBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Paid</span>
      case 'Pending':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">Pending</span>
      case 'Cancelled':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/30">Cancelled</span>
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/30">{status}</span>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ml-20 lg:ml-64">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Patient Medical Records</h1>
          <p className="text-slate-400">Total: {filteredPatients.length} patients</p>
        </div>

        <div className="glass-card p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full glass-input pl-10 pr-4 py-2 text-white placeholder-slate-400"
              />
            </div>
            <select
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
              className="glass-input px-4 py-2 text-white"
            >
              <option value="">All Blood Groups</option>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.length === 0 ? (
            <div className="col-span-full glass-card p-12 text-center">
              <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No patients found</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
              {filteredPatients.map(patient => {
                const avatar = getAvatar(patient.patient_name)
                return (
                  <div key={patient.id} className="glass-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: avatar.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: 'white', flexShrink: 0, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                        {avatar.initials}
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#e2e8f0' }}>{patient.patient_name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{patient.phone_number}</div>
                      </div>
                      {/* triage badge */}
                      {patient.appointments?.[0] && (
                        <span className={patient.appointments[0].triage_status === 'emergency' ? 'badge-gradient-red' : patient.appointments[0].triage_status === 'urgent' ? 'badge-gradient-amber' : 'badge-gradient-green'} style={{ marginLeft: 'auto', fontSize: '10px' }}>
                          {patient.appointments[0].triage_status?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                      <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', color: '#94a3b8' }}>Age: {patient.age}</span>
                      <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', color: '#94a3b8' }}>{patient.blood_group}</span>
                    </div>
                    <button onClick={() => {
                      setSelectedPatient(patient)
                      fetchPatientHistory(patient)
                    }} style={{ width: '100%', padding: '9px', background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.25)', borderRadius: '8px', color: '#00d4aa', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}>
                      View Full History →
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {selectedPatient && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: '#0a0a14', border: '1px solid rgba(0,212,170,0.2)', borderRadius: '20px', width: '680px', maxWidth: '100%', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div className="relative p-6 border-b border-white/10" style={{ background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-2xl border-2 border-teal-500/30">
                      {selectedPatient.patient_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedPatient.patient_name}</h2>
                      <p className="text-slate-300">{selectedPatient.phone_number} • <span className="badge-gradient-blue">{selectedPatient.blood_group}</span></p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPatient(null)
                      setPatientHistory(null)
                    }}
                    className="text-slate-400 hover:text-white transition-colors bg-white/5 p-2 rounded-lg hover:bg-white/10"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]" style={{ background: '#0a0a14' }}>
                {historyLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                  </div>
                ) : patientHistory ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 gradient-text-medical">
                        <Calendar className="w-5 h-5" />
                        Appointment History
                      </h3>
                      {patientHistory.appointments.length === 0 ? (
                        <div className="glass-card p-8 text-center">
                          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                          <p className="text-slate-400">No appointment history</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {patientHistory.appointments.map((appointment: any, index: number) => (
                            <div key={appointment.id} className="glass-card p-6 relative">
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-400 to-blue-500 rounded-l-lg"></div>
                              <div className="flex items-start justify-between mb-4 pl-4">
                                <div>
                                  <p className="text-white font-semibold text-lg">
                                    {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.appointment_time}
                                  </p>
                                  <p className="text-slate-400 text-sm">
                                    {appointment.doctors?.doctor_name} - {appointment.doctors?.specialization}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  {getTriageBadge(appointment.triage_status)}
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    appointment.status === 'completed' ? 'badge-gradient-green' :
                                    appointment.status === 'in_progress' ? 'badge-gradient-blue' :
                                    appointment.status === 'cancelled' ? 'badge-gradient-red' :
                                    'text-slate-400 bg-slate-500/10 border border-slate-500/30'
                                  }`}>
                                    {appointment.status}
                                  </span>
                                </div>
                              </div>
                              <p className="text-slate-300 text-sm mb-4 pl-4">{appointment.symptoms_summary}</p>
                              {appointment.vital_signs && appointment.vital_signs.length > 0 && (
                                <div className="glass-card p-4 pl-4">
                                  <p className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-teal-400" />
                                    Vital Signs
                                  </p>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {appointment.vital_signs[0].temperature_f && (
                                      <div className="text-center">
                                        <div style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: 'rgba(255,165,2,0.15)', color: '#ffa502', border: '1px solid rgba(255,165,2,0.3)', display: 'inline-block', marginBottom: '8px' }}>
                                          🌡️ {appointment.vital_signs[0].temperature_f}°F
                                        </div>
                                        <p className="text-slate-400 text-xs">Temperature</p>
                                      </div>
                                    )}
                                    {appointment.vital_signs[0].blood_pressure_systolic && appointment.vital_signs[0].blood_pressure_diastolic && (
                                      <div className="text-center">
                                        <div style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: 'rgba(102,126,234,0.15)', color: '#a78bfa', border: '1px solid rgba(102,126,234,0.3)', display: 'inline-block', marginBottom: '8px' }}>
                                          💓 {appointment.vital_signs[0].blood_pressure_systolic}/{appointment.vital_signs[0].blood_pressure_diastolic}
                                        </div>
                                        <p className="text-slate-400 text-xs">Blood Pressure</p>
                                      </div>
                                    )}
                                    {appointment.vital_signs[0].pulse_rate && (
                                      <div className="text-center">
                                        <div style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: 'rgba(240,93,251,0.15)', color: '#f093fb', border: '1px solid rgba(240,93,251,0.3)', display: 'inline-block', marginBottom: '8px' }}>
                                          ❤️ {appointment.vital_signs[0].pulse_rate} bpm
                                        </div>
                                        <p className="text-slate-400 text-xs">Pulse Rate</p>
                                      </div>
                                    )}
                                    {appointment.vital_signs[0].spo2_percent && (
                                      <div className="text-center">
                                        <div style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: 'rgba(0,212,170,0.15)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.3)', display: 'inline-block', marginBottom: '8px' }}>
                                          🫁 {appointment.vital_signs[0].spo2_percent}%
                                        </div>
                                        <p className="text-slate-400 text-xs">SpO2</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 gradient-text-medical">
                        <Activity className="w-5 h-5" />
                        Medical Records
                      </h3>
                      {patientHistory.medical_records.length === 0 ? (
                        <div className="glass-card p-8 text-center">
                          <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                          <p className="text-slate-400">No medical records</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {patientHistory.medical_records.map((record: any) => (
                            <div key={record.id} className="glass-card p-6 relative">
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-pink-500 rounded-l-lg"></div>
                              <div className="flex items-start justify-between mb-4 pl-4">
                                <p className="text-slate-400 text-sm">
                                  {new Date(record.created_at).toLocaleDateString()}
                                </p>
                                <div className="flex items-center gap-2">
                                  {getBillingBadge(record.billing_status)}
                                  {record.amount > 0 && (
                                    <span className="gradient-text-gold text-sm font-semibold flex items-center gap-1">
                                      <DollarSign className="w-4 h-4" />
                                      ₹{record.amount.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {record.diagnosis && (
                                <div className="mb-3 pl-4">
                                  <p className="text-slate-400 text-xs mb-1">Diagnosis</p>
                                  <p className="text-white text-sm">{record.diagnosis}</p>
                                </div>
                              )}
                              {record.prescription && (
                                <div className="mb-3 pl-4">
                                  <p className="text-slate-400 text-xs mb-1">Prescription</p>
                                  <p className="text-white text-sm">{record.prescription}</p>
                                </div>
                              )}
                              {record.notes && (
                                <div className="pl-4">
                                  <p className="text-slate-400 text-xs mb-1">Notes</p>
                                  <p className="text-white text-sm">{record.notes}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="glass-card p-8 text-center">
                    <p className="text-slate-400">Failed to load patient history</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
