'use client'

import React, { useState } from 'react'
import { toggleItemAvailability, addFoodstuffItem } from './actions'

export default function InventoryList({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState(initialItems)
  const [isAdding, setIsAdding] = useState(false)

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await toggleItemAvailability(id, !currentStatus)
      setItems(items.map(item => 
        item.id === id ? { ...item, available: !currentStatus } : item
      ))
    } catch (err) {
      alert('Failed to update status')
    }
  }

  return (
    <div className="space-y-10">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Inventory Catalog</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Items: {items.length}</p>
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              isAdding ? 'bg-slate-100 text-slate-500' : 'bg-primary text-white shadow-lg shadow-blue-100 hover:scale-[1.02]'
            }`}
          >
            {isAdding ? 'Cancel' : 'Add New Item'}
          </button>
        </div>

        {isAdding && (
          <form 
            action={async (formData) => {
              const result = await addFoodstuffItem(formData)
              if (result.success) {
                setIsAdding(false)
                window.location.reload()
              } else {
                alert(result.error)
              }
            }}
            className="mb-10 p-6 bg-slate-50/50 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6 items-end animate-in fade-in slide-in-from-top-4 duration-500"
          >
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Item Name</label>
              <input 
                name="name" 
                required 
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="e.g. 50kg Parboiled Rice"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Price (₦)</label>
              <input 
                name="price" 
                type="number" 
                required 
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="0.00"
              />
            </div>
            <button className="h-[42px] px-6 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
              Save Entry
            </button>
          </form>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-50">
          <table className="min-w-full divide-y divide-slate-50">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="pro-table-header">Item Description</th>
                <th className="pro-table-header">Unit Price</th>
                <th className="pro-table-header">Inventory Status</th>
                <th className="pro-table-header text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-4 py-4 text-sm font-bold text-slate-900">{item.name}</td>
                  <td className="px-4 py-4 text-sm text-slate-600 font-black tracking-tight">
                    ₦{Number(item.price).toLocaleString()}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        item.available ? 'bg-emerald-500' : 'bg-red-500'
                      }`}></span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {item.available ? 'Active' : 'Archived'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button 
                      onClick={() => handleToggle(item.id, item.available)}
                      className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border transition-all ${
                        item.available 
                          ? 'border-red-100 text-red-500 hover:bg-red-50' 
                          : 'border-emerald-100 text-emerald-500 hover:bg-emerald-50'
                      }`}
                    >
                      {item.available ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Catalog Empty</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
