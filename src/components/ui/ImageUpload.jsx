import React, { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

export default function ImageUpload({ onFilesChange, maxFiles = 8, existingImages = [] }) {
  const [previews, setPreviews] = useState(existingImages.map(url => ({ url, file: null })))
  const inputRef = useRef()

  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
    const remaining = maxFiles - previews.length
    const toAdd = validFiles.slice(0, remaining)

    const newPreviews = toAdd.map(file => ({
      url: URL.createObjectURL(file),
      file,
    }))
    const updated = [...previews, ...newPreviews]
    setPreviews(updated)
    onFilesChange(updated.map(p => p.file).filter(Boolean))
  }

  const removeImage = (idx) => {
    const updated = previews.filter((_, i) => i !== idx)
    setPreviews(updated)
    onFilesChange(updated.map(p => p.file).filter(Boolean))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      {previews.length < maxFiles && (
        <div
          onDrop={handleDrop}
          onDragOver={e=>e.preventDefault()}
          onClick={() => inputRef.current.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer
                     hover:border-forest-400 hover:bg-forest-50 transition-all"
        >
          <Upload className="mx-auto mb-2 text-gray-300" size={28}/>
          <p className="text-sm text-gray-500 font-medium">Drag & drop images or <span className="text-forest-600">click to browse</span></p>
          <p className="text-xs text-gray-400 mt-1">{previews.length}/{maxFiles} photos • JPG, PNG, WEBP</p>
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
            onChange={e => handleFiles(e.target.files)}/>
        </div>
      )}

      {/* Previews grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((p, idx) => (
            <div key={idx} className="relative aspect-square group">
              <img src={p.url} alt="" className="w-full h-full object-cover rounded-xl border border-gray-100"/>
              {idx === 0 && (
                <span className="absolute top-1.5 left-1.5 bg-forest-600 text-white text-xs px-2 py-0.5 rounded-full">
                  Cover
                </span>
              )}
              <button type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1
                           opacity-0 group-hover:opacity-100 transition hover:bg-red-500">
                <X size={12}/>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
