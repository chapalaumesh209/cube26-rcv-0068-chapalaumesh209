'use client'

import { useState } from 'react'
import { Users, Building, Key, Shield, Eye, EyeOff } from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('api')
  const [showKey, setShowKey] = useState(false)

  const tabs = [
    { id: 'users', label: 'Users & Roles', icon: Users },
    { id: 'org', label: 'Organization', icon: Building },
    { id: 'api', label: 'API & VLM', icon: Key },
    { id: 'audit', label: 'Audit Log', icon: Shield },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage system configurations and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 space-y-1 shrink-0">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? 'bg-[#4F46E5]/10 text-[#4F46E5]' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#4F46E5]' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm p-6 min-h-[400px]">
          {activeTab === 'api' && (
            <div className="space-y-6 max-w-xl">
              <h2 className="text-lg font-semibold text-gray-900">API Configuration</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">VLM Mode</label>
                  <select className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent">
                    <option value="live">Live API (Production)</option>
                    <option value="mock">Mock Engine (Testing)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vision Model Version</label>
                  <select className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent">
                    <option value="v4">DockProof Vision V4.2 (Recommended)</option>
                    <option value="v3">DockProof Vision V3.8</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                  <div className="flex mt-1 relative rounded-md shadow-sm">
                    <input
                      type={showKey ? 'text' : 'password'}
                      className="block w-full rounded-md border-gray-300 border pl-3 pr-10 py-2 focus:border-[#4F46E5] focus:ring-[#4F46E5] sm:text-sm outline-none bg-gray-50"
                      value="sk-dockproof-v4-abc123xyz890"
                      readOnly
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      {showKey ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Your secret API key for the vision backend.</p>
                </div>
                
                <div className="pt-4">
                  <button className="bg-[#4F46E5] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#4F46E5]/90 transition-colors">
                    Save Configuration
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'api' && (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-4">
              <div className="p-4 rounded-full bg-gray-50 border border-gray-100">
                <Shield className="w-8 h-8 text-gray-300" />
              </div>
              <p>This settings module ({activeTab}) is under construction.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
