'use client'

import { useState } from 'react'
import { Search, Package, Plus } from 'lucide-react'

export default function CatalogPage() {
  const [search, setSearch] = useState('')

  const products = [
    { sku: 'SKU-APP-1', asin: 'B08N5M7S6K', title: 'MacBook Air M1', color: 'Space Gray', variant: '256GB', components: ['Laptop', 'Charger', 'Cable'] },
    { sku: 'SKU-APP-2', asin: 'B09JQL8KP9', title: 'AirPods Pro 2', color: 'White', variant: 'Standard', components: ['Earbuds', 'Case', 'Tips', 'Cable'] },
    { sku: 'SKU-SON-1', asin: 'B08F7PTF53', title: 'Sony WH-1000XM4', color: 'Black', variant: 'Noise Cancelling', components: ['Headphones', 'Case', 'Cable', 'Adapter'] },
  ]

  const filtered = products.filter(p => p.sku.toLowerCase().includes(search.toLowerCase()) || p.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Catalog</h1>
          <p className="text-sm text-gray-500">Manage products, variants, and expected components.</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-[#4F46E5] text-white hover:bg-[#4F46E5]/90 h-9 px-4 py-2">
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </button>
      </div>

      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
        <Search className="w-5 h-5 text-gray-400 ml-2" />
        <input 
          type="text" 
          placeholder="Search by SKU or Title..." 
          className="flex-1 outline-none text-sm p-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
              <tr>
                <th className="px-6 py-3">SKU</th>
                <th className="px-6 py-3">ASIN</th>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Color / Variant</th>
                <th className="px-6 py-3">Expected Components</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map(product => (
                <tr key={product.sku} className="hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{product.asin}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{product.title}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {product.color} <span className="mx-1">•</span> {product.variant}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {product.components.map(comp => (
                        <span key={comp} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100">
                          {comp}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
