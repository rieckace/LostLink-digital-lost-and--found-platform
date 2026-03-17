import type React from 'react'
import type { ElementType } from 'react'
import { Slot } from './Slot'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  asChild?: boolean
}

export function Button({
  className,
  variant = 'primary',
  asChild,
  ...props
}: Props) {
  const Comp = (asChild ? Slot : 'button') as ElementType

  return (
    <Comp
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium',
        'transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50',
        'disabled:pointer-events-none disabled:opacity-60',
        'dark:focus-visible:ring-offset-slate-950',
        variant === 'primary' &&
          'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200',
        variant === 'secondary' &&
          'bg-white/70 text-slate-900 ring-1 ring-slate-200 hover:bg-white dark:bg-slate-900/60 dark:text-slate-100 dark:ring-slate-800 dark:hover:bg-slate-900',
        variant === 'ghost' &&
          'bg-transparent text-slate-900 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-900/60',
        className,
      )}
      {...props}
    />
  )
}
