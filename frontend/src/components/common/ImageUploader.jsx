import { useRef, useState } from 'react'
import api from '../../services/api'
import { Camera, Loader2, UploadCloud, X } from 'lucide-react'

export default function ImageUploader({ value, onChange, folder = 'nkenkak', aspect, label, hint }) {
  const inputRef = useRef()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (file) => {
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      if (folder) fd.append('folder', folder)
      const res = await api.post('/upload/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onChange(res.data.url)
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      {label && <label className="label mb-1 block">{label}</label>}

      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => !uploading && inputRef.current.click()}
        className="relative rounded-2xl overflow-hidden cursor-pointer border-2 border-dashed transition-all hover:border-purple-400"
        style={{
          borderColor: value ? 'transparent' : 'rgba(91,45,142,0.2)',
          background: value ? 'transparent' : 'rgba(91,45,142,0.03)',
          minHeight: aspect === 'portrait' ? 180 : 140,
        }}
      >
        {value ? (
          <div className="relative group">
            <img
              src={value}
              alt="preview"
              className="w-full object-cover rounded-2xl"
              style={{ maxHeight: aspect === 'portrait' ? 220 : 160 }}
            />
            <div className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
              style={{ background: 'rgba(26,10,53,0.55)' }}>
              <span className="text-white text-xs font-semibold flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5"/> Change image
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-8 gap-2">
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-primary-500"/>
                <span className="text-xs text-muted-foreground">Uploading…</span>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(91,45,142,0.08)' }}>
                  <UploadCloud className="w-5 h-5 text-primary-500"/>
                </div>
                <span className="text-xs font-semibold text-primary-500" style={{ fontFamily: 'Sora,sans-serif' }}>
                  Click or drag & drop
                </span>
                <span className="text-[10px] text-muted-foreground">
                  PNG, JPG, WebP up to 10MB
                </span>
              </>
            )}
          </div>
        )}

        {uploading && value && (
          <div className="absolute inset-0 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(26,10,53,0.55)' }}>
            <Loader2 className="w-5 h-5 animate-spin text-white"/>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => handleFile(e.target.files?.[0])}
        />
      </div>

      {value && (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onChange('') }}
          className="mt-1.5 text-[10px] font-semibold flex items-center gap-1 text-red-500"
          style={{ fontFamily: 'Sora,sans-serif' }}
        >
          <X className="w-2.5 h-2.5"/> Remove image
        </button>
      )}

      {hint && <p className="text-[10px] mt-1 text-muted-foreground">{hint}</p>}
      {error && <p className="text-[10px] mt-1 text-red-500">{error}</p>}
    </div>
  )
}
