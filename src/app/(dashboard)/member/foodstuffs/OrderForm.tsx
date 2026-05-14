'use client'

import { useState } from 'react'
import { placeFoodstuffOrder } from './actions'

export default function OrderForm({ items }: { items: any[] }) {
  const [cart, setCart] = useState<{ [key: string]: number }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta)
    }))
  }

  const totalCost = items.reduce((sum, item) => sum + (cart[item.id] || 0) * Number(item.price), 0)

  const handleSubmit = async () => {
    if (totalCost === 0) return

    setIsLoading(true)
    const description = items
      .filter(item => cart[item.id] > 0)
      .map(item => `${item.name} (x${cart[item.id]})`)
      .join(', ')

    const formData = new FormData()
    formData.append('description', description)
    formData.append('totalCost', totalCost.toString())

    try {
      const result = await placeFoodstuffOrder(formData)
      if (result.success) {
        setMessage({ type: 'success', text: 'Order placed successfully!' })
        setCart({})
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to place order' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm animate-in fade-in duration-700">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-6 w-6 rounded-lg bg-primary/5 flex items-center justify-center">
          <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h2 className="text-[10px] font-semibold text-slate-900 uppercase tracking-[0.2em] font-display">Provision Catalog</h2>
      </div>
      
      {message && (
        <div className={`mb-5 px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map(item => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-2xl border border-slate-50 transition-all hover:bg-slate-50">
            <div>
              <p className="text-[11px] font-semibold text-slate-700 leading-tight">{item.name}</p>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">₦{Number(item.price).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => updateQuantity(item.id, -1)}
                className="w-6 h-6 flex items-center justify-center rounded-lg bg-white border border-slate-100 text-slate-400 hover:text-primary transition-all shadow-sm"
              >
                <span className="text-xs font-black">−</span>
              </button>
              <span className="w-4 text-center text-[10px] font-black text-slate-900">{cart[item.id] || 0}</span>
              <button 
                onClick={() => updateQuantity(item.id, 1)}
                className="w-6 h-6 flex items-center justify-center rounded-lg bg-white border border-slate-100 text-slate-400 hover:text-primary transition-all shadow-sm"
              >
                <span className="text-xs font-black">+</span>
              </button>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-300 font-medium text-[9px] uppercase tracking-widest">No provisions in current cycle</p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-5 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.2em] mb-0.5 ml-0.5">Cart Valuation</p>
          <p className="text-2xl font-light text-slate-900 font-display">₦{totalCost.toLocaleString()}</p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isLoading || totalCost === 0}
          className={`px-10 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-white transition-all shadow-lg shadow-slate-900/5 ${
            isLoading || totalCost === 0 ? 'bg-slate-100 text-slate-300' : 'bg-kova-midnight hover:opacity-90 active:scale-[0.98]'
          }`}
        >
          {isLoading ? 'Processing...' : 'Place Order'}
        </button>
      </div>
    </div>
  )
}
