import { ImagePlus, X } from 'lucide-react'
import { useId, useMemo, useRef, useState } from 'react'
import { cn } from '../lib/cn'

type Props = {
  label: string
  onChange?: (file: File | null) => void
}

export function FileUploadField({ label, onChange }: Props) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const previewUrl = useMemo(() => {
    if (!file) return null
    return URL.createObjectURL(file)
  }, [file])

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>

      <div
        className={cn(
          'mt-2 rounded-2xl bg-white/70 p-4 ring-1 ring-slate-200 backdrop-blur',
          'dark:bg-slate-900/50 dark:ring-slate-800',
        )}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const next = e.target.files?.[0] ?? null
            setFile(next)
            onChange?.(next)
          }}
        />

        {file && previewUrl ? (
          <div className="flex items-start gap-4">
            <img
              src={previewUrl}
              alt="Selected upload preview"
              className="h-24 w-24 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-800"
            />
            <div className="flex-1">
              <div className="text-sm font-semibold">{file.name}</div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </div>
              <button
                type="button"
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-200 dark:bg-slate-800/60 dark:text-slate-100 dark:hover:bg-slate-800"
                onClick={() => inputRef.current?.click()}
              >
                Replace
              </button>
            </div>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60"
              aria-label="Remove file"
              onClick={() => {
                setFile(null)
                onChange?.(null)
                if (inputRef.current) inputRef.current.value = ''
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={cn(
              'flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 p-6 text-sm',
              'text-slate-600 hover:bg-slate-100/70 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/50',
            )}
            onClick={() => inputRef.current?.click()}
          >
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900">
              <ImagePlus className="h-5 w-5" />
            </div>
            <div className="font-medium">Click to upload an image</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              JPG/PNG, up to a few MB
            </div>
          </button>
        )}
      </div>
    </div>
  )
}
