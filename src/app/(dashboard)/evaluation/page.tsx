'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Activity, Play } from 'lucide-react'

export default function EvaluationPage() {
  const [hasData, setHasData] = useState(true)

  const accuracyData = [
    { name: 'Barcode', score: 98 },
    { name: 'Color', score: 95 },
    { name: 'Damage', score: 88 },
    { name: 'Label', score: 92 },
    { name: 'Seal', score: 99 },
    { name: 'Weight', score: 85 },
    { name: 'Qty', score: 100 },
    { name: 'Expiry', score: 90 },
  ]

  const verdictData = [
    { name: 'Pass', value: 40, color: '#10B981' },
    { name: 'Fail', value: 7, color: '#F43F5E' },
    { name: 'Uncertain', value: 3, color: '#F59E0B' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col justify-between gap-2 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Evaluation Dashboard - 50-Unit Held-Out Suite</h1>
        <p className="text-sm text-gray-500">Performance metrics against human ground-truth labels.</p>
      </div>

      {!hasData ? (
        <div className="text-center py-24 bg-white rounded-lg border border-gray-200 shadow-sm">
          <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Evaluation Data</h3>
          <p className="text-gray-500 mb-6">Run the held-out evaluation suite to generate metrics.</p>
          <button 
            onClick={() => setHasData(true)}
            className="inline-flex items-center bg-[#4F46E5] text-white rounded-md px-6 py-2.5 font-medium hover:bg-[#4F46E5]/90 transition-colors"
          >
            <Play className="w-4 h-4 mr-2" /> Run Evaluation Suite
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm text-center">
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Overall Accuracy</div>
              <div className="text-3xl font-bold text-[#10B981]">94%</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm text-center">
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">FP Rate</div>
              <div className="text-3xl font-bold text-[#F43F5E]">2%</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm text-center">
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">FN Rate</div>
              <div className="text-3xl font-bold text-[#F43F5E]">4%</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm text-center">
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Uncertain Rate</div>
              <div className="text-3xl font-bold text-[#F59E0B]">6%</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm text-center">
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Avg Latency</div>
              <div className="text-3xl font-bold text-gray-900">1.2s</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-6">Per-Check Accuracy</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={accuracyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{fontSize: 12, fill: '#6B7280'}} tickLine={false} axisLine={false} />
                    <YAxis tick={{fontSize: 12, fill: '#6B7280'}} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="score" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Verdict Distribution</h3>
              <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={verdictData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {verdictData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 border-t border-gray-100 pt-4 text-center">
                <div className="text-xs text-gray-500 mb-1">Cohen's Kappa (Agreement)</div>
                <div className="text-xl font-bold text-gray-900">0.89</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
