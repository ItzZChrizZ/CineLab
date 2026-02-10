import { useCallback, useRef, useState } from 'react'

interface ImageUploadProps {
  preview: string | null
  onUpload: (file: File, preview: string) => void
  onClear: () => void
}

export function ImageUpload({ preview, onUpload, onClear }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    onUpload(file, url)
  }, [onUpload])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  if (preview) {
    return (
      <div className="relative group">
        <img
          src={preview}
          alt="Reference"
          className="w-full max-h-[480px] object-contain rounded-card"
        />
        <button
          onClick={onClear}
          className="
            absolute top-3 right-3
            w-8 h-8 rounded-full bg-obsidian/80 text-ash
            flex items-center justify-center
            opacity-0 group-hover:opacity-100
            transition-opacity duration-200
            hover:text-bone
          "
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
      className={`
        cursor-pointer rounded-card border-2 border-dashed
        flex flex-col items-center justify-center
        h-80 transition-all duration-200
        ${isDragging
          ? 'border-bone bg-ash/5'
          : 'border-ash/20 hover:border-ash/40'
        }
      `}
    >
      <div className="w-16 h-16 rounded-full bg-ash/5 flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-ash/40"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
      </div>

      <p className="text-bone text-sm font-medium mb-1">
        {isDragging ? 'Drop image here' : 'Upload reference image'}
      </p>
      <p className="text-ash/40 text-xs">
        Drag & drop or click to browse — JPG, PNG
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  )
}
