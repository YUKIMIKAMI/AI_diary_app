'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7)
    const newToast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])
    
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration || 5000)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full px-4 sm:px-0">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />,
    error: <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />,
    info: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
  }

  const bgColors = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
  }

  return (
    <div
      className={cn(
        'pointer-events-auto w-full rounded-lg border p-4 shadow-lg',
        'animate-in slide-in-from-right duration-300',
        bgColors[toast.type]
      )}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {icons[toast.type]}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {toast.title}
          </p>
          {toast.message && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {toast.message}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="ml-4 inline-flex rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="閉じる"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

// 便利なヘルパー関数
export const toast = {
  success: (title: string, message?: string) => {
    const { showToast } = useToast()
    showToast({ type: 'success', title, message })
  },
  error: (title: string, message?: string) => {
    const { showToast } = useToast()
    showToast({ type: 'error', title, message })
  },
  warning: (title: string, message?: string) => {
    const { showToast } = useToast()
    showToast({ type: 'warning', title, message })
  },
  info: (title: string, message?: string) => {
    const { showToast } = useToast()
    showToast({ type: 'info', title, message })
  }
}