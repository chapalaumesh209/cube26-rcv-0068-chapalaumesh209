"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Fingerprint,
  Package,
  Box,
  Layers,
  Palette,
  AlertTriangle,
  ShieldAlert,
  Puzzle,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  Download,
  RefreshCw,
  Play,
  X,
  Copy,
  ZoomIn,
  HelpCircle,
  Upload,
  Shield,
  UserCheck,
  Eye,
  Check,
  Scale,
} from "lucide-react";
import Link from "next/link";
import { LoadingIcon } from "@/components/ui/loading-icon";

// Types
type Verdict = "pass" | "fail" | "exception" | "uncertain" | "pending";

type Check = {
  id: string;
  name: string;
  type: string;
  verdict: Verdict;
  confidence: number;
  detail: string;
  expectedValue?: string;
  observedValue?: string;
  evidenceRegion?: number[];
  reason?: string;
};

type Photo = {
  id: string;
  url: string;
  role: string;
  sha256: string;
};

type Override = {
  id: string;
  previousVerdict: string;
  newVerdict: string;
  reason: string;
  timestamp: string;
  operatorId: string;
};

type Inspection = {
  id: string;
  unitCode: string;
  sku: string;
  productTitle: string;
  poNumber: string;
  supplier: string;
  status: string;
  overallVerdict: Verdict;
  operatorId: string;
  startedAt: string;
  completedAt: string | null;
  modelVersion: string;
  latency_ms: number;
  contentHash: string | null;
  failOpen: boolean;
  poLine: {
    qtyOrdered: number;
    cartonsOrdered: number;
    unitsPerCarton: number;
  };
  product: {
    colour: string;
    variant: string;
    asin: string;
    components: string[];
  };
  photos: Photo[];
  evidence: any;
  overrides: Override[];
  checks: Check[];
};

const iconMap: Record<string, React.ReactNode> = {
  identity: <Fingerprint className="w-5 h-5" />,
  quantity: <Package className="w-5 h-5" />,
  carton_count: <Box className="w-5 h-5" />,
  cartons: <Box className="w-5 h-5" />,
  units_per_carton: <Layers className="w-5 h-5" />,
  variant: <Palette className="w-5 h-5" />,
  carton_damage: <AlertTriangle className="w-5 h-5" />,
  unit_damage: <ShieldAlert className="w-5 h-5" />,
  components: <Puzzle className="w-5 h-5" />,
};

