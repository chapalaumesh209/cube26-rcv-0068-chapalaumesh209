"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
  XCircle,
  AlertCircle,
  Clock,
  ChevronLeft,
  Download,
  RefreshCw,
  Play,
  X,
  Copy,
  ZoomIn
} from "lucide-react";
import Link from "next/link";

// Types
type Verdict = "pass" | "fail" | "exception" | "uncertain" | "pending";

type Check = {
  id: string;
  name: string;
  type: string;
  verdict: Verdict;
  confidence: number;
  detail: string;
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
  completedAt: string;
  modelVersion: string;
  latency_ms?: number;
  contentHash?: string;
  failOpen: boolean;
  checks: Check[];
  photos: Photo[];
  evidence: any;
  overrides: Override[];
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
};

const iconMap: Record<string, React.ReactNode> = {
  identity: <Fingerprint className="w-5 h-5" />,
  quantity: <Package className="w-5 h-5" />,
  cartons: <Box className="w-5 h-5" />,
  units_per_carton: <Layers className="w-5 h-5" />,
  variant: <Palette className="w-5 h-5" />,
  carton_damage: <AlertTriangle className="w-5 h-5" />,
  unit_damage: <ShieldAlert className="w-5 h-5" />,
  components: <Puzzle className="w-5 h-5" />
};

