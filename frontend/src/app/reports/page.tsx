'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import { TrendingUp, Users, DollarSign, Activity, Download, Calendar, BarChart3 } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts'

interface ReportData {
  patientVolume: any[]
  triageDistribution: any[]
  revenueData: any[]
  departmentLoad: any[]
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981']

export default function ReportsPage() {
  const [data, setData] = useState<ReportData>({
    patientVolume: [],
    triageDistribution: [],
    revenueData: [],
    departmentLoad: []
  })
  const [loading, setLoading] = useState(true)

  const fetchReportData = async () => {
    const supabase = (await import('@/lib/supabaseClient')).getSupabase()
    if (!supabase) {
      setLoading(false)
      return
    }

    try {
      // Patient Volume (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      thirtyDaysAgo.setHours(0, 0, 0, 0)

      const { data: patients } = await supabase
        .from('patients')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())

      const patientMap = new Map<string, number>()
      for (let i = 29; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        patientMap.set(dateStr, 0)
      }

      patients?.forEach(patient => {
        const dateStr = new Date(patient.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        patientMap.set(dateStr, (patientMap.get(dateStr) || 0) + 1)
      })

      const patientVolume = Array.from(patientMap.entries()).map(([date, patients]) => ({ date, patients }))

      // Triage Distribution
      const { data: appointments } = await supabase
        .from('appointments')
        .select('triage_status, specialization')

      const triageCount = { emergency: 0, urgent: 0, normal: 0 }
      const specializationCount = new Map<string, { emergency: number, urgent: number, normal: number, total: number }>()

      appointments?.forEach(appointment => {
        triageCount[appointment.triage_status as keyof typeof triageCount]++

        if (!specializationCount.has(appointment.specialization)) {
          specializationCount.set(appointment.specialization, { emergency: 0, urgent: 0, normal: 0, total: 0 })
        }
        const spec = specializationCount.get(appointment.specialization)!
        spec[appointment.triage_status as keyof typeof spec]++
        spec.total++
      })

      const triageDistribution = [
        { name: 'Emergency', value: triageCount.emergency, color: '#ef4444' },
        { name: 'Urgent', value: triageCount.urgent, color: '#f59e0b' },
        { name: 'Normal', value: triageCount.normal, color: '#10b981' }
      ]

      const departmentLoad = Array.from(specializationCount.entries()).map(([spec, counts]) => ({
        specialization: spec,
        total: counts.total,
        emergency: counts.emergency,
        urgent: counts.urgent,
        normal: counts.normal,
        avgTriage: (counts.emergency * 3 + counts.urgent * 2 + counts.normal * 1) / counts.total
      }))

      // Revenue Data (last 30 days)
      const { data: medicalRecords } = await supabase
        .from('medical_records')
        .select('created_at, amount, billing_status')
        .gte('created_at', thirtyDaysAgo.toISOString())

      const revenueMap = new Map<string, { paid: number, pending: number }>()
      for (let i = 29; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        revenueMap.set(dateStr, { paid: 0, pending: 0 })
      }

      medicalRecords?.forEach(record => {
        const dateStr = new Date(record.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        const rev = revenueMap.get(dateStr) || { paid: 0, pending: 0 }
        if (record.billing_status === 'Paid') {
          rev.paid += record.amount || 0
        } else if (record.billing_status === 'Pending') {
          rev.pending += record.amount || 0
        }
        revenueMap.set(dateStr, rev)
      })

      const revenueData = Array.from(revenueMap.entries()).map(([date, rev]) => ({
        date,
        paid: rev.paid,
        pending: rev.pending,
        total: rev.paid + rev.pending
      }))

      setData({ patientVolume, triageDistribution, revenueData, departmentLoad })
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = (reportName: string, exportData: any[]) => {
    if (exportData.length === 0) return

    const headers = Object.keys(exportData[0])
    const rows = exportData.map(row => headers.map(header => row[header]))
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${reportName}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  useEffect(() => {
    fetchReportData()
  }, [])

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 gradient-text-medical">Reports & Analytics</h1>
          <p className="text-slate-400">Comprehensive insights into hospital performance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Volume Report */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-400" />
                <h2 className="text-xl font-semibold text-white">Patient Volume</h2>
              </div>
              <button
                onClick={() => exportCSV('patient-volume', data.patientVolume)}
                className="gradient-btn text-xs py-2 px-3"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-400 text-sm mb-4">Last 30 days</p>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.patientVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="patients" stroke="#00d4aa" fill="url(#tealGradient)" />
                <defs>
                  <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00d4aa" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#00d4aa" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Triage Distribution */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-semibold text-white">Triage Distribution</h2>
              </div>
              <button
                onClick={() => exportCSV('triage-distribution', data.triageDistribution)}
                className="gradient-btn text-xs py-2 px-3"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.triageDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.triageDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Trends */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-semibold text-white">Revenue Trends</h2>
              </div>
              <button
                onClick={() => exportCSV('revenue-trends', data.revenueData)}
                className="gradient-btn text-xs py-2 px-3"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-400 text-sm mb-4">Paid vs Pending (Last 30 days)</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                />
                <Legend />
                <Bar dataKey="paid" fill="url(#goldGradient)" name="Paid" />
                <Bar dataKey="pending" fill="url(#amberGradient)" name="Pending" />
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f6c90e" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#f6c90e" stopOpacity={0.4} />
                  </linearGradient>
                  <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Department Load */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-semibold text-white">Department Load</h2>
              </div>
              <button
                onClick={() => exportCSV('department-load', data.departmentLoad)}
                className="gradient-btn text-xs py-2 px-3"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.departmentLoad} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="specialization" type="category" stroke="#94a3b8" width={100} fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Legend />
                <Bar dataKey="emergency" fill="#ef4444" name="Emergency" />
                <Bar dataKey="urgent" fill="#f59e0b" name="Urgent" />
                <Bar dataKey="normal" fill="#10b981" name="Normal" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
