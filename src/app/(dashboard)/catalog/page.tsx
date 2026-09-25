'use client';

import { useState, useEffect } from 'react';
import { Search, Package, RefreshCw, BookOpen, Layers } from 'lucide-react';
import { LoadingIcon } from '@/components/ui/loading-icon';

export default function CatalogPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/catalog${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs font-mono text-slate-500">
            <span className="font-bold text-slate-900 tracking-wider">RCV · POD 01</span>
            <span>/</span>
            <span>MASTER SKU & BOM SPECIFICATION</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Product Catalogue</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Master SKU registry, variant specifications, and Bill of Materials components.
          </p>
        </div>

        <button
          onClick={fetchProducts}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-xs disabled:opacity-50 self-start sm:self-center"
          title="Refresh catalogue"
        >
          {loading ? (
            <LoadingIcon size="xs" color="indigo" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          )}
          <span>Refresh</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search by SKU, Product Title, or Variant..."
          className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-xs transition-colors"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="text-[11px] text-slate-500 bg-slate-50/80 border-b border-slate-100 font-bold uppercase tracking-wider">
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Product Title</th>
                <th className="px-4 py-3">Colour / Variant</th>
                <th className="px-4 py-3">Units / Carton</th>
                <th className="px-4 py-3">Bill of Materials (BOM) Specs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <LoadingIcon size="lg" color="indigo" label="Loading product catalogue…" className="flex-col gap-3" />
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400 space-y-2">
                    <Package className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-800">No products found</p>
                    <p className="text-xs text-slate-400">Try adjusting your search query</p>
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  let components: string[] = [];
                  try {
                    if (p.componentsJson) components = JSON.parse(p.componentsJson);
                  } catch {}

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="px-4 py-3.5 font-mono font-bold text-indigo-700 whitespace-nowrap">
                        {p.sku}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-900 max-w-xs">
                        {p.title || p.name || 'Standard Unit'}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                        <span className="font-medium text-slate-800">{p.colour || 'Standard'}</span>
                        {p.variant ? <span className="text-slate-400 text-[11px] ml-1">· {p.variant}</span> : null}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-700 whitespace-nowrap">
                        <span className="font-semibold text-slate-900">{p.unitsPerCarton || 1}</span> units
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          {components.length > 0 ? (
                            components.map((c, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-mono border border-slate-200"
                              >
                                {c}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">Standard Assembly</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && products.length > 0 && (
          <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Showing {products.length} registered SKUs</span>
            <span className="font-mono">Reference fixtures & BOM verified</span>
          </div>
        )}
      </div>
    </div>
  );
}
