"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, UploadCloud, File, CheckCircle2, AlertTriangle, Shield } from "lucide-react";
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
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/shipments" className="inline-flex items-center text-xs text-slate-500 hover:text-slate-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Shipments
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Inbound Shipment Ingestion (CSV)</h1>
        <p className="text-xs text-slate-500 mt-1">
          Upload receiving manifest conforming to the organizer schema.
        </p>
      </div>

      {isEvaluator && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Evaluator Credentials (Read-Only Mode):</span>
            <p className="text-purple-700 mt-0.5">
              Shipment creation and CSV ingestion are disabled for the Evaluator role to prevent operational data mutation during evaluation benchmarks. Switch to Operator or Admin using the top header to import.
            </p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {!success ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              isEvaluator ? "border-slate-200 bg-slate-50 cursor-not-allowed opacity-60" : "border-slate-300 hover:bg-slate-50 cursor-pointer"
            }`}
          >
            <UploadCloud className="mx-auto h-12 w-12 text-slate-400 mb-3" />
            {file ? (
              <div className="flex items-center justify-center text-xs font-semibold text-slate-900">
                <File className="w-4 h-4 mr-2 text-brand-600" />
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-slate-800">Drag & drop receiving CSV manifest here</p>
                <p className="text-xs text-slate-400 mt-1">Supports organizer receiving_sample.csv format</p>
                {!isEvaluator && (
                  <label className="mt-3 inline-block px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700 cursor-pointer">
                    Browse File
                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
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
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition-all shadow-xs flex items-center gap-1.5"
              >
                {importing ? (
                  <LoadingIcon size="xs" color="white" label="Processing Manifest…" />
                ) : (
                  "Ingest & Seed Shipments"
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-emerald-300 rounded-xl shadow-sm p-8 text-center space-y-3">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-900">Shipments Ingested Successfully!</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {importedCount} purchase order lines have been ingested and mapped into tenant shipments.
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
