'use client'
import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import { getSupabase } from '@/lib/supabaseClient'
import { IndianRupee, CheckCircle, Clock, XCircle } from 'lucide-react'

interface MedicalRecord {
  id: string; patient_id: string; diagnosis: string; prescription: string;
  billing_status: string; amount: number; created_at: string;
  patients?: { patient_name: string; phone_number: string }
  appointments?: { appointment_date: string; symptoms_summary: string }
}

export default function BillingPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [filtered, setFiltered] = useState<MedicalRecord[]>([])
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState<MedicalRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [totals, setTotals] = useState({ pending: 0, paid: 0, cancelled: 0 })
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'

  useEffect(() => { fetchRecords() }, [])
  useEffect(() => {
    const f = statusFilter ? records.filter(r => r.billing_status === statusFilter) : records
    setFiltered(f)
  }, [records, statusFilter])

  async function fetchRecords() {
    const supabase = getSupabase()
    if (!supabase) return setLoading(false)
    try {
      const { data } = await supabase
        .from('medical_records')
        .select('*, patients(patient_name, phone_number), appointments(appointment_date, symptoms_summary)')
        .order('created_at', { ascending: false })
      const rows = data || []
      setRecords(rows)
      setFiltered(rows)
      setTotals({
        pending: rows.filter(r => r.billing_status === 'Pending').reduce((s, r) => s + (r.amount || 0), 0),
        paid: rows.filter(r => r.billing_status === 'Paid').reduce((s, r) => s + (r.amount || 0), 0),
        cancelled: rows.filter(r => r.billing_status === 'Cancelled').reduce((s, r) => s + (r.amount || 0), 0),
      })
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function updateBilling(id: string, status: string) {
    try {
      const res = await fetch(`${API_URL}/api/medical-records/${id}/billing`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billing_status: status })
      })
      if (!res.ok) throw new Error('Failed to update billing')
      fetchRecords()
      setSelected(null)
    } catch (e) {
      console.error('Billing update failed:', e)
      alert('Failed to update billing status. Please try again.')
    }
  }

  const statusIcon = (s: string) =>
    s === 'Paid' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> :
    s === 'Pending' ? <Clock className="w-4 h-4 text-amber-400" /> :
    <XCircle className="w-4 h-4 text-red-400" />

  const statusClass = (s: string) =>
    s === 'Paid' ? 'bg-emerald-500/20 text-emerald-400' :
    s === 'Pending' ? 'bg-amber-500/20 text-amber-400' :
    'bg-red-500/20 text-red-400'

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <div className="pt-16 p-6 max-w-7xl mx-auto ml-20 lg:ml-64">
        <h1 className="text-2xl font-bold text-white mb-6">Billing & Invoices</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
          {[
            { label: 'Pending', amount: totals.pending, color: '#ffa502', bg: 'rgba(255,165,2,0.1)', border: 'rgba(255,165,2,0.25)', icon: '⏳' },
            { label: 'Paid', amount: totals.paid, color: '#2ed573', bg: 'rgba(46,213,115,0.1)', border: 'rgba(46,213,115,0.25)', icon: '✅' },
            { label: 'Cancelled', amount: totals.cancelled, color: '#ff4757', bg: 'rgba(255,71,87,0.1)', border: 'rgba(255,71,87,0.25)', icon: '❌' },
          ].map(({ label, amount, color, bg, border, icon }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '14px', padding: '20px' }}>
              <div style={{ fontSize: '20px', marginBottom: '10px' }}>{icon}</div>
              <div style={{ fontSize: '28px', fontWeight: '800', color }}> ₹{amount.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{label} Amount</div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mb-4">
          {['', 'Pending', 'Paid', 'Cancelled'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`text-sm px-4 py-2 rounded-lg border transition-colors ${statusFilter === s ? 'gradient-btn-medical border-transparent text-white' : 'glass-input text-slate-400 hover:text-white'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(r => (
            <div key={r.id} className={`glass-card p-6 relative overflow-hidden ${r.billing_status === 'overdue' ? 'border-red-500/50 urgent-pulse' : ''}`}>
              {r.billing_status === 'Paid' && (
                <div className="absolute top-4 right-4 transform rotate-12 bg-green-500/20 border-2 border-green-500 text-green-400 px-3 py-1 rounded-lg text-xs font-bold">
                  PAID
                </div>
              )}
              <div className="mb-4">
                <p className="text-slate-400 text-sm mb-1">Patient</p>
                <p className="text-white font-medium">{r.patients?.patient_name || '—'}</p>
                <p className="text-slate-500 text-xs">{r.patients?.phone_number || ''}</p>
              </div>
              <div className="mb-4">
                <p className="text-slate-400 text-sm mb-1">Diagnosis</p>
                <p className="text-slate-300 text-sm truncate">{r.diagnosis || '—'}</p>
              </div>
              <div className="mb-4">
                <p className="text-slate-400 text-sm mb-1">Amount</p>
                <p className="text-3xl font-bold gradient-text-gold">₹{(r.amount || 0).toLocaleString()}</p>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full ${statusClass(r.billing_status)}`}>
                  {statusIcon(r.billing_status)}{r.billing_status}
                </span>
                <span className="text-slate-400 text-xs">
                  {new Date(r.created_at).toLocaleDateString('en-IN')}
                </span>
              </div>
              <button onClick={() => setSelected(r)}
                className="w-full gradient-btn text-white text-sm font-medium py-2 px-4 rounded-lg">
                View Details
              </button>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500 glass-card">No records found.</div>
        )}

        {selected && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full relative">
              {selected.billing_status === 'Paid' && (
                <div style={{ position: 'absolute', top: '20px', right: '20px', transform: 'rotate(15deg)', border: '3px solid rgba(46,213,115,0.6)', borderRadius: '6px', padding: '4px 12px', color: '#2ed573', fontSize: '14px', fontWeight: '800', letterSpacing: '0.1em', opacity: 0.7 }}>
                  PAID
                </div>
              )}
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-bold text-white">Invoice Details</h2>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              <div className="space-y-2 text-sm mb-6">
                <div className="flex justify-between"><span className="text-slate-400">Patient</span><span className="text-white">{selected.patients?.patient_name}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Phone</span><span className="text-white">{selected.patients?.phone_number}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Diagnosis</span><span className="text-white text-right max-w-[200px]">{selected.diagnosis || '—'}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Prescription</span><span className="text-white text-right max-w-[200px]">{selected.prescription || '—'}</span></div>
                <div className="flex justify-between border-t border-slate-700 pt-2 mt-2">
                  <span className="text-slate-400">Amount</span>
                  <span className="text-white font-bold text-lg">₹{(selected.amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">GST (18%)</span>
                  <span className="text-slate-300">₹{Math.round((selected.amount || 0) * 0.18).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-slate-700 pt-2">
                  <span className="text-white font-medium">Total</span>
                  <span className="text-white font-bold">₹{Math.round((selected.amount || 0) * 1.18).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {selected.billing_status !== 'Paid' && (
                  <button onClick={() => updateBilling(selected.id, 'Paid')}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2 text-sm font-medium">
                    Mark as Paid
                  </button>
                )}
                {selected.billing_status !== 'Cancelled' && (
                  <button onClick={() => updateBilling(selected.id, 'Cancelled')}
                    className="flex-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg py-2 text-sm">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
