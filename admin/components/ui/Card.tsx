'use client'

import { HTMLAttributes, forwardRef, ReactNode } from 'react'
import { clsx } from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'frosted' | 'elevated'
  hoverable?: boolean
  children: ReactNode
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'frosted', hoverable = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'rounded-2xl transition-all duration-300',
          variant === 'frosted' && 'frosted-glass',
          variant === 'elevated' && 'macos-card',
          variant === 'default' && 'bg-white/90 border border-gray-200/50',
          hoverable && 'hover:scale-[1.02] hover:shadow-macos-lg cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx('p-6 border-b border-gray-200/50', className)}
      {...props}
    />
  )
)

CardHeader.displayName = 'CardHeader'

export const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx('p-6', className)}
      {...props}
    />
  )
)

CardBody.displayName = 'CardBody'

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx('p-6 border-t border-gray-200/50', className)}
      {...props}
    />
  )
)

CardFooter.displayName = 'CardFooter'

