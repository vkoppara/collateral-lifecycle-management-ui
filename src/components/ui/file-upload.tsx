import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'

import { cn } from '@/lib/utils'

type FileUploadProps = {
  label?: string
  accept?: string
  onFileChange?: (file: File | null) => void
}

function FileUpload({
  label = 'Drag and drop a file here',
  accept,
  onFileChange,
}: FileUploadProps) {
  const [fileName, setFileName] = useState('No file selected')
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const updateFile = (file: File | null) => {
    setFileName(file?.name ?? 'No file selected')
    onFileChange?.(file)
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    updateFile(file)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)

    const file = event.dataTransfer.files?.[0] ?? null
    updateFile(file)
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)
  }

  return (
    <div className="space-y-2">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center transition-colors',
          isDragging && 'border-slate-500 bg-slate-50',
        )}
      >
        <p className="text-sm text-slate-600">{label}</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-3 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
        >
          Upload file
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      <p className="truncate text-xs text-slate-500" title={fileName}>
        {fileName}
      </p>
    </div>
  )
}

export { FileUpload }
