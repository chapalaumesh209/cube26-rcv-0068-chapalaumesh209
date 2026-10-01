"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, UploadCloud, File, CheckCircle2, AlertTriangle, Shield, FileSpreadsheet, ArrowRight } from "lucide-react";
import { LoadingIcon } from "@/components/ui/loading-icon";

export default function ImportShipmentsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(() => {});
  }, []);

  const isEvaluator = currentUser?.role === "evaluator";

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (isEvaluator) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file || isEvaluator) return;

    setImporting(true);
    setErrorMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/shipments/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Import failed");
      } else {
        setImportedCount(data.imported || 0);
        setSuccess(true);
      }
    } catch {
      setErrorMessage("Network error during CSV ingestion.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="bg-white border border-slate-200 p-7 sm:p-8">
        <Link href="/shipments" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 mb-5">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to shipments
        </Link>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[.14em] text-amber-800">RCV · POD 02 / MANIFEST INTAKE</p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900">Import a receiving manifest</h1>
        <p className="text-sm text-slate-600 mt-2 max-w-2xl">
          Add inbound shipment records from a CSV. Each valid row creates a shipment and links it to its purchase order.
        </p>
      </div>

      {isEvaluator && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-950 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Read-only evaluator session</span>
            <p className="text-amber-900 mt-0.5">
              Manifest import is disabled for evaluators. Sign in as an operator or admin to add shipments.
            </p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div role="alert" className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {!success ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-7 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-amber-50 text-amber-800"><FileSpreadsheet className="h-5 w-5" /></div>
            <div><h2 className="text-xl font-semibold">Choose CSV file</h2><p className="text-xs text-slate-500">One manifest per import</p></div>
          </div>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg px-6 py-12 text-center transition-colors ${
              isEvaluator ? "border-slate-200 bg-slate-50 cursor-not-allowed opacity-60" : "border-slate-300 hover:border-amber-600 hover:bg-amber-50/30"
            }`}
          >
            <UploadCloud className="mx-auto h-10 w-10 text-amber-800 mb-4" />
            {file ? (
              <div className="flex items-center justify-center text-sm font-semibold text-slate-900 break-all">
                <File className="w-4 h-4 mr-2 text-brand-600" />
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-slate-800">Drop your CSV manifest here</p>
                <p className="text-xs text-slate-500 mt-1">or browse files on this device</p>
                {!isEvaluator && (
                  <label className="mt-5 inline-block px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 rounded-md text-xs font-semibold text-slate-700 cursor-pointer">
                    Browse CSV
                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      aria-label="Choose receiving manifest CSV"
                      onChange={(e) => e.target.files && setFile(e.target.files[0])}
                    />
                  </label>
                )}
              </div>
            )}
          </div>

          {file && !isEvaluator && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleImport}
                disabled={importing}
                className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-md text-xs font-semibold disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {importing ? (
                  <LoadingIcon size="xs" color="white" label="Processing Manifest…" />
                ) : (
                  <>Import shipments <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          )}
        </div>
        <aside className="bg-[#e9ebe1] border border-slate-200 rounded-lg p-6 self-start">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[.12em] text-amber-800">Manifest format / 01</p>
          <h2 className="mt-3 text-xl font-semibold">Before you import</h2>
          <ol className="mt-5 space-y-4 text-xs text-slate-700">
            <li><span className="font-mono font-bold text-amber-800 mr-2">01</span> Save your manifest as a .csv file with a header row.</li>
            <li><span className="font-mono font-bold text-amber-800 mr-2">02</span> Include <code className="text-[11px]">po_number</code> for every shipment row. <code className="text-[11px]">supplier</code> is optional.</li>
            <li><span className="font-mono font-bold text-amber-800 mr-2">03</span> Check the shipment list after import. Product lines and photos are not created by this step.</li>
          </ol>
          <p className="mt-6 border-t border-slate-300 pt-4 text-[11px] text-slate-600">Rows without a PO number are skipped. Existing PO numbers are reused within your organization.</p>
        </aside>
        </div>
      ) : (
        <div role="status" className="bg-white border border-emerald-300 rounded-lg p-8 text-center space-y-3">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
          <h2 className="text-2xl font-bold text-slate-900">Manifest imported</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {importedCount} shipment records were created and linked to purchase orders.
          </p>
          <div className="pt-3">
            <Link href="/shipments" className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-semibold hover:bg-brand-700">
              View Active Shipments
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
