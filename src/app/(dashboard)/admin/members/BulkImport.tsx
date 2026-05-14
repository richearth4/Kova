'use client'

import React, { useState } from 'react'
import { bulkImportMembers } from './actions'

export default function BulkImport() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = async () => {
    if (!file) return
    setIsUploading(true)
    
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const text = e.target?.result as string
        const result = await bulkImportMembers(text)
        
        if (result.success) {
          alert(`Import complete!\nCreated: ${result.results?.created}\nUpdated: ${result.results?.updated}\nFailed: ${result.results?.failed}`)
        } else {
          alert(`Import failed: ${result.error}`)
        }
        setIsUploading(false)
        setFile(null)
      }
      reader.readAsText(file)
    } catch (error) {
      alert('Failed to read file')
      setIsUploading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-amber-50 rounded-lg">
          <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-900">Bulk Member Import</h2>
      </div>
      
      <p className="text-sm text-gray-600 leading-relaxed">
        Upload a CSV file containing member data (First Name, Last Name, Email, Staff ID) to bulk create or update records.
      </p>

      <div className="flex items-center gap-4">
        <label className="flex-1 relative cursor-pointer bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-200 rounded-xl p-4 transition-colors">
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              {file ? file.name : 'Select CSV File'}
            </span>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>
        
        <button 
          onClick={handleUpload}
          disabled={!file || isUploading}
          className={`px-6 py-3 rounded-xl text-sm font-bold shadow-lg transition-all ${
            !file || isUploading 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
              : 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-100'
          }`}
        >
          {isUploading ? 'Processing...' : 'Start Import'}
        </button>
      </div>
    </div>
  )
}
