'use client';

import { useState, useEffect } from 'react';
import { Search, Package, Plus, RefreshCw, Layers } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Product Catalogue</h1>
          <p className="text-xs text-slate-500 mt-0.5">Master SKU registry and Bill of Materials specs</p>
        </div>
        <button
          onClick={fetchProducts}
          className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
          title="Refresh catalogue"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by SKU, Product Title, or Variant..."
          className="flex-1 outline-none text-xs bg-transparent text-slate-800 placeholder-slate-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-white border border-slate-200 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm">
          <Package className="mx-auto h-8 w-8 text-slate-400 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No products found</p>
          <p className="text-xs text-slate-400 mt-0.5">Try adjusting your search query</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-slate-500 bg-slate-50 border-b border-slate-200 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Product Title</th>
                  <th className="px-4 py-3">Colour / Variant</th>
                  <th className="px-4 py-3">Units / Carton</th>
                  <th className="px-4 py-3">Expected Components</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  let components: string[] = [];
                  try {
                    if (p.componentsJson) components = JSON.parse(p.componentsJson);
                  } catch {}

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-brand-600">{p.sku}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{p.title || p.name || 'Standard Unit'}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {p.colour || 'Standard'} {p.variant ? `· ${p.variant}` : ''}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700">{p.unitsPerCarton || 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {components.length > 0 ? (
                            components.map((c, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                              >
                                {c}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[11px]">Standard Assembly</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
