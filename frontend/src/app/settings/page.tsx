'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import { Palette, Key, Image, Smartphone, CreditCard, Globe, Lock, CheckCircle, Upload } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'

interface SettingsData {
  hospital_name: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  whatsapp_api_token: string
  payment_gateway_credentials: string
  custom_api_keys: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({
    hospital_name: 'Hospital Management SaaS',
    logo_url: null,
    primary_color: '#0ea5e9',
    secondary_color: '#10b981',
    whatsapp_api_token: '',
    payment_gateway_credentials: '',
    custom_api_keys: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<'branding' | 'api'>('branding')

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/settings`)
      const data = await response.json()
      setSettings({
        hospital_name: data.hospital_name || 'Hospital Management SaaS',
        logo_url: data.logo_url || null,
        primary_color: data.primary_color || '#0ea5e9',
        secondary_color: data.secondary_color || '#10b981',
        whatsapp_api_token: data.whatsapp_api_token || '',
        payment_gateway_credentials: data.payment_gateway_credentials || '',
        custom_api_keys: data.custom_api_keys || ''
      })
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSuccess(false)
    try {
      const response = await fetch(`${API_URL}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (!response.ok) throw new Error('Failed to save settings')

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setSettings(prev => ({ ...prev, logo_url: url }))
    }
  }

  useEffect(() => {
    fetchSettings()
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
          <h1 className="text-3xl font-bold text-white mb-2 gradient-text-medical">Settings</h1>
          <p className="text-slate-400">Customize your hospital management experience</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-card p-4 space-y-2">
              <button
                onClick={() => setActiveTab('branding')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                  activeTab === 'branding' 
                    ? 'gradient-btn-medical border-0' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Palette className="w-5 h-5" />
                Branding
              </button>
              <button
                onClick={() => setActiveTab('api')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                  activeTab === 'api' 
                    ? 'gradient-btn-medical border-0' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Key className="w-5 h-5" />
                API Portal
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="glass-card p-6">
              {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-lg p-4 mb-6 text-emerald-400 flex items-center gap-2 animate-slide-up">
                  <CheckCircle className="w-5 h-5" />
                  Settings saved successfully!
                </div>
              )}

              {activeTab === 'branding' ? (
                <div className="space-y-6">
                  {/* Hospital Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Hospital Name</label>
                    <input
                      type="text"
                      value={settings.hospital_name}
                      onChange={(e) => setSettings(prev => ({ ...prev, hospital_name: e.target.value }))}
                      className="w-full glass-input px-4 py-3 text-white placeholder-slate-400"
                      placeholder="Enter hospital name"
                    />
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Logo</label>
                    <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-teal-500/50 transition-colors bg-white/5">
                      {settings.logo_url ? (
                        <div className="space-y-4">
                          <div className="relative inline-block">
                            <img
                              src={settings.logo_url}
                              alt="Hospital Logo"
                              className="max-h-32 mx-auto rounded-xl border-2 border-white/10"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl"></div>
                          </div>
                          <label className="inline-flex items-center gap-2 px-4 py-2 glass-input cursor-pointer hover:border-teal-500/50 transition-colors">
                            <Image className="w-4 h-4" />
                            Change Logo
                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                          </label>
                        </div>
                      ) : (
                        <div>
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center mx-auto mb-4 animate-float">
                            <Upload className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-slate-400 mb-2">Click to upload logo</p>
                          <p className="text-slate-500 text-sm">PNG, JPG up to 5MB</p>
                          <label className="inline-block mt-4 gradient-btn-medical px-6 py-2 rounded-lg cursor-pointer">
                            Select File
                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Color Profile */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-4">Color Profile</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">Primary Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={settings.primary_color}
                            onChange={(e) => setSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                            className="w-12 h-12 rounded-lg cursor-pointer border-0"
                          />
                          <input
                            type="text"
                            value={settings.primary_color}
                            onChange={(e) => setSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                            className="flex-1 glass-input px-4 py-3 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">Secondary Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={settings.secondary_color}
                            onChange={(e) => setSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                            className="w-12 h-12 rounded-lg cursor-pointer border-0"
                          />
                          <input
                            type="text"
                            value={settings.secondary_color}
                            onChange={(e) => setSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                            className="flex-1 glass-input px-4 py-3 text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live Preview */}
                  <div className="glass-card p-6">
                    <label className="block text-sm font-medium text-slate-300 mb-4">Live Preview</label>
                    <div 
                      className="p-6 rounded-xl border-2"
                      style={{ 
                        borderColor: settings.primary_color,
                        background: `linear-gradient(135deg, ${settings.primary_color}20, ${settings.secondary_color}20)`
                      }}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        {settings.logo_url ? (
                          <img src={settings.logo_url} alt="Logo" className="w-12 h-12 rounded-lg" />
                        ) : (
                          <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: settings.primary_color }}
                          >
                            {settings.hospital_name[0]}
                          </div>
                        )}
                        <div>
                          <h3 className="text-white font-semibold">{settings.hospital_name}</h3>
                          <p className="text-slate-400 text-sm">Your customized hospital interface</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          className="px-4 py-2 rounded-lg text-white text-sm"
                          style={{ backgroundColor: settings.primary_color }}
                        >
                          Primary Action
                        </button>
                        <button 
                          className="px-4 py-2 rounded-lg text-white text-sm"
                          style={{ backgroundColor: settings.secondary_color }}
                        >
                          Secondary Action
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* WhatsApp API */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-green-400" />
                      WhatsApp API Token
                    </label>
                    <input
                      type="password"
                      value={settings.whatsapp_api_token}
                      onChange={(e) => setSettings(prev => ({ ...prev, whatsapp_api_token: e.target.value }))}
                      className="w-full glass-input px-4 py-3 text-white placeholder-slate-400"
                      placeholder="Enter WhatsApp API token"
                    />
                    <p className="text-slate-500 text-xs mt-1">Used for sending appointment reminders</p>
                  </div>

                  {/* Payment Gateway */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-yellow-400" />
                      Payment Gateway Credentials
                    </label>
                    <input
                      type="password"
                      value={settings.payment_gateway_credentials}
                      onChange={(e) => setSettings(prev => ({ ...prev, payment_gateway_credentials: e.target.value }))}
                      className="w-full glass-input px-4 py-3 text-white placeholder-slate-400"
                      placeholder="Enter payment gateway credentials"
                    />
                    <p className="text-slate-500 text-xs mt-1">Razorpay/Stripe integration keys</p>
                  </div>

                  {/* Custom API Keys */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-400" />
                      Custom API Keys
                    </label>
                    <textarea
                      value={settings.custom_api_keys}
                      onChange={(e) => setSettings(prev => ({ ...prev, custom_api_keys: e.target.value }))}
                      className="w-full glass-input px-4 py-3 text-white placeholder-slate-400 resize-none"
                      rows={4}
                      placeholder="Enter custom API keys (JSON format)"
                    />
                    <p className="text-slate-500 text-xs mt-1">Third-party integrations and webhooks</p>
                  </div>

                  {/* Security Notice */}
                  <div className="glass-card p-4 border border-amber-500/30">
                    <div className="flex items-start gap-3">
                      <Lock className="w-5 h-5 text-amber-400 mt-0.5" />
                      <div>
                        <p className="text-amber-400 font-medium mb-1">Security Notice</p>
                        <p className="text-slate-400 text-sm">All API keys and credentials are encrypted at rest. Never share these credentials with unauthorized personnel.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full gradient-btn-medical py-4 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
