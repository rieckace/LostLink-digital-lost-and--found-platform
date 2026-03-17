import type React from 'react'
import { motion, type MotionProps } from 'framer-motion'

export function PageTransition({
  children,
  ...props
}: { children: React.ReactNode } & MotionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
