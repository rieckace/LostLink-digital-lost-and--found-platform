import type React from 'react'
import { cloneElement, isValidElement } from 'react'
import type { ReactElement } from 'react'

export function Slot({
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & { children: ReactElement }) {
  if (!isValidElement(children)) return null
  return cloneElement(children, props)
}
