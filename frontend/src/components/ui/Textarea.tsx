import type React from 'react'
import { cn } from '../../lib/cn'

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({ className, ...props }: Props) {
  return (
    <textarea
      className={cn(
        'min-h-28 w-full resize-none rounded-xl bg-white/70 px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200',
        'placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/70',
        'transition-colors duration-200',
        'dark:bg-slate-900/60 dark:text-slate-100 dark:ring-slate-800 dark:placeholder:text-slate-500',
        className,
      )}
      {...props}
    />
  )
}
