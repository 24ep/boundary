'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FrostedGlassPanelProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'large'
  onClick?: () => void
}

export function FrostedGlassPanel({
  children,
  className,
  variant = 'default',
  onClick,
}: FrostedGlassPanelProps) {
  const blurClass = variant === 'large' ? 'backdrop-blur-macos-lg' : 'backdrop-blur-macos'
  const bgClass = variant === 'large' ? 'bg-white/60' : 'bg-white/70'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'rounded-macos border border-white/20 shadow-macos',
        blurClass,
        bgClass,
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

