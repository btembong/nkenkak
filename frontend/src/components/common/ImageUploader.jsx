import { useRef, useState } from 'react'
import api from '../../services/api'

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
                <i className="fas fa-camera text-[10px]" /> Change image
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-8 gap-2">
            {uploading ? (
              <>
                <i className="fas fa-spinner animate-spin text-xl" style={{ color: '#5B2D8E' }} />
                <span className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>Uploading…</span>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(91,45,142,0.08)' }}>
                  <i className="fas fa-cloud-upload-alt text-lg" style={{ color: '#5B2D8E' }} />
                </div>
                <span className="text-xs font-semibold" style={{ color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>
                  Click or drag & drop
                </span>
                <span className="text-[10px]" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                  PNG, JPG, WebP up to 10MB
                </span>
              </>
            )}
          </div>
        )}

        {uploading && value && (
          <div className="absolute inset-0 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(26,10,53,0.55)' }}>
            <i className="fas fa-spinner animate-spin text-xl text-white" />
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
          className="mt-1.5 text-[10px] font-semibold flex items-center gap-1"
          style={{ color: '#dc2626', fontFamily: 'Sora,sans-serif' }}
        >
          <i className="fas fa-times text-[9px]" /> Remove image
        </button>
      )}

      {hint && <p className="text-[10px] mt-1" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{hint}</p>}
      {error && <p className="text-[10px] mt-1" style={{ color: '#dc2626', fontFamily: 'Poppins,sans-serif' }}>{error}</p>}
    </div>
  )
}
