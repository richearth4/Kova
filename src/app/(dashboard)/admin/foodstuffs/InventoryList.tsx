'use client'

import React, { useState } from 'react'
import { toggleItemAvailability, addFoodstuffItem, updateFoodstuffPrice } from './actions'

interface FoodstuffItem {
  id: string
  name: string
  price: number | string
  available: boolean
}

function PriceEditor({ item, onPriceUpdate }: { item: FoodstuffItem; onPriceUpdate: (id: string, price: number) => void }) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(Number(item.price).toString())
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    const newPrice = parseFloat(draft)
    if (isNaN(newPrice) || newPrice <= 0) {
      setError('Enter a valid price')
      return
    }
    setIsSaving(true)
    setError('')
    try {
      const result = await updateFoodstuffPrice(item.id, newPrice)
      if (result.success) {
        onPriceUpdate(item.id, newPrice)
        setIsEditing(false)
      } else {
        setError(result.error || 'Failed')
      }
    } catch {
      setError('Unexpected error')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2 group/price">
        <span className="text-sm font-black text-slate-900 tracking-tight">
          ₦{Number(item.price).toLocaleString()}
        </span>
        <button
          onClick={() => { setDraft(Number(item.price).toString()); setIsEditing(true) }}
          className="opacity-0 group-hover/price:opacity-100 transition-opacity p-1 rounded hover:bg-slate-100"
          title="Edit price"
        >
          <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">₦</span>
        <input
          type="number"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          className="w-28 pl-7 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
          autoFocus
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setIsEditing(false) }}
        />
      </div>
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-40 transition-all"
      >
        {isSaving ? '...' : 'Save'}
      </button>
      <button
        onClick={() => setIsEditing(false)}
        className="px-2.5 py-1.5 border border-slate-200 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
      >
        ✕
      </button>
      {error && <span className="text-[9px] font-black text-red-500">{error}</span>}
    </div>
  )
}

export default function InventoryList({ initialItems }: { initialItems: FoodstuffItem[] }) {
  const [items, setItems] = useState(initialItems)
  const [isAdding, setIsAdding] = useState(false)
  const [addError, setAddError] = useState('')

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await toggleItemAvailability(id, !currentStatus)
      setItems(items.map(item => 
        item.id === id ? { ...item, available: !currentStatus } : item
      ))
    } catch {
      alert('Failed to update status')
    }
  }

  const handlePriceUpdate = (id: string, newPrice: number) => {
    setItems(items.map(item => item.id === id ? { ...item, price: newPrice } : item))
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-light text-slate-900 tracking-tight font-display">Inventory Catalog</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {items.length} Items · {items.filter(i => i.available).length} Active
            </p>
          </div>
          <button 
            onClick={() => { setIsAdding(!isAdding); setAddError('') }}
            className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
              isAdding ? 'bg-slate-100 text-slate-500' : 'bg-kova-midnight text-white hover:opacity-90 shadow-lg shadow-slate-900/10'
            }`}
          >
            {isAdding ? 'Cancel' : '+ Add Item'}
          </button>
        </div>

        {isAdding && (
          <form 
            action={async (formData) => {
              setAddError('')
              const result = await addFoodstuffItem(formData)
              if (result.success) {
                setIsAdding(false)
                window.location.reload()
              } else {
                setAddError(result.error || 'Failed to add item')
              }
            }}
            className="mb-8 p-5 bg-slate-50/50 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 items-end animate-in fade-in slide-in-from-top-4 duration-300"
          >
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Item Name</label>
              <input 
                name="name" 
                required 
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="e.g. 50kg Parboiled Rice"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Price (₦)</label>
              <input 
                name="price" 
                type="number" 
                min="1"
                step="0.01"
                required 
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="0.00"
              />
            </div>
            <div>
              {addError && <p className="text-[9px] font-black text-red-500 mb-1.5">{addError}</p>}
              <button className="w-full h-[42px] px-5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                Save Item
              </button>
            </div>
          </form>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-50">
          <table className="min-w-full divide-y divide-slate-50">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="pro-table-header px-4 text-left">Item</th>
                <th className="pro-table-header px-4 text-left">Unit Price</th>
                <th className="pro-table-header px-4 text-left">Status</th>
                <th className="pro-table-header px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-4 py-4 text-[11px] font-bold text-slate-900">{item.name}</td>
                  <td className="px-4 py-4">
                    <PriceEditor item={item} onPriceUpdate={handlePriceUpdate} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${item.available ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                        {item.available ? 'Active' : 'Archived'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button 
                      onClick={() => handleToggle(item.id, item.available)}
                      className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all ${
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
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Catalog Empty</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
