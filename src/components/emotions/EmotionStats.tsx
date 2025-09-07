import React from 'react'
import { TrendingUp, TrendingDown, Minus, Heart, Calendar, BarChart3 } from 'lucide-react'

interface EmotionStatsProps {
  stats: {
    averageScore: number
    dominantEmotion: string
    totalEntries: number
    trend: 'up' | 'down' | 'stable'
  }
}

export default function EmotionStats({ stats }: EmotionStatsProps) {
  const getTrendIcon = () => {
    switch (stats.trend) {
      case 'up':
        return <TrendingUp className="h-5 w-5 text-green-500" />
      case 'down':
        return <TrendingDown className="h-5 w-5 text-red-500" />
      default:
        return <Minus className="h-5 w-5 text-gray-500" />
    }
  }

  const getTrendText = () => {
    switch (stats.trend) {
      case 'up':
        return '上昇傾向'
      case 'down':
        return '下降傾向'
      default:
        return '安定'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600'
    if (score >= 3) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* 平均スコア */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">平均スコア</span>
          <BarChart3 className="h-5 w-5 text-gray-400" />
        </div>
        <div className="flex items-baseline">
          <span className={`text-3xl font-bold ${getScoreColor(stats.averageScore)}`}>
            {stats.averageScore.toFixed(1)}
          </span>
          <span className="text-sm text-gray-500 ml-1">/ 5.0</span>
        </div>
        <div className="mt-2 flex items-center gap-1">
          {getTrendIcon()}
          <span className="text-xs text-gray-500">{getTrendText()}</span>
        </div>
      </div>

      {/* 主要な感情 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">主要な感情</span>
          <Heart className="h-5 w-5 text-gray-400" />
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {stats.dominantEmotion || '平穏'}
        </div>
        <div className="mt-2 text-xs text-gray-500">
          最も頻繁に現れる感情
        </div>
      </div>

      {/* 記録数 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">記録数</span>
          <Calendar className="h-5 w-5 text-gray-400" />
        </div>
        <div className="text-3xl font-bold text-gray-900 dark:text-white">
          {stats.totalEntries}
        </div>
        <div className="mt-2 text-xs text-gray-500">
          期間内の日記数
        </div>
      </div>

      {/* 感情の安定度 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">感情の安定度</span>
          <div className="h-5 w-5 rounded-full bg-gradient-to-r from-green-400 to-blue-500" />
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {stats.trend === 'stable' ? '安定' : stats.trend === 'up' ? '改善中' : '要注意'}
        </div>
        <div className="mt-2 text-xs text-gray-500">
          全体的な傾向
        </div>
      </div>
    </div>
  )
}