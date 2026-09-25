"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, ChevronRight, CheckCircle2, XCircle, AlertCircle, Clock } from "lucide-react";

type Inspection = {
  id: string;
  unitCode: string;
  sku: string;
  productTitle: string;
  poNumber: string;
  status: string;
  overallVerdict: "pass" | "exception" | "uncertain" | "pending";
  startedAt: string;
};

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterVerdict, setFilterVerdict] = useState<string>("all");

  useEffect(() => {
    const fetchInspections = async () => {
      try {
        const response = await fetch("/api/inspections");
        if (response.ok) {
          const data = await response.json();
          setInspections(data.inspections || []);
        } else {
          setInspections([]);
        }
      } catch {
        setInspections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInspections();
  }, []);

  const filteredInspections = inspections.filter((ins) => {
    const matchesSearch = 
      ins.unitCode.toLowerCase().includes(search.toLowerCase()) ||
      ins.sku.toLowerCase().includes(search.toLowerCase()) ||
      ins.productTitle.toLowerCase().includes(search.toLowerCase()) ||
      ins.poNumber.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = filterVerdict === "all" || ins.overallVerdict === filterVerdict;

    return matchesSearch && matchesFilter;
  });

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case "pass":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Pass
          </span>
        );
      case "exception":
      case "fail":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Exception
          </span>
        );
      case "uncertain":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5" />
            Uncertain
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Inspections</h1>
        <p className="text-sm text-slate-500 mt-1">Every inbound unit: eight checks against the purchase order.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-brand-600 focus:border-brand-600 sm:text-sm transition-colors"
            placeholder="Search by Unit Code, SKU, Title, or PO..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-gray-400" />
          </div>
          <select
            className="block w-full pl-10 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-brand-600 focus:border-brand-600 sm:text-sm rounded-md bg-white appearance-none"
            value={filterVerdict}
            onChange={(e) => setFilterVerdict(e.target.value)}
          >
            <option value="all">All Verdicts</option>
            <option value="pass">Pass</option>
            <option value="exception">Exception</option>
            <option value="uncertain">Uncertain</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Unit Code
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  SKU / Title
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  PO Number
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Verdict
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Date
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading inspections...</p>
                  </td>
                </tr>
              ) : filteredInspections.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    No inspections found.
                  </td>
                </tr>
              ) : (
                filteredInspections.map((inspection) => (
                  <tr key={inspection.id} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      <span className="font-mono">{inspection.unitCode}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="font-medium text-gray-900">{inspection.sku}</div>
                      <div className="text-gray-500">{inspection.productTitle}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {inspection.poNumber}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {getVerdictBadge(inspection.overallVerdict)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(inspection.startedAt).toLocaleDateString()}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <Link
                        href={`/inspections/${inspection.id}`}
                        className="text-brand-600 hover:text-brand-900 inline-flex items-center gap-1"
                      >
                        View <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
