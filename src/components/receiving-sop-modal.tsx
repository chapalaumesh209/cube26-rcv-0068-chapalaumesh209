"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  BookOpen,
  X,
  ShieldCheck,
  Package,
  Layers,
  AlertTriangle,
  FileText,
  Scale,
  ArrowRight,
  Eye,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Lock,
} from "lucide-react";

interface ReceivingSopModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReceivingSopModal({ open, onOpenChange }: ReceivingSopModalProps) {
  const [activeTab, setActiveTab] = useState<"mission" | "gates" | "boundary" | "verdicts" | "contract">("mission");

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-scale-up">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <Dialog.Title className="text-base font-bold text-slate-900">
                  Receiving Manager · Standard Operating Procedure (SOP)
                </Dialog.Title>
                <Dialog.Description className="text-xs text-slate-500">
                  CUBE Buildathon · Pod 01 · Condition on Arrival & Evidence Record Specification
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 px-6 bg-white overflow-x-auto gap-1">
            {[
              { id: "mission", label: "1. The 5-Pod Chain", icon: ArrowRight },
              { id: "gates", label: "2. The 8 Gates", icon: Layers },
              { id: "boundary", label: "3. Absence vs Occlusion", icon: Eye },
              { id: "verdicts", label: "4. Verdict Rules", icon: Scale },
              { id: "contract", label: "5. Evidence Contract", icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? "border-brand-600 text-brand-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6 overflow-y-auto flex-1 text-slate-700 text-xs leading-relaxed space-y-6">
            {/* TAB 1: 5-Pod Chain */}
            {activeTab === "mission" && (
              <div className="space-y-4">
                <div className="p-4 bg-brand-50/60 rounded-xl border border-brand-100">
                  <h3 className="font-bold text-sm text-brand-900 mb-1">
                    Step 1 of 5: The Inbound Fortress
                  </h3>
                  <p className="text-slate-600 text-xs">
                    Supplier delivery is the origin of all supplier disputes. A pallet arrives from overseas; once accepted with a clean bill of lading without photographic proof, any downstream defect or shortage is unrecoverable.
                  </p>
                </div>

                <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[11px] overflow-x-auto">
                  <div className="text-slate-400 mb-2">// The Autonomous Fulfillment & Claims Lifecycle</div>
                  <div className="grid grid-cols-5 gap-2 text-center">
                    <div className="p-2.5 rounded-lg bg-brand-600 text-white font-bold border border-brand-400">
                      01 RECEIVING
                      <div className="text-[9px] font-normal opacity-90 mt-1">Arrival Condition</div>
                      <div className="text-[9px] text-amber-200 mt-0.5">THIS POD</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                      02 PREP
                      <div className="text-[9px] text-slate-400 mt-1">Compliance Proof</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                      03 PACK
                      <div className="text-[9px] text-slate-400 mt-1">Contents at Seal</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                      04 RETURNS
                      <div className="text-[9px] text-slate-400 mt-1">Disposition & Grade</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                      05 RECOVERY
                      <div className="text-[9px] text-slate-400 mt-1">Supplier Claim</div>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-brand-600" />
                      Who Consumes Our Output?
                    </h4>
                    <ul className="space-y-1.5 text-slate-600 text-[11px]">
                      <li>• <strong>Prep Manager (Pod 02):</strong> Consumes pack structure, unit counts, and variant verification before bagging/labeling.</li>
                      <li>• <strong>Recovery Manager (Pod 05):</strong> Ingests the sealed arrival evidence contract to substantiate chargeback claims against suppliers.</li>
                    </ul>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-emerald-600" />
                      Strict Tenancy Isolation
                    </h4>
                    <p className="text-slate-600 text-[11px]">
                      Every query, image key, and audit log is cryptographically bound to the tenant organization (<code className="bg-slate-200 px-1 py-0.5 rounded">org_id</code>). Zero cross-tenant leakage is strictly verified in automated integration tests.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: The 8 Gates */}
            {activeTab === "gates" && (
              <div className="space-y-3">
                <p className="text-slate-600 text-xs">
                  DockProof executes all 8 required arrival checks in <strong>exactly one single multimodal inference call</strong> per physical receiving unit.
                </p>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Gate #</th>
                        <th className="py-2.5 px-3">Check Key</th>
                        <th className="py-2.5 px-4">Observation Extraction</th>
                        <th className="py-2.5 px-3">Deterministic Rule</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { num: 1, key: "identity", obs: "OCR on barcode, shipping label, ASIN/SKU text", rule: "PASS if SKU/ASIN match PO line; FAIL on mismatch; UNCERTAIN on unreadable glare" },
                        { num: 2, key: "quantity", obs: "Pallet/tote item count, occlusion assessment", rule: "PASS if count == ordered; FAIL if shortage/overage confirmed; UNCERTAIN if occluded" },
                        { num: 3, key: "carton_count", obs: "External master carton counting on pallet", rule: "PASS if cartons_received == cartons_ordered; FAIL on count discrepancy" },
                        { num: 4, key: "units_per_carton", obs: "Internal grid / row pack structure count", rule: "PASS if units_per_carton matches pack spec; FAIL on irregular pack" },
                        { num: 5, key: "variant", obs: "Observed colour, finish, size attributes", rule: "PASS if visual variant matches PO line; FAIL if wrong colour/model" },
                        { num: 6, key: "carton_damage", obs: "Crushing, corner impacts, punctures, water tears", rule: "PASS if pristine; FAIL on any visible transit or water damage" },
                        { num: 7, key: "unit_damage", obs: "Product chassis dents, scratch marks, broken seals", rule: "PASS if pristine; FAIL on physical damage; UNCERTAIN if blind surface" },
                        { num: 8, key: "components", obs: "Accessory cavities against catalogue BOM spec", rule: "PASS if all present; FAIL if cavity confirmed empty; UNCERTAIN if hidden" },
                      ].map((gate) => (
                        <tr key={gate.key} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-bold text-brand-600">{gate.num}</td>
                          <td className="py-2 px-3 font-mono font-medium text-slate-900">{gate.key}</td>
                          <td className="py-2 px-4 text-slate-600">{gate.obs}</td>
                          <td className="py-2 px-3 text-slate-700">{gate.rule}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: Absence vs Occlusion */}
            {activeTab === "boundary" && (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <h3 className="font-bold text-sm text-amber-900 mb-1 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    The Evidence-vs-Inference Judgment Boundary
                  </h3>
                  <p className="text-amber-800 text-xs">
                    In automated receiving, the critical boundary is deciding whether an item is <strong>absent</strong> (defective) or simply <strong>occluded</strong> (unknown). DockProof implements a novel, defensible operational boundary.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/30 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-rose-900 text-xs">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      Definite Absence → EXCEPTION
                    </div>
                    <p className="text-[11px] text-slate-700">
                      When the line-of-sight to the item's designated cavity or slot is unobstructed and confirmed empty:
                    </p>
                    <ul className="text-[11px] text-slate-600 list-disc pl-4 space-y-1">
                      <li>Empty molded cavity where power cable should be.</li>
                      <li>Blister pack with torn seal and missing accessory.</li>
                      <li>Carton opened with visible empty slot in pack grid.</li>
                    </ul>
                    <div className="p-2 bg-rose-100/60 rounded text-[10px] text-rose-800 font-mono">
                      Verdict: EXCEPTION (Discrepancy proven for supplier claim)
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-amber-900 text-xs">
                      <HelpCircle className="w-4 h-4 text-amber-600" />
                      Visual Occlusion → UNCERTAIN
                    </div>
                    <p className="text-[11px] text-slate-700">
                      When the camera does not have an unobstructed view of the component or stock:
                    </p>
                    <ul className="text-[11px] text-slate-600 list-disc pl-4 space-y-1">
                      <li>Back row of cartons on a wrapped pallet hidden from view.</li>
                      <li>Internal compartment concealed beneath a closed cardboard lid.</li>
                      <li>Barcode glare or blur obstructing OCR confidence.</li>
                    </ul>
                    <div className="p-2 bg-amber-100/60 rounded text-[10px] text-amber-800 font-mono">
                      Verdict: UNCERTAIN (Routes to Lead Reviewer; never guess)
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px]">
                  <strong>Operational Rule:</strong> We never let a model hallucinate or infer the presence of unseen goods. Absence requires proof of emptiness; lack of proof requires an honest <code className="bg-amber-100 text-amber-800 px-1 py-0.5 rounded font-bold">UNCERTAIN</code> verdict.
                </div>
              </div>
            )}

            {/* TAB 4: Verdict Rules */}
            {activeTab === "verdicts" && (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold mb-1">
                      <CheckCircle2 className="w-4 h-4" /> PASS
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      All 8 gates confirmed satisfactory. Identity verified, count matches PO line exactly, zero transit defects, and complete accessories. Dispatched to Prep.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/40">
                    <div className="flex items-center gap-2 text-rose-800 font-bold mb-1">
                      <XCircle className="w-4 h-4" /> EXCEPTION
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      One or more gates failed (shortage, crushing, variant mismatch, missing BOM). Zero masked failures: clean receipts cannot conceal damaged stock.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40">
                    <div className="flex items-center gap-2 text-amber-800 font-bold mb-1">
                      <HelpCircle className="w-4 h-4" /> UNCERTAIN
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Insufficient evidence to decide reliably. Not a low-confidence PASS. Routes automatically to the Review Queue for Lead Reviewer manual adjudication.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-900 text-slate-100 rounded-xl space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-400" />
                    The Unforgivable Failure Kill Condition
                  </h4>
                  <p className="text-slate-300 text-[11px]">
                    <em>"If the system ever issues a commercial PASS verdict for a delivery that contains crushed packaging, an unverified short-shipment, or a cross-tenant data leak, the deployment is immediately halted and revoked."</em>
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px]">
                  <strong>Fail-Open Operational Guarantee:</strong> If an inference request times out (&gt;30s) or connectivity degrades, the dock line never halts. The intake saves as <code className="bg-slate-200 px-1 py-0.5 rounded">pending_inspection</code> with <code className="bg-slate-200 px-1 py-0.5 rounded">fail_open=true</code> for post-unloading resolution.
                </div>
              </div>
            )}

            {/* TAB 5: Evidence Contract */}
            {activeTab === "contract" && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-xs mb-1">
                    Canonical Evidence Contract: <code className="font-mono text-brand-600">rcv.v1</code>
                  </h3>
                  <p className="text-slate-600 text-[11px]">
                    Every completed inspection generates an immutable, tamper-evident JSON evidence contract sealed with a cryptographic SHA-256 hash. Any subsequent human override preserves the original observation and records the actor and rationale.
                  </p>
                </div>

                <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-[10px] overflow-x-auto">
                  <pre>{`{
  "schema_version": "rcv.v1",
  "record_id": "insp_01J8X9...",
  "organization_id": "org_demo_alpha",
  "subject": { "unit_id": "UNIT-0004", "sku": "SKU-PROT-1KG" },
  "operator_label": "op_amira",
  "images": [
    { "role": "pallet", "sha256": "e3b0c44298fc1c149afbf4c8996fb924..." },
    { "role": "carton", "sha256": "f4c8996fb92427ae41e4649b934ca495..." }
  ],
  "checks": [
    { "check_key": "identity", "verdict": "pass", "confidence": 98.4 },
    { "check_key": "carton_damage", "verdict": "fail", "detail": "Crushed corner on bottom-left carton" }
  ],
  "outcome": { "decision": "exception", "decided_by": "system" },
  "content_hash": "a823b194d6e902b7931fcf13b3e85e94b23..."
}`}</pre>
                </div>

                <p className="text-slate-500 text-[11px]">
                  Pod 02 (Prep) and Pod 05 (Recovery) ingest this exact schema to verify arrival condition and compute supplier chargeback claims.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
            <span>DockProof Receiving Manager · High-Precision Optical Inspection Pipeline</span>
            <Dialog.Close asChild>
              <button className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors">
                Done Exploring
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
