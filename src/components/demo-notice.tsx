'use client'

import { useState, useEffect } from 'react'
import { config, getModeMessage } from '@/lib/config'
import { X, Info, Sparkles, Zap } from 'lucide-react'

export function DemoNotice() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  
  useEffect(() => {
    // デモモードの場合のみ表示
    if (config.ui.showDemoNotice && !isDismissed) {
      setIsVisible(true)
    }
  }, [isDismissed])
  
  if (!isVisible) return null
  
  const handleDismiss = () => {
    setIsDismissed(true)
    setIsVisible(false)
  }
  
  return (
    <div className="fixed bottom-4 right-4 max-w-md z-50 animate-in slide-in-from-bottom">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow-xl p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold flex items-center gap-2">
              デモモードで動作中
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                安全
              </span>
            </h3>
            <p className="text-sm mt-1 opacity-90">
              このデモ版は課金なしで安全にお試しいただけます。
              AI応答は事前に用意された内容です。
            </p>
            <div className="mt-3 space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <Zap className="h-3 w-3" />
                <span>高速レスポンス</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Info className="h-3 w-3" />
                <span>全機能体験可能</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// 開発モード表示
export function DevModeIndicator() {
  if (config.mode !== 'development') return null
  
  return (
    <div className="fixed top-20 left-4 z-50">
      <div className="bg-green-500 text-white text-xs px-3 py-1 rounded-full shadow-lg flex items-center gap-2">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        開発モード: API使用中
      </div>
    </div>
  )
}