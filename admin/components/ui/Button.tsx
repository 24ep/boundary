'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'
import { Tooltip } from './Tooltip'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'warning' | 'success'
  size?: 'sm' | 'md' | 'lg'
  tooltip?: string
  children: ReactNode
  as?: 'button' | 'span'
}

export function Button({ 
  variant = 'primary', 
  size = 'md',
  tooltip,
  className = '',
  children,
  as = 'button',
  ...props
}: ButtonProps) {
  const baseStyles = 'macos-button inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantStyles = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 shadow-sm',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 active:bg-yellow-700 shadow-sm',
    success: 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700 shadow-sm',
  }
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-md',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-xl',
  }

  const Element = as === 'span' ? 'span' : 'button'
  const elementProps = as === 'span' ? {} : props

  const button = (
    <Element
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...elementProps}
    >
      {children}
    </Element>
  )

  if (tooltip) {
    return <Tooltip content={tooltip}>{button}</Tooltip>
  }

  return button
}

