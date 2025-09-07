import React from 'react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  label?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  className,
  label = '読み込み中...'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
    xl: 'h-16 w-16 border-4'
  }

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className={cn(
        "animate-spin rounded-full border-t-transparent",
        "border-primary-500 dark:border-primary-400",
        sizeClasses[size]
      )} />
      {label && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 animate-pulse">
          {label}
        </p>
      )}
    </div>
  )
}

export function FullPageLoading({ message = 'ページを読み込んでいます...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-700 dark:text-gray-300 font-medium">
          {message}
        </p>
      </div>
    </div>
  )
}

export function InlineLoading({ text = '処理中' }: { text?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LoadingSpinner size="sm" className="inline-block" label="" />
      <span className="text-sm text-gray-600 dark:text-gray-400">{text}</span>
    </span>
  )
}