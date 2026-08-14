'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Calendar, Users, Settings, Activity, IndianRupee, UserPlus, TrendingUp, Menu, X, User, ChevronRight } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/bookings', label: 'Book Appointment', icon: Calendar },
  { href: '/patients', label: 'Patients', icon: Users },
  { href: '/billing', label: 'Billing', icon: IndianRupee },
  { href: '/doctors', label: 'Doctors', icon: UserPlus },
  { href: '/reports', label: 'Reports', icon: TrendingUp },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Navigation() {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    const update = () => setCurrentTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }))
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="fixed top-4 left-4 z-50 p-3 glass-card rounded-xl hover:border-teal-500/50 transition-all lg:hidden"
      >
        {isExpanded ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen z-40 transition-all duration-300 ${
          isExpanded ? 'w-64' : 'w-20'
        } ${!isExpanded ? 'lg:w-20' : 'lg:w-64'}`}
        style={{
          background: 'rgba(2,6,23,0.97)',
          borderRight: '1px solid rgba(0,212,170,0.12)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo Area */}
          <div className="flex items-center gap-3 mb-4">
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', inset: '-4px', borderRadius: '50%', background: 'rgba(0,212,170,0.2)', animation: 'pulse-green 2s infinite' }} />
              <div className="w-12 h-12 rounded-full flex items-center justify-center relative z-10" style={{ background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)' }}>
                <Activity size={18} color="#00d4aa" />
              </div>
            </div>
            {isExpanded && (
              <span className="text-xl font-bold gradient-text-medical animate-slide-up">
                Hospital SaaS
              </span>
            )}
          </div>

          {/* Live Time Display */}
          <div style={{ padding: '8px 16px', background: 'rgba(0,212,170,0.05)', borderBottom: '1px solid rgba(0,212,170,0.08)', borderRadius: '10px', textAlign: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#00d4aa', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{currentTime}</div>
            <div style={{ fontSize: '9px', color: '#475569', textTransform: 'uppercase' }}>Live</div>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300"
                  style={isActive ? {
                    background: 'linear-gradient(135deg, rgba(0,212,170,0.15), rgba(14,165,233,0.1))',
                    borderLeft: '3px solid #00d4aa',
                    color: '#00d4aa'
                  } : {
                    color: '#94a3b8',
                    background: 'transparent'
                  }}
                >
                  <Icon 
                    className="w-6 h-6" 
                    style={isActive ? { filter: 'drop-shadow(0 0 6px rgba(0,212,170,0.8))' } : {}}
                  />
                  {isExpanded && <span className="font-medium">{item.label}</span>}
                  {isExpanded && isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              )
            })}
          </nav>

          {/* User Section */}
          <div style={{ padding: '16px', borderTop: '1px solid rgba(0,212,170,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #00d4aa, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: 'white' }}>
                DR
              </div>
              {isExpanded && (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#e2e8f0' }}>Admin</div>
                  <div style={{ fontSize: '10px', color: '#475569' }}>Hospital Manager</div>
                </div>
              )}
              <Settings className="w-5 h-5 text-slate-400 hover:text-teal-400 cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main content margin */}
      <div className={`transition-all duration-300 ${isExpanded ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Desktop toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="hidden lg:flex fixed top-4 left-4 z-50 p-3 glass-card rounded-xl hover:border-teal-500/50 transition-all"
        >
          {isExpanded ? <ChevronRight className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
        </button>
      </div>
    </>
  )
}
