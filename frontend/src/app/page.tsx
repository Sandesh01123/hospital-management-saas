'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabaseClient'
import Navigation from '@/components/Navigation'
import { Users, Calendar, Bed, Activity, TrendingUp, DollarSign } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const [totalPatients, setTotalPatients] = useState(0)
  const [activeConsultations, setActiveConsultations] = useState(0)
  const [availableBeds, setAvailableBeds] = useState(0)
  const [pendingPharmacy, setPendingPharmacy] = useState(0)
  const [patientData, setPatientData] = useState<any[]>([])
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    const supabase = getSupabase()
    if (!supabase) {
      setLoading(false)
      return
    }

    try {
      // 1. Total patients
      const { count: patientCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
      setTotalPatients(patientCount || 0)

      // 2. Active consultations (today)
      const today = new Date().toISOString().split('T')[0]
      const { count: consultationCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('appointment_date', today)
        .in('status', ['scheduled', 'in_progress'])
      setActiveConsultations(consultationCount || 0)

      // 3. Available beds
      const { count: bedCount } = await supabase
        .from('beds')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'available')
      setAvailableBeds(bedCount || 0)

      // 4. Pending pharmacy
      const { count: pharmacyCount } = await supabase
        .from('medical_records')
        .select('*', { count: 'exact', head: true })
        .eq('billing_status', 'Pending')
      setPendingPharmacy(pharmacyCount || 0)

      // 5. Patient intake trend (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const { data: patients } = await supabase
        .from('patients')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString())

      const patientMap = new Map<string, number>()
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        patientMap.set(dateStr, 0)
      }

      patients?.forEach(patient => {
        const dateStr = new Date(patient.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        patientMap.set(dateStr, (patientMap.get(dateStr) || 0) + 1)
      })

      setPatientData(Array.from(patientMap.entries()).map(([date, patients]) => ({ date, patients })))

      // 6. Revenue trend (last 7 days)
      const { data: appointments } = await supabase
        .from('appointments')
        .select('created_at, consultation_fee')
        .gte('created_at', sevenDaysAgo.toISOString())

      const revenueMap = new Map<string, number>()
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        revenueMap.set(dateStr, 0)
      }

      appointments?.forEach(appointment => {
        const dateStr = new Date(appointment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        revenueMap.set(dateStr, (revenueMap.get(dateStr) || 0) + (appointment.consultation_fee || 0))
      })

      setRevenueData(Array.from(revenueMap.entries()).map(([date, revenue]) => ({ date, revenue })))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

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
        {/* Hero Section */}
        <div style={{
          background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #1a1060 100%)',
          borderRadius: '20px',
          padding: '28px 32px',
          marginBottom: '24px',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(0,212,170,0.15)'
        }}>
          {/* EKG line SVG */}
          <svg style={{ position: 'absolute', bottom: '16px', left: 0, right: 0, opacity: 0.15, width: '100%' }} height="40" viewBox="0 0 400 40">
            <polyline points="0,20 50,20 70,5 80,35 90,5 100,20 150,20 170,10 180,30 190,20 400,20" fill="none" stroke="#00d4aa" strokeWidth="2" strokeDasharray="1000" strokeDashoffset="1000" style={{ animation: 'ekg-line 3s linear infinite' }}/>
          </svg>

          {/* Orbs */}
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '150px', height: '150px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.2) 0%, transparent 70%)' }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'rgba(0,212,170,0.7)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: '600' }}>
                Hospital Command Center
              </div>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'white', marginBottom: '6px' }}>
                Patient Management System
              </h1>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                Real-time triage • EHR • Billing • Doctors
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <a href="/bookings" style={{ background: 'linear-gradient(135deg, #00d4aa, #0ea5e9)', padding: '10px 18px', borderRadius: '10px', color: 'white', fontWeight: '600', fontSize: '12px', textDecoration: 'none' }}>
                + Book Appointment
              </a>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card animate-float" style={{ padding: '22px', animationDelay: '0s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(102,126,234,0.4)' }}>
                <Users size={20} color="white" />
              </div>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2ed573', boxShadow: '0 0 8px #2ed573' }} />
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', color: '#e2e8f0', letterSpacing: '-0.02em', marginBottom: '4px' }}>{totalPatients}</div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Total Patients</div>
          </div>

          <div className="glass-card animate-float" style={{ padding: '22px', animationDelay: '0.1s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'linear-gradient(135deg, #00d4aa, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,212,170,0.4)' }}>
                <Calendar size={20} color="white" />
              </div>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2ed573', boxShadow: '0 0 8px #2ed573' }} />
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', color: '#e2e8f0', letterSpacing: '-0.02em', marginBottom: '4px' }}>{activeConsultations}</div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Active Consultations</div>
          </div>

          <div className="glass-card animate-float" style={{ padding: '22px', animationDelay: '0.2s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'linear-gradient(135deg, #2ed573, #26de81)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(46,213,115,0.4)' }}>
                <Bed size={20} color="white" />
              </div>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2ed573', boxShadow: '0 0 8px #2ed573' }} />
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', color: '#e2e8f0', letterSpacing: '-0.02em', marginBottom: '4px' }}>{availableBeds}</div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Available Beds</div>
          </div>

          <div className="glass-card animate-float" style={{ padding: '22px', animationDelay: '0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'linear-gradient(135deg, #f093fb, #f5576c)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(240,147,251,0.4)' }}>
                <Activity size={20} color="white" />
              </div>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2ed573', boxShadow: '0 0 8px #2ed573' }} />
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', color: '#e2e8f0', letterSpacing: '-0.02em', marginBottom: '4px' }}>{pendingPharmacy}</div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Pending Pharmacy</div>
          </div>
        </div>

        {/* Triage Status Display */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', color: '#475569', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Live Triage Status</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { label: 'Emergency', count: 0, color: '#ff4757', bg: 'rgba(255,71,87,0.1)', border: 'rgba(255,71,87,0.3)', pulse: 'emergency-pulse', emoji: '🔴' },
              { label: 'Urgent', count: 0, color: '#ffa502', bg: 'rgba(255,165,2,0.1)', border: 'rgba(255,165,2,0.3)', pulse: 'urgent-pulse', emoji: '🟡' },
              { label: 'Normal', count: 0, color: '#2ed573', bg: 'rgba(46,213,115,0.1)', border: 'rgba(46,213,115,0.3)', pulse: '', emoji: '🟢' },
            ].map(({ label, count, color, bg, border, pulse, emoji }) => (
              <div key={label} className={pulse} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '14px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', marginBottom: '8px' }}>{emoji}</div>
                <div style={{ fontSize: '36px', fontWeight: '800', color, lineHeight: 1 }}>{count}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-white mb-4 pb-2 border-b border-white/10">
              Patient Intake (Last 7 Days)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={patientData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="patients" 
                  stroke="#00d4aa" 
                  strokeWidth={3}
                  fill="url(#medicalGradient)"
                />
                <defs>
                  <linearGradient id="medicalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00d4aa" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-white mb-4 pb-2 border-b border-white/10">
              Revenue Trend (Last 7 Days)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="url(#medicalGradient)" />
                <defs>
                  <linearGradient id="medicalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00d4aa" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Consultations Placeholder */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold text-white mb-4 pb-2 border-b border-white/10">
            Upcoming Consultations
          </h2>
          <p className="text-slate-400">No upcoming consultations scheduled.</p>
        </div>
      </div>
    </div>
  )
}
