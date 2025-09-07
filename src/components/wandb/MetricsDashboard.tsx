'use client'

import React, { useEffect, useState } from 'react'
import { wandbService } from '@/lib/wandb-service'
import { 
  ChartBarIcon, 
  ClockIcon, 
  HeartIcon, 
  ChatBubbleLeftRightIcon,
  ExclamationCircleIcon,
  ServerIcon
} from '@heroicons/react/24/outline'

interface MetricsReport {
  totalLogs: number
  avgResponseTime: number
  avgEmotionScore: string
  errorRate: string
  sessionDuration: number
  timestamp: string
}

export function MetricsDashboard() {
  const [report, setReport] = useState<MetricsReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const updateReport = () => {
      const newReport = wandbService.generateReport()
      setReport(newReport)
      setIsLoading(false)
    }

    updateReport()
    const interval = setInterval(updateReport, 5000)

    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!report || report.totalLogs === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          📊 AI パフォーマンスメトリクス
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          まだメトリクスデータがありません。AIとの対話を開始すると、ここに統計が表示されます。
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          📊 AI パフォーマンスメトリクス
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(report.timestamp).toLocaleTimeString()}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <ClockIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {report.avgResponseTime}ms
            </span>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
            平均応答時間
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <HeartIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {report.avgEmotionScore}/5
            </span>
          </div>
          <p className="text-sm text-purple-700 dark:text-purple-300 mt-2">
            感情スコア
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <ChatBubbleLeftRightIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-2xl font-bold text-green-900 dark:text-green-100">
              {report.totalLogs}
            </span>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300 mt-2">
            対話回数
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <ExclamationCircleIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <span className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {report.errorRate}%
            </span>
          </div>
          <p className="text-sm text-orange-700 dark:text-orange-300 mt-2">
            エラー率
          </p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <ServerIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
              {Math.floor(report.sessionDuration / 60)}分
            </span>
          </div>
          <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-2">
            セッション時間
          </p>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <ChartBarIcon className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            <span className="text-xl font-bold text-pink-900 dark:text-pink-100">
              W&B
            </span>
          </div>
          <p className="text-sm text-pink-700 dark:text-pink-300 mt-2">
            統合済み
          </p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          このデータはWeights & Biasesに記録され、AI精度の継続的な改善に活用されます。
          {process.env.WANDB_API_KEY ? ' (本番モード)' : ' (デモモード)'}
        </p>
      </div>
    </div>
  )
}