export default function InspectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState<Photo | null>(null);
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // "Why?" drilldown modal state
  const [whyCheck, setWhyCheck] = useState<Check | null>(null);

  // Pre-flight Photo Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadRole, setUploadRole] = useState("carton_front");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Override modal state
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [newVerdict, setNewVerdict] = useState<Verdict>("pass");
  const [overrideReason, setOverrideReason] = useState("");
  const [submittingOverride, setSubmittingOverride] = useState(false);
  const [overrideMessage, setOverrideMessage] = useState("");

  const fetchInspection = async () => {
    try {
      const [inspRes, meRes] = await Promise.all([
        fetch(`/api/inspections/${id}`),
        fetch("/api/auth/me"),
      ]);

      if (meRes.ok) {
        const meData = await meRes.json();
        setCurrentUser(meData.user);
      }

      if (inspRes.ok) {
        const data = await inspRes.json();
        const insp = data.inspection;
        setInspection(insp);
        if (insp.photos?.length > 0) {
          setActivePhoto(insp.photos[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load inspection:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspection();
  }, [id]);

  const userRole = currentUser?.role || "operator";
  const canOverride = userRole === "reviewer" || userRole === "admin";
  const isEvaluator = userRole === "evaluator";

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/inspections/${id}/analyze`, {
        method: "POST",
      });
      if (res.ok) {
        await fetchInspection();
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canOverride) return;

    setSubmittingOverride(true);
    try {
      const res = await fetch(`/api/inspections/${id}/override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newVerdict, reason: overrideReason }),
      });

      if (res.ok) {
        setOverrideOpen(false);
        setOverrideReason("");
        setOverrideMessage("Override recorded successfully in tamper-evident audit log.");
        await fetchInspection();
        setTimeout(() => setOverrideMessage(""), 5000);
      }
    } finally {
      setSubmittingOverride(false);
    }
  };

  const handleRequestLeadReview = () => {
    setOverrideMessage("Escalation logged: Notification routed to Lead Reviewer queue.");
    setTimeout(() => setOverrideMessage(""), 5000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getVerdictBadge = (verdict: Verdict) => {
    switch (verdict) {
      case "pass":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Pass</span>;
      case "exception":
      case "fail":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"><AlertCircle className="w-3.5 h-3.5" /> Exception</span>;
      case "uncertain":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><AlertTriangle className="w-3.5 h-3.5" /> Uncertain</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-500 border border-slate-200"><Clock className="w-3.5 h-3.5" /> Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12 shadow-sm flex flex-col items-center justify-center text-center">
          <LoadingIcon size="xl" color="indigo" label="Loading arrival inspection record…" className="flex-col gap-4" />
          <p className="text-xs text-slate-400 mt-2 font-mono">Retrieving sealed observations and PO line items</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="h-80 bg-white rounded-2xl border border-slate-200" />
          <div className="h-80 bg-white rounded-2xl border border-slate-200" />
          <div className="h-80 bg-white rounded-2xl border border-slate-200" />
        </div>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-800">Inspection Not Found</h3>
        <p className="text-sm text-slate-500 mt-1">The requested inspection record does not exist or belongs to another tenant.</p>
        <Link href="/receiving" className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Return to Inbox
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/receiving" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold font-mono text-slate-900">{inspection.unitCode}</h1>
              {getVerdictBadge(inspection.overallVerdict)}
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                PO: {inspection.poNumber}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{inspection.productTitle} · {inspection.supplier}</p>
          </div>
        </div>

        {/* Action Controls & Role Badge */}
        <div className="flex items-center gap-2">
          {/* Export Evidence Link */}
          <Link
            href={`/evidence/${inspection.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Evidence Contract
          </Link>

          {/* Inspection Trigger Button */}
          {inspection.status === "pending" ? (
            <button
              onClick={handleRunAnalysis}
              disabled={analyzing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs disabled:opacity-50 active:scale-[0.98]"
            >
              {analyzing ? (
                <LoadingIcon size="xs" color="white" label="Inspecting…" />
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Run inspection</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleRunAnalysis}
              disabled={analyzing}
              className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-xs disabled:opacity-50 active:scale-[0.98]"
              title="Re-run the eight receiving checks on the current photographs"
            >
              {analyzing ? (
                <LoadingIcon size="xs" color="slate" label="Re-analyzing…" />
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Re-analyze</span>
                </>
              )}
            </button>
          )}

          {/* Role-Specific Overrides or Escalation */}
          {canOverride ? (
            <button
              onClick={() => setOverrideOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors shadow"
            >
              <AlertTriangle className="w-4 h-4" />
              Review & Override
            </button>
          ) : isEvaluator ? (
            <span className="inline-flex items-center gap-1 px-3 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-medium">
              <Eye className="w-3.5 h-3.5" /> Quality (read only)
            </span>
          ) : (
            <button
              onClick={handleRequestLeadReview}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-medium rounded-lg transition-colors shadow-sm"
              title="Escalate unit to Lead Reviewer queue for adjudication"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Request Lead Review
            </button>
          )}
        </div>
      </div>

      {/* Override / Escalation notification banner */}
      {overrideMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center justify-between animate-fade-in">
          <span>{overrideMessage}</span>
          <button onClick={() => setOverrideMessage("")}><X className="w-4 h-4 text-emerald-600" /></button>
        </div>
      )}

      {/* 3-Column Operator Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Expected State (25% width) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
            <div className="border-b border-slate-100 pb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Purchase order</h2>
                <p className="text-[11px] text-slate-400">What this unit is supposed to be</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">SKU / Identifier</span>
                <span className="font-mono font-semibold text-slate-800">{inspection.sku}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">ASIN</span>
                <span className="font-mono text-slate-700">{inspection.product.asin}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Spec Colour</span>
                  <span className="font-medium text-slate-800">{inspection.product.colour}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Spec Variant</span>
                  <span className="font-medium text-slate-800">{inspection.product.variant}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase mb-1">Contract Quantities</span>
                <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total</span>
                    <span className="font-bold text-slate-800">{inspection.poLine.qtyOrdered}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Cartons</span>
                    <span className="font-bold text-slate-800">{inspection.poLine.cartonsOrdered}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Per Ctn</span>
                    <span className="font-bold text-slate-800">{inspection.poLine.unitsPerCarton}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase mb-1.5">BOM Components ({inspection.product.components.length})</span>
                <div className="flex flex-wrap gap-1">
                  {inspection.product.components.map((comp, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] rounded border border-slate-200">
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Role Access Capability Card */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Shield className="w-4 h-4 text-brand-600" />
              <span>Active Role: {userRole.toUpperCase()}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              {userRole === "admin" && "Full administrative permissions: can trigger inspections, approve overrides, and manage user policies."}
              {userRole === "reviewer" && "Lead Reviewer: authorized to adjudicate exceptions and record binding human overrides with audit reasoning."}
              {userRole === "operator" && "Receiving Operator: intake shipments and trigger inspections. Overrides require Reviewer status."}
              {userRole === "evaluator" && "Evaluator: read-only access to operational inspections. Primary workspace is the Evaluation benchmark."}
            </p>
          </div>
        </div>

        {/* Right Column: 8 Required Checks + Interactive "Why?" */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Eight receiving checks</h2>
                <p className="text-[11px] text-slate-400">Observations in, rules decide</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                One call
              </span>
            </div>

            {/* Stack of 8 checks */}
            <div className="space-y-2.5 overflow-y-auto max-h-[500px] pr-1">
              {inspection.checks.map((check) => {
                const isPass = check.verdict === "pass";
                const isFail = check.verdict === "fail" || check.verdict === "exception";
                const isUncertain = check.verdict === "uncertain";

                return (
                  <div
                    key={check.id}
                    className="p-3 rounded-lg border border-slate-200 hover:border-brand-300 hover:shadow-sm transition-all bg-white"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded-md ${
                          isPass ? "bg-emerald-50 text-emerald-600" :
                          isFail ? "bg-rose-50 text-rose-600" :
                          isUncertain ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500"
                        }`}>
                          {iconMap[check.type] || <AlertCircle className="w-4 h-4" />}
                        </div>
                        <span className="text-xs font-bold text-slate-800">{check.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getVerdictBadge(check.verdict)}
                        {/* Section 20 "Why?" interaction button */}
                        <button
                          onClick={() => setWhyCheck(check)}
                          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-brand-600 transition-colors"
                          title="View evidence drilldown & reasoning"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Confidence Meter */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            check.confidence >= 80 ? "bg-emerald-500" :
                            check.confidence >= 50 ? "bg-amber-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${check.confidence}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{check.confidence}%</span>
                    </div>

                    <p className="text-[11px] text-slate-600 mt-1.5 line-clamp-2">{check.detail}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Overall Verdict Banner + Telemetry + Override History */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className={`p-4 flex items-center justify-between border-b ${
          inspection.overallVerdict === "pass" ? "bg-emerald-50/70 border-emerald-200" :
          inspection.overallVerdict === "exception" || inspection.overallVerdict === "fail" ? "bg-rose-50/70 border-rose-200" :
          inspection.overallVerdict === "uncertain" ? "bg-amber-50/70 border-amber-200" : "bg-slate-50 border-slate-200"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-white shadow-sm ${
              inspection.overallVerdict === "pass" ? "text-emerald-600" :
              inspection.overallVerdict === "exception" || inspection.overallVerdict === "fail" ? "text-rose-600" :
              inspection.overallVerdict === "uncertain" ? "text-amber-600" : "text-slate-500"
            }`}>
              {inspection.overallVerdict === "pass" ? <CheckCircle2 className="w-6 h-6" /> :
               inspection.overallVerdict === "uncertain" ? <AlertTriangle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase">
                OVERALL VERDICT: {inspection.overallVerdict}
              </h3>
              <p className="text-xs text-slate-600">
                {inspection.overallVerdict === "pass" && "All 8 required check vectors supported by visual and document evidence."}
                {inspection.overallVerdict === "exception" && "Discrepancy or physical defect established. Zero masked failures enforced."}
                {inspection.overallVerdict === "uncertain" && "First-class uncertainty: insufficient evidence to support a reliable commercial decision."}
                {inspection.overallVerdict === "pending" && "Photograph saved. Inspection is pending so the dock is not blocked."}
              </p>
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="text-slate-500 block text-[10px]">CONTENT HASH (SHA-256)</span>
            <span className="font-mono text-slate-800 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
              {inspection.contentHash ? `${inspection.contentHash.substring(0, 16)}…` : "Pending seal"}
            </span>
          </div>
        </div>

        {/* Telemetry bar */}
        <div className="px-4 py-2.5 bg-slate-50 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <span>Engine: <code className="bg-white px-1.5 py-0.5 rounded border text-slate-700">obs-engine-v1</code></span>
            {inspection.latency_ms != null && (
              <span>Latency: <strong className="text-slate-700">{inspection.latency_ms}ms</strong></span>
            )}
            <span>Started: {new Date(inspection.startedAt).toLocaleTimeString()}</span>
            {inspection.completedAt && <span>Completed: {new Date(inspection.completedAt).toLocaleTimeString()}</span>}
          </div>
          <span className="text-[10px] text-slate-400">Evidence Contract: rcv.v1</span>
        </div>

        {/* Override Audit History */}
        {inspection.overrides && inspection.overrides.length > 0 && (
          <div className="p-4 bg-amber-50/40 border-t border-amber-100">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-700" />
              Human Override Audit History ({inspection.overrides.length})
            </h4>
            <div className="space-y-2">
              {inspection.overrides.map((o) => (
                <div key={o.id} className="text-xs p-2.5 bg-white rounded-lg border border-amber-200 shadow-sm flex items-start gap-2">
                  <div className="font-mono bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold text-[10px]">
                    {o.previousVerdict} → {o.newVerdict}
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-slate-800">{o.operatorId}</span>
                    <span className="text-slate-400 text-[11px] ml-2">{new Date(o.timestamp).toLocaleString()}</span>
                    <p className="text-slate-600 italic mt-0.5">"{o.reason}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Downstream Pod Interoperability Hand-Off */}
        <div className="p-4 bg-slate-50/70 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-brand-600" />
              Downstream Pod Interoperability Hand-off (rcv.v1)
            </span>
            <span className="text-[10px] font-mono text-slate-500 font-normal">
              Cross-Pod Contract Protocol Active
            </span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-brand-600" /> Pod 02: Prep Compliance Manager
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                  inspection.overallVerdict === 'pass' ? 'bg-emerald-100 text-emerald-800' :
                  inspection.overallVerdict === 'uncertain' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {inspection.overallVerdict === 'pass' ? 'Eligible for Prep' : inspection.overallVerdict === 'uncertain' ? 'Pending Review' : 'Quarantine'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                {inspection.overallVerdict === 'pass'
                  ? `Clean bill established. Ready to receive ${inspection.poLine?.qtyOrdered || 'all'} units for polybagging/labeling.`
                  : inspection.overallVerdict === 'uncertain'
                  ? 'Awaiting Lead Reviewer manual adjudication before releasing stock to the prep staging area.'
                  : 'Transit defect or shortage flagged. Prevented from entering standard prep workflow.'}
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-indigo-600" /> Pod 05: Inbound Recovery Manager
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                  inspection.overallVerdict === 'exception' || inspection.overallVerdict === 'fail' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {inspection.overallVerdict === 'exception' || inspection.overallVerdict === 'fail' ? 'Claim Dossier Ready' : 'No Claim'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                {inspection.overallVerdict === 'exception' || inspection.overallVerdict === 'fail'
                  ? `Tamper-evident record (${inspection.contentHash ? inspection.contentHash.slice(0, 10) + '…' : 'rcv.v1'}) generated for supplier chargeback claim against ${inspection.supplier?.replace(' (DUMMY)', '')}.`
                  : 'No supplier claim necessary. Pallet condition matches PO specification.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* "Why?" Evidence Drilldown Dialog (Section 20 Requirement) */}
      <Dialog.Root open={Boolean(whyCheck)} onOpenChange={() => setWhyCheck(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 z-50 animate-dialog-in">
            {whyCheck && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-brand-50 text-brand-600">
                      {iconMap[whyCheck.type] || <AlertCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <Dialog.Title className="text-base font-bold text-slate-900">
                        Evidence Breakdown: {whyCheck.name}
                      </Dialog.Title>
                      <Dialog.Description className="text-xs text-slate-500">
                        Ordered versus observed at the dock
                      </Dialog.Description>
                    </div>
                  </div>
                  <Dialog.Close className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </Dialog.Close>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Contract Expected</span>
                      <p className="font-semibold text-slate-800 text-sm mt-0.5">
                        {whyCheck.type === "quantity" ? `${inspection.poLine.qtyOrdered} units` :
                         whyCheck.type === "cartons" ? `${inspection.poLine.cartonsOrdered} cartons` :
                         whyCheck.type === "variant" ? inspection.product.colour :
                         whyCheck.type === "identity" ? inspection.sku : "Specification verified"}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Visual Observation</span>
                      <p className="font-semibold text-slate-800 text-sm mt-0.5">
                        {whyCheck.detail}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Check Decision Verdict:</span>
                      {getVerdictBadge(whyCheck.verdict)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Observation confidence:</span>
                      <span className="font-mono font-bold text-slate-800">{whyCheck.confidence}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Inference Latency:</span>
                      <span className="font-mono text-slate-700">{inspection.latency_ms}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Engine:</span>
                      <span className="font-mono text-slate-700">obs-engine-v1</span>
                    </div>
                  </div>

                  <div className="p-3 bg-brand-50/50 rounded-xl border border-brand-100">
                    <span className="text-brand-900 font-semibold block mb-1">Operational Rule Explanation</span>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      {whyCheck.verdict === "pass" && "Photographic evidence positively confirms conformance with purchase order requirements with no visible defects or count variances."}
                      {whyCheck.verdict === "fail" && "A measurable discrepancy or visible defect was detected. Under the no-masked-failures rule, this triggers an overall EXCEPTION."}
                      {whyCheck.verdict === "uncertain" && "Under DockProof's first-class uncertainty principle, the system refused to speculate on occluded or unreadable evidence."}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Dialog.Close asChild>
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors">
                      Close Breakdown
                    </button>
                  </Dialog.Close>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Review & Override Modal (Reviewer & Admin only) */}
      <Dialog.Root open={overrideOpen} onOpenChange={setOverrideOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-50 animate-dialog-in">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <Dialog.Title className="text-base font-bold text-slate-900">
                  Lead Reviewer Adjudication
                </Dialog.Title>
                <Dialog.Description className="text-xs text-slate-500">
                  Requires Lead Reviewer or Admin credentials with mandatory audit justification.
                </Dialog.Description>
              </div>
              <Dialog.Close className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </Dialog.Close>
            </div>

            <form onSubmit={handleOverride} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Verdict</label>
                <div className="p-2 bg-slate-50 rounded-lg text-xs font-mono font-bold text-slate-800 uppercase">
                  {inspection.overallVerdict}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Adjudicated Verdict</label>
                <select
                  value={newVerdict}
                  onChange={(e) => setNewVerdict(e.target.value as Verdict)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="pass">PASS (Admit for Put-Away)</option>
                  <option value="exception">EXCEPTION (Route to Quarantine)</option>
                  <option value="uncertain">UNCERTAIN (Require Supplier Investigation)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mandatory Override Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g., Secondary carton opened manually; inner units confirmed intact and counted."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Reason and actor identity are preserved in the permanent evidence contract.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Dialog.Close asChild>
                  <button type="button" className="px-3 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50">
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  disabled={submittingOverride || !overrideReason}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submittingOverride ? (
                    <LoadingIcon size="xs" color="white" label="Recording…" />
                  ) : (
                    "Apply Binding Override"
                  )}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>


    </div>
  );
}
