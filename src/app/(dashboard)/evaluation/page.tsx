'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import { LoadingIcon } from '@/components/ui/loading-icon';

export default function EvaluationPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/eval/metrics');
      if (res.ok) {
        setData(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const report = data?.report;
  const metrics = report?.metrics;
  const confusion = report?.confusion_matrix;
  const total = report?.total_units || 0;
  const accuracy = metrics?.accuracy;
  const fpr = metrics?.false_positive_rate;
  const fnr = metrics?.false_negative_rate;
  const kappa = metrics?.cohens_kappa;
  const verdictData = [
    { name: 'Pass', value: confusion?.pass?.pass || 0, color: '#237450' },
    { name: 'Exception', value: confusion?.exception?.exception || 0, color: '#a83e31' },
    { name: 'Uncertain', value: confusion?.uncertain?.uncertain || 0, color: '#a06b1c' },
  ];
  const abstention = total ? verdictData[2].value / total : undefined;
  const scenarioSummary = (report?.results_summary || []).reduce((acc: Record<string, { total: number; matched: number }>, row: { category: string; match: boolean }) => {
    const key = row.category.replace(/_/g, ' ');
    if (!acc[key]) acc[key] = { total: 0, matched: 0 };
    acc[key].total += 1;
    if (row.match) acc[key].matched += 1;
    return acc;
  }, {});
  const accuracyData = Object.entries(scenarioSummary as Record<string, { total: number; matched: number }>).map(([name, result]) => ({ name, score: Math.round((result.matched / result.total) * 100) }));
  const percent = (value?: number) => value == null ? '—' : `${(value * 100).toFixed(1)}%`;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs font-mono text-slate-500">
            <span className="font-bold text-slate-900 tracking-wider">RCV · POD 01</span>
            <span>/</span>
            <span>HELD-OUT BENCHMARK SUITE</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Receiving Quality & Accuracy</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {total || 'Held-out'} arrival units scored against adjudicated outcomes. Deterministic rules govern commercial verdicts.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition-colors shadow-xs disabled:opacity-50 self-start sm:self-center"
        >
          {loading ? (
            <LoadingIcon size="xs" color="indigo" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          )}
          <span>Refresh Benchmark</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Accuracy</div>
          <div className="text-3xl font-black text-emerald-600">{percent(accuracy)}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1">False PASS</div>
          <div className="text-3xl font-black text-emerald-600">{percent(fpr)}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1">False reject</div>
          <div className="text-3xl font-black text-emerald-600">{percent(fnr)}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Uncertain rate</div>
          <div className="text-3xl font-black text-amber-500">{percent(abstention)}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Agreement κ</div>
          <div className="text-3xl font-black text-brand-600">{kappa == null ? '—' : Number(kappa).toFixed(2)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Accuracy by held-out scenario</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accuracyData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e5db" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#526459' }} interval={0} angle={-25} textAnchor="end" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#526459' }} />
                <Tooltip contentStyle={{ borderRadius: '5px', border: '1px solid #dad7cb', background: '#fffdf8' }} />
                <Bar dataKey="score" fill="#315f49" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Verdict mix</h3>
          <p className="text-xs text-slate-500 mb-4">Held-out receiving units</p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={verdictData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                  {verdictData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 border-t border-slate-100 pt-3 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>PASS</span><span className="font-bold">{verdictData[0].value}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>EXCEPTION</span><span className="font-bold">{verdictData[1].value}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>UNCERTAIN</span><span className="font-bold">{verdictData[2].value}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Confusion (predicted vs gold)</h3>
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] font-semibold border-b">
                <th className="py-2 text-left pl-2">Gold \\ Pred</th>
                <th className="py-2 text-emerald-700">PASS</th>
                <th className="py-2 text-rose-700">EXCEPTION</th>
                <th className="py-2 text-amber-700">UNCERTAIN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2 text-left pl-2 font-semibold text-slate-700">PASS</td>
                <td className="py-2 bg-emerald-50/50 font-bold text-emerald-800">{confusion?.pass?.pass ?? '—'}</td>
                <td className="py-2 text-slate-400">{confusion?.pass?.exception ?? '—'}</td>
                <td className="py-2 text-slate-400">{confusion?.pass?.uncertain ?? '—'}</td>
              </tr>
              <tr>
                <td className="py-2 text-left pl-2 font-semibold text-slate-700">EXCEPTION</td>
                <td className="py-2 text-slate-400">{confusion?.exception?.pass ?? '—'}</td>
                <td className="py-2 bg-rose-50/50 font-bold text-rose-800">{confusion?.exception?.exception ?? '—'}</td>
                <td className="py-2 text-slate-400">{confusion?.exception?.uncertain ?? '—'}</td>
              </tr>
              <tr>
                <td className="py-2 text-left pl-2 font-semibold text-slate-700">UNCERTAIN</td>
                <td className="py-2 text-slate-400">{confusion?.uncertain?.pass ?? '—'}</td>
                <td className="py-2 text-slate-400">{confusion?.uncertain?.exception ?? '—'}</td>
                <td className="py-2 bg-amber-50/50 font-bold text-amber-800">{confusion?.uncertain?.uncertain ?? '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            How receiving decides
          </h3>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-800">Occlusion is UNCERTAIN</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Hidden rows are never counted as a shortage guess.</p>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-800">Overage is EXCEPTION</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Units above the PO line do not silently pass.</p>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-800">Any failed check blocks PASS</p>
            <p className="text-[11px] text-slate-500 mt-0.5">A matching SKU cannot hide crushed cartons or missing parts.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