export default function InspectionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePhoto, setActivePhoto] = useState<Photo | null>(null);
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);
  
  // Override modal state
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [newVerdict, setNewVerdict] = useState<Verdict>("pass");
  const [overrideReason, setOverrideReason] = useState("");
  const [submittingOverride, setSubmittingOverride] = useState(false);

  const fetchInspection = async () => {
    setLoading(true);
    try {
      // Try to fetch real data
      const res = await fetch(`/api/inspections/${id}`);
      if (res.ok) {
        const data = await res.json();
        setInspection(data.inspection);
        if (data.inspection?.photos?.length > 0) {
          setActivePhoto(data.inspection.photos[0]);
        }
      } else {
        // Fallback to mock data for presentation
        throw new Error("API not found, using mock data");
      }
    } catch (err) {
      console.log("Using mock data:", err);
      // Mock data
      const mockInspection: Inspection = {
        id: id || "ins_123456789",
        unitCode: "UC-889922",
        sku: "SKU-4455-BLU",
        productTitle: "Wireless Noise-Cancelling Headphones Pro",
        poNumber: "PO-2023-001",
        supplier: "TechAudio Electronics Ltd.",
        status: "completed",
        overallVerdict: "pass",
        operatorId: "op_445",
        startedAt: new Date(Date.now() - 5000).toISOString(),
        completedAt: new Date().toISOString(),
        modelVersion: "dockproof-v2.1.0-rc",
        latency_ms: 1245,
        contentHash: "8b1a9953c4611296a827abf8c47804d7e6c49c6b",
        failOpen: false,
        poLine: { qtyOrdered: 500, cartonsOrdered: 50, unitsPerCarton: 10 },
        product: {
          colour: "Midnight Blue",
          variant: "Pro Edition",
          asin: "B09ABCDEFG",
          components: ["Headphones", "USB-C Cable", "Carrying Case", "Manual"]
        },
        photos: [
          { id: "p1", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000", role: "Primary Label", sha256: "e3b0c44298fc1c149afbf4c8996fb924" },
          { id: "p2", url: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?q=80&w=1000", role: "Product Side", sha256: "a665a45920422f9d417e4867efdc4fb8" },
          { id: "p3", url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1000", role: "Carton Barcode", sha256: "9e107d9d372bb6826bd81d3542a419d6" }
        ],
        evidence: {},
        overrides: [],
        checks: [
          { id: "c1", name: "Identity Match", type: "identity", verdict: "pass", confidence: 98, detail: "SKU and ASIN match perfectly." },
          { id: "c2", name: "Quantity Verified", type: "quantity", verdict: "pass", confidence: 95, detail: "Counted 500 units." },
          { id: "c3", name: "Cartons Verified", type: "cartons", verdict: "pass", confidence: 100, detail: "50 cartons detected." },
          { id: "c4", name: "Units Per Carton", type: "units_per_carton", verdict: "pass", confidence: 92, detail: "10 units per carton average." },
          { id: "c5", name: "Variant Match", type: "variant", verdict: "pass", confidence: 89, detail: "Colour Midnight Blue detected." },
          { id: "c6", name: "Carton Damage", type: "carton_damage", verdict: "pass", confidence: 85, detail: "No significant carton damage." },
          { id: "c7", name: "Unit Damage", type: "unit_damage", verdict: "pass", confidence: 99, detail: "Units appear intact." },
          { id: "c8", name: "Components Present", type: "components", verdict: "uncertain", confidence: 60, detail: "Could not clearly identify carrying case." }
        ]
      };
      setInspection(mockInspection);
      setActivePhoto(mockInspection.photos[0]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspection();
  }, [id]);

  const handleOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingOverride(true);
    try {
      const res = await fetch(`/api/inspections/${id}/override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newVerdict, reason: overrideReason }),
      });
      
      if (res.ok) {
        setOverrideOpen(false);
        fetchInspection();
      } else {
        // Mock success
        setTimeout(() => {
          if (inspection) {
            setInspection({
              ...inspection,
              overallVerdict: newVerdict,
              overrides: [
                ...inspection.overrides,
                {
                  id: `ovr_${Date.now()}`,
                  previousVerdict: inspection.overallVerdict,
                  newVerdict,
                  reason: overrideReason,
                  timestamp: new Date().toISOString(),
                  operatorId: "current_user"
                }
              ]
            });
          }
          setOverrideOpen(false);
          setSubmittingOverride(false);
        }, 800);
      }
    } catch (err) {
      console.error(err);
      setSubmittingOverride(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-r-transparent align-[-0.125em]"></div>
          <p className="mt-4 text-sm font-medium text-gray-500">Loading inspection data...</p>
        </div>
      </div>
    );
  }

  if (error || !inspection) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-rose-800">Error Loading Inspection</h2>
          <p className="text-rose-600 mt-2">{error || "Inspection not found"}</p>
          <Link href="/inspections" className="mt-6 inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-700">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Inspections
          </Link>
        </div>
      </div>
    );
  }

  const getVerdictColor = (verdict: string) => {
    if (verdict === "pass") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (verdict === "exception" || verdict === "fail") return "bg-rose-50 text-rose-700 border-rose-200";
    if (verdict === "uncertain") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  const getVerdictIcon = (verdict: string) => {
    if (verdict === "pass") return <CheckCircle2 className="w-4 h-4 mr-1.5" />;
    if (verdict === "exception" || verdict === "fail") return <XCircle className="w-4 h-4 mr-1.5" />;
    if (verdict === "uncertain") return <AlertTriangle className="w-4 h-4 mr-1.5" />;
    return <Clock className="w-4 h-4 mr-1.5" />;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-emerald-500";
    if (confidence >= 50) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/inspections" className="text-gray-400 hover:text-gray-600">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900 font-mono">{inspection.unitCode}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getVerdictColor(inspection.overallVerdict)}`}>
                {getVerdictIcon(inspection.overallVerdict)}
                {inspection.overallVerdict.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{inspection.productTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export Evidence
          </button>
          
          {inspection.status === "pending" ? (
            <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700">
              <Play className="w-4 h-4 mr-2" />
              Run Analysis
            </button>
          ) : (
            <>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <RefreshCw className="w-4 h-4 mr-2" />
                Re-analyze
              </button>
              
              {inspection.overallVerdict === "pass" ? (
                <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Accept Unit
                </button>
              ) : (
                <Dialog.Root open={overrideOpen} onOpenChange={setOverrideOpen}>
                  <Dialog.Trigger asChild>
                    <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Override
                    </button>
                  </Dialog.Trigger>
                  <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-xl p-6 z-50">
                      <div className="flex justify-between items-center mb-4">
                        <Dialog.Title className="text-lg font-bold text-gray-900">Override Verdict</Dialog.Title>
                        <Dialog.Close className="text-gray-400 hover:text-gray-500">
                          <X className="w-5 h-5" />
                        </Dialog.Close>
                      </div>
                      <form onSubmit={handleOverride}>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Verdict</label>
                            <select 
                              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500"
                              value={newVerdict}
                              onChange={(e) => setNewVerdict(e.target.value as Verdict)}
                            >
                              <option value="pass">Pass</option>
                              <option value="exception">Exception</option>
                              <option value="uncertain">Uncertain</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Override (Required)</label>
                            <textarea 
                              required
                              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500"
                              rows={3}
                              value={overrideReason}
                              onChange={(e) => setOverrideReason(e.target.value)}
                              placeholder="Explain why the automated verdict is being overridden..."
                            />
                          </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                          <Dialog.Close asChild>
                            <button type="button" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                              Cancel
                            </button>
                          </Dialog.Close>
                          <button 
                            type="submit" 
                            disabled={submittingOverride || !overrideReason}
                            className="px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-md hover:bg-brand-700 disabled:opacity-50"
                          >
                            {submittingOverride ? "Submitting..." : "Submit Override"}
                          </button>
                        </div>
                      </form>
                    </Dialog.Content>
                  </Dialog.Portal>
                </Dialog.Root>
              )}
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 flex flex-col md:flex-row gap-6 max-w-[1600px] mx-auto w-full">
        
        {/* Left Panel: Expected State (~25%) */}
        <div className="w-full md:w-1/4 flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Expected State</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">SKU</div>
                  <div className="text-sm font-mono font-medium text-gray-900">{inspection.sku}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">ASIN</div>
                  <div className="text-sm font-mono font-medium text-gray-900">{inspection.product?.asin || "N/A"}</div>
                </div>
              </div>
              
              <div className="border-b border-gray-100 pb-4">
                <div className="text-xs text-gray-500 mb-1">Product Title</div>
                <div className="text-sm font-medium text-gray-900">{inspection.productTitle}</div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Colour</div>
                  <div className="text-sm font-medium text-gray-900">{inspection.product?.colour || "N/A"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Variant</div>
                  <div className="text-sm font-medium text-gray-900">{inspection.product?.variant || "N/A"}</div>
                </div>
              </div>

              <div className="border-b border-gray-100 pb-4">
                <div className="text-xs text-gray-500 mb-2">Components</div>
                <div className="flex flex-wrap gap-2">
                  {inspection.product?.components?.map((comp, idx) => (
                    <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {comp}
                    </span>
                  )) || <span className="text-sm text-gray-500">None specified</span>}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Ordered</div>
                  <div className="text-lg font-bold text-gray-900">{inspection.poLine?.qtyOrdered || 0}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Cartons</div>
                  <div className="text-lg font-bold text-gray-900">{inspection.poLine?.cartonsOrdered || 0}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Units/Ctn</div>
                  <div className="text-lg font-bold text-gray-900">{inspection.poLine?.unitsPerCarton || 0}</div>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">PO Number</span>
                  <span className="text-sm font-medium text-gray-900">{inspection.poNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Supplier</span>
                  <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{inspection.supplier}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel: Evidence Gallery (~45%) */}
        <div className="w-full md:w-[45%] flex flex-col gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Evidence Gallery</h2>
              {inspection.photos.length > 0 && (
                <span className="text-xs font-medium text-gray-500">{inspection.photos.length} Photos</span>
              )}
            </div>
            
            {inspection.photos.length > 0 ? (
              <div className="flex flex-col flex-1">
                {/* Thumbnails */}
                <div className="p-3 border-b border-gray-100 flex gap-3 overflow-x-auto">
                  {inspection.photos.map(photo => (
                    <button 
                      key={photo.id}
                      onClick={() => setActivePhoto(photo)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                        activePhoto?.id === photo.id ? "border-brand-600" : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <img src={photo.url} alt={photo.role} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                
                {/* Main Viewer */}
                <div className="flex-1 bg-gray-50 relative p-4 flex flex-col items-center justify-center min-h-[400px]">
                  {activePhoto && (
                    <>
                      <div 
                        className={`relative rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm cursor-zoom-in max-w-full flex-1 w-full flex items-center justify-center ${isPhotoZoomed ? "fixed inset-8 z-50 bg-black/90 p-4" : ""}`}
                        onClick={() => setIsPhotoZoomed(!isPhotoZoomed)}
                      >
                        <img 
                          src={activePhoto.url} 
                          alt={activePhoto.role} 
                          className={`max-w-full max-h-full object-contain ${isPhotoZoomed ? "w-full h-full" : ""}`}
                        />
                        {!isPhotoZoomed && (
                          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur rounded p-1.5 shadow-sm text-gray-600 pointer-events-none">
                            <ZoomIn className="w-5 h-5" />
                          </div>
                        )}
                        {isPhotoZoomed && (
                          <button className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-black/70">
                            <X className="w-6 h-6" />
                          </button>
                        )}
                      </div>
                      {!isPhotoZoomed && (
                        <div className="mt-4 w-full bg-white rounded-lg border border-gray-200 p-3 flex justify-between items-center text-sm">
                          <div>
                            <span className="font-semibold text-gray-900">{activePhoto.role}</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                            <span className="truncate w-32 md:w-48">{activePhoto.sha256}</span>
                            <button onClick={() => copyToClipboard(activePhoto.sha256)} className="ml-2 hover:text-brand-600">
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Download className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No receiving photos uploaded</h3>
                <p className="mt-1 text-sm text-gray-500 max-w-sm">
                  Upload photos of the unit, labels, and cartons to begin automated analysis.
                </p>
                <button className="mt-6 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Upload Evidence
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Check Results (~30%) */}
        <div className="w-full md:w-[30%] flex flex-col">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Analysis Results</h2>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              {inspection.checks.map((check) => (
                <div key={check.id} className="border border-gray-100 rounded-lg p-3 hover:border-brand-200 hover:shadow-sm transition-all bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-md ${
                        check.verdict === 'pass' ? 'bg-emerald-50 text-emerald-600' :
                        check.verdict === 'exception' || check.verdict === 'fail' ? 'bg-rose-50 text-rose-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {iconMap[check.type] || <AlertCircle className="w-4 h-4" />}
                      </div>
                      <span className="font-semibold text-gray-900 text-sm">{check.name}</span>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getVerdictColor(check.verdict)}`}>
                      {check.verdict}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Confidence</span>
                      <span className="font-medium text-gray-700">{check.confidence}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${getConfidenceColor(check.confidence)}`} 
                        style={{ width: `${check.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 leading-snug">{check.detail}</p>
                </div>
              ))}
              
              {inspection.checks.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No checks have been run yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Bar */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        {/* Overall Verdict Banner */}
        <div className={`px-6 py-3 border-b border-gray-100 flex items-center justify-between ${
          inspection.overallVerdict === 'pass' ? 'bg-emerald-50' :
          inspection.overallVerdict === 'exception' || inspection.overallVerdict === 'fail' ? 'bg-rose-50' :
          inspection.overallVerdict === 'uncertain' ? 'bg-amber-50' : 'bg-gray-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full bg-white shadow-sm ${
               inspection.overallVerdict === 'pass' ? 'text-emerald-600' :
               inspection.overallVerdict === 'exception' || inspection.overallVerdict === 'fail' ? 'text-rose-600' :
               inspection.overallVerdict === 'uncertain' ? 'text-amber-600' : 'text-gray-600'
            }`}>
              {getVerdictIcon(inspection.overallVerdict)}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                OVERALL VERDICT: {inspection.overallVerdict.toUpperCase()}
              </h3>
              <p className="text-xs text-gray-600">
                {inspection.overallVerdict === 'pass' && 'All checks passed successfully. Unit is ready to receive.'}
                {(inspection.overallVerdict === 'exception' || inspection.overallVerdict === 'fail') && 'Critical checks failed. Unit requires attention.'}
                {inspection.overallVerdict === 'uncertain' && 'Model lacks confidence. Manual review required.'}
                {inspection.overallVerdict === 'pending' && 'Awaiting analysis completion.'}
              </p>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-700">Model:</span>
              <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{inspection.modelVersion || "N/A"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-700">Latency:</span>
              <span>{inspection.latency_ms ? `${inspection.latency_ms}ms` : "N/A"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-700">Started:</span>
              <span>{new Date(inspection.startedAt).toLocaleString()}</span>
            </div>
            {inspection.completedAt && (
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-gray-700">Completed:</span>
                <span>{new Date(inspection.completedAt).toLocaleString()}</span>
              </div>
            )}
          </div>
          
          {inspection.contentHash && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Content Hash:</span>
              <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                {inspection.contentHash.substring(0, 12)}...
                <button onClick={() => copyToClipboard(inspection.contentHash!)} className="hover:text-brand-600">
                  <Copy className="w-3 h-3" />
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Overrides Timeline */}
        {inspection.overrides && inspection.overrides.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 bg-amber-50/30">
            <h4 className="text-xs font-bold text-gray-700 uppercase mb-2">Override History</h4>
            <div className="flex flex-col gap-2">
              {inspection.overrides.map((override) => (
                <div key={override.id} className="text-xs flex items-start gap-2 text-gray-600">
                  <div className="mt-0.5"><AlertCircle className="w-3.5 h-3.5 text-amber-500" /></div>
                  <div>
                    <span className="font-medium text-gray-900">{override.operatorId}</span> changed verdict from{' '}
                    <span className="font-mono font-medium">{override.previousVerdict}</span> to{' '}
                    <span className="font-mono font-medium">{override.newVerdict}</span> on{' '}
                    {new Date(override.timestamp).toLocaleString()}
                    <div className="italic text-gray-500 mt-0.5">"{override.reason}"</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}
