'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function Card({ children, className, hover = false, onClick }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -2 } : undefined}
      className={cn(
        'rounded-macos-lg bg-white border border-gray-200 shadow-macos p-6',
        hover && 'cursor-pointer transition-shadow hover:shadow-macos-lg',
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

