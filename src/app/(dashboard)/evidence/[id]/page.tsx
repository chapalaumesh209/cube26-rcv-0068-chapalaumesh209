'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Copy, Download, ShieldCheck, Check } from 'lucide-react';
import { LoadingIcon } from '@/components/ui/loading-icon';

export default function EvidenceDetailPage() {
  const { id } = useParams();
  const [evidence, setEvidence] = useState<any>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/inspections/${id}/evidence`)
      .then(async (r) => {
        if (!r.ok) throw new Error('not found');
        return r.json();
      })
      .then((data) => setEvidence(data.evidence))
      .catch(() => setError('Evidence record not found for this inspection.'));
  }, [id]);

  const jsonString = evidence ? JSON.stringify(evidence, null, 2) : '';

  // Light-Mode High-Contrast Syntax Highlighter
  const highlightJSON = (json: string) => {
    if (!json) return '';
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      function (match) {
        let cls = 'text-emerald-700 font-medium'; // strings
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'text-indigo-900 font-bold'; // object keys
          }
        } else if (/true|false/.test(match)) {
          cls = 'text-purple-700 font-bold'; // booleans
        } else if (/null/.test(match)) {
          cls = 'text-slate-400 italic'; // nulls
        } else {
          cls = 'text-amber-800 font-semibold'; // numbers
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJson = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rcv-${id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <Link href="/evidence" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 mb-3 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Evidence Vault
        </Link>
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-xs font-mono text-slate-500">
              <span className="font-bold text-slate-900 tracking-wider">RCV · POD 01</span>
              <span>/</span>
              <span>SEALED EVIDENCE CONTRACT</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <span>Receiving Contract:</span>
              <span className="font-mono text-indigo-700">{id}</span>
              {evidence && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> rcv.v1 sealed
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Cryptographically verified arrival evidence binding photographic proof, observations, and commercial verdicts.
            </p>
          </div>

          {evidence && (
            <div className="flex gap-2 self-start sm:self-center shrink-0">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl transition-colors shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? "Copied" : "Copy JSON"}</span>
              </button>
              <button
                onClick={downloadJson}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-all shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Contract</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl shadow-xs">
          {error}
        </div>
      )}

      {!evidence && !error ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-16 shadow-sm flex flex-col items-center justify-center text-center">
          <LoadingIcon size="lg" color="indigo" label="Loading sealed evidence contract…" className="flex-col gap-3" />
          <p className="text-xs text-slate-400 mt-2 font-mono">Verifying SHA-256 seal integrity</p>
        </div>
      ) : evidence ? (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200/90">
          <div className="flex items-center justify-between bg-slate-50/90 px-4 py-2.5 border-b border-slate-200 text-slate-600 text-xs font-mono">
            <span className="font-semibold text-slate-800">rcv.v1.json (Light Technical Viewer)</span>
            <span className="text-[11px] text-slate-400">Read-Only Sealed Contract</span>
          </div>
          <pre
            className="p-6 text-xs font-mono overflow-x-auto text-slate-800 bg-[#FAFAFA] leading-relaxed selection:bg-indigo-100"
            dangerouslySetInnerHTML={{ __html: highlightJSON(jsonString) }}
          />
        </div>
      ) : null}
    </div>
  );
}
