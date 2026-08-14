'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import { UserPlus, UserCheck, UserX, Calendar, Clock, Plus, X, Stethoscope, DollarSign } from 'lucide-react'

interface Doctor {
  id: string
  doctor_name: string
  specialization: string
  consultation_fee: number
  is_active: boolean
  created_at: string
}

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  status: string
  triage_status: string
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [doctorSchedule, setDoctorSchedule] = useState<Appointment[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [scheduleLoading, setScheduleLoading] = useState(false)

  const [newDoctor, setNewDoctor] = useState({
    doctor_name: '',
    specialization: 'General Medicine',
    consultation_fee: 500
  })

  const specializations = [
    'Cardiology',
    'Pulmonology',
    'General Medicine',
    'Pediatrics',
    'Dermatology',
    'Orthopedics',
    'Neurology',
    'Gastroenterology',
    'Ophthalmology',
    'ENT'
  ]

  const fetchDoctors = async () => {
    try {
      const supabase = (await import('@/lib/supabaseClient')).getSupabase()
      if (!supabase) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDoctors(data || [])
    } catch (error) {
      console.error('Error fetching doctors:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDoctorSchedule = async (doctorId: string) => {
    setScheduleLoading(true)
    try {
      const supabase = (await import('@/lib/supabaseClient')).getSupabase()
      if (!supabase) return

      const today = new Date()
      const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0')

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('appointment_date', todayStr)
        .order('appointment_time', { ascending: true })

      if (error) throw error
      setDoctorSchedule(data || [])
    } catch (error) {
      console.error('Error fetching schedule:', error)
    } finally {
      setScheduleLoading(false)
    }
  }

  const toggleDoctorStatus = async (doctorId: string, currentStatus: boolean) => {
    try {
      const supabase = (await import('@/lib/supabaseClient')).getSupabase()
      if (!supabase) return

      const { error } = await supabase
        .from('doctors')
        .update({ is_active: !currentStatus })
        .eq('id', doctorId)

      if (error) throw error
      await fetchDoctors()
    } catch (error) {
      console.error('Error toggling doctor status:', error)
    }
  }

  const addDoctor = async () => {
    try {
      const supabase = (await import('@/lib/supabaseClient')).getSupabase()
      if (!supabase) return

      const { error } = await supabase
        .from('doctors')
        .insert({
          doctor_name: newDoctor.doctor_name,
          specialization: newDoctor.specialization,
          consultation_fee: newDoctor.consultation_fee,
          is_active: true
        })

      if (error) throw error

      setShowAddModal(false)
      setNewDoctor({ doctor_name: '', specialization: 'General Medicine', consultation_fee: 500 })
      await fetchDoctors()
    } catch (error) {
      console.error('Error adding doctor:', error)
    }
  }

  useEffect(() => {
    fetchDoctors()
  }, [])

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="badge-gradient-green">Completed</span>
      case 'in_progress':
        return <span className="badge-gradient-blue">In Progress</span>
      case 'cancelled':
        return <span className="badge-gradient-red">Cancelled</span>
      default:
        return <span className="text-slate-400 bg-slate-500/10 px-2 py-1 rounded-full text-xs font-medium border border-slate-500/30">Scheduled</span>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ml-20 lg:ml-64">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 gradient-text-medical">Doctors Management</h1>
            <p className="text-slate-400">Manage your medical team and schedules</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="gradient-btn-medical flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Doctor
          </button>
        </div>

        {/* Doctors Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {doctors.length === 0 ? (
            <div className="col-span-full glass-card p-12 text-center">
              <Stethoscope className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No doctors found</p>
              <p className="text-slate-500 text-sm mt-2">Add your first doctor to get started</p>
            </div>
          ) : (
            doctors.map((doctor) => (
              <div key={doctor.id} className="glass-card p-6 hover:border-teal-500/30 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl border-2 border-teal-500/30">
                    {doctor.doctor_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                    doctor.is_active 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-red-500/10 text-red-400 border border-red-500/30'
                  }`}>
                    {doctor.is_active ? (
                      <>
                        <UserCheck className="w-3 h-3" />
                        Active
                      </>
                    ) : (
                      <>
                        <UserX className="w-3 h-3" />
                        Inactive
                      </>
                    )}
                  </div>
                </div>

                <h3 className="text-white font-semibold text-lg mb-1">{doctor.doctor_name}</h3>
                <p className="text-slate-400 text-sm mb-4">{doctor.specialization}</p>

                <div className="flex items-center gap-2 mb-4 text-slate-300">
                  <DollarSign className="w-4 h-4 text-teal-400" />
                  <span className="text-lg font-bold gradient-text-gold">₹{doctor.consultation_fee.toLocaleString()}</span>
                  <span className="text-slate-500 text-sm">/ consultation</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedDoctor(doctor)
                      fetchDoctorSchedule(doctor.id)
                    }}
                    className="flex-1 gradient-btn text-sm py-2"
                  >
                    View Schedule
                  </button>
                  <button
                    onClick={() => toggleDoctorStatus(doctor.id, doctor.is_active)}
                    className={`flex-1 text-sm py-2 px-3 rounded-lg transition-colors ${
                      doctor.is_active 
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30' 
                        : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                    }`}
                  >
                    {doctor.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Schedule Modal */}
        {selectedDoctor && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-slide-up">
            <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedDoctor.doctor_name}</h2>
                  <p className="text-slate-400">{selectedDoctor.specialization}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedDoctor(null)
                    setDoctorSchedule([])
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-teal-400" />
                  <h3 className="text-lg font-semibold text-white">Today's Schedule</h3>
                </div>

                {scheduleLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                  </div>
                ) : doctorSchedule.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Clock className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                    <p>No appointments scheduled for today</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {doctorSchedule.map((appointment) => (
                      <div key={appointment.id} className="glass-card p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-teal-400" />
                            <span className="text-white font-medium">{appointment.appointment_time}</span>
                          </div>
                          {getTriageBadge(appointment.triage_status)}
                        </div>
                        <div className="flex items-center justify-between">
                          {getStatusBadge(appointment.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add Doctor Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-slide-up">
            <div className="glass-card max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white">Add New Doctor</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Doctor Name</label>
                  <input
                    type="text"
                    value={newDoctor.doctor_name}
                    onChange={(e) => setNewDoctor({ ...newDoctor, doctor_name: e.target.value })}
                    className="w-full glass-input px-4 py-3 text-white placeholder-slate-400"
                    placeholder="Dr. John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Specialization</label>
                  <select
                    value={newDoctor.specialization}
                    onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                    className="w-full glass-input px-4 py-3 text-white"
                  >
                    {specializations.map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Consultation Fee (₹)</label>
                  <input
                    type="number"
                    value={newDoctor.consultation_fee}
                    onChange={(e) => setNewDoctor({ ...newDoctor, consultation_fee: parseInt(e.target.value) })}
                    className="w-full glass-input px-4 py-3 text-white placeholder-slate-400"
                    placeholder="500"
                  />
                </div>

                <button
                  onClick={addDoctor}
                  className="w-full gradient-btn-medical py-3 font-semibold"
                >
                  Add Doctor
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
