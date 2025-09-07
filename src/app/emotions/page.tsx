'use client'

import React, { useState, useEffect } from 'react'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { ja } from 'date-fns/locale'
import EmotionLineChart from '@/components/emotions/EmotionLineChart'
import EmotionPieChart from '@/components/emotions/EmotionPieChart'
import EmotionHeatmap from '@/components/emotions/EmotionHeatmap'
import EmotionStats from '@/components/emotions/EmotionStats'
import { Button } from '@/components/ui/button'
import { Calendar, TrendingUp, PieChart, Activity, Download } from 'lucide-react'

type Period = 'week' | 'month' | 'year'
type ChartView = 'line' | 'pie' | 'heatmap'

export default function EmotionsPage() {
  const [period, setPeriod] = useState<Period>('month')
  const [chartView, setChartView] = useState<ChartView>('line')
  const [emotionData, setEmotionData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    averageScore: 0,
    dominantEmotion: '',
    totalEntries: 0,
    trend: 'stable' as 'up' | 'down' | 'stable'
  })

  // 感情データを取得
  useEffect(() => {
    fetchEmotionData()
  }, [period])

  const fetchEmotionData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/emotions/aggregate?period=${period}`)
      if (response.ok) {
        const data = await response.json()
        setEmotionData(data.chartData || [])
        setStats(data.stats || {
          averageScore: 0,
          dominantEmotion: '',
          totalEntries: 0,
          trend: 'stable'
        })
      }
    } catch (error) {
      console.error('感情データの取得に失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          感情分析ダッシュボード
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          あなたの感情の変化を可視化して、心の健康を見守ります
        </p>
      </div>

      {/* 統計カード */}
      <EmotionStats stats={stats} />

      {/* コントロール */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* 期間選択 */}
          <div className="flex gap-2">
            <Button
              variant={period === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('week')}
            >
              週間
            </Button>
            <Button
              variant={period === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('month')}
            >
              月間
            </Button>
            <Button
              variant={period === 'year' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('year')}
            >
              年間
            </Button>
          </div>

          {/* ビュー切り替え */}
          <div className="flex gap-2">
            <Button
              variant={chartView === 'line' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setChartView('line')}
              title="折れ線グラフ"
            >
              <TrendingUp className="h-4 w-4" />
            </Button>
            <Button
              variant={chartView === 'pie' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setChartView('pie')}
              title="円グラフ"
            >
              <PieChart className="h-4 w-4" />
            </Button>
            <Button
              variant={chartView === 'heatmap' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setChartView('heatmap')}
              title="ヒートマップ"
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>

          {/* エクスポート */}
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            エクスポート
          </Button>
        </div>
      </div>

      {/* グラフエリア */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4" />
              <p className="text-gray-500">データを読み込み中...</p>
            </div>
          </div>
        ) : emotionData.length === 0 ? (
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">まだデータがありません</p>
              <p className="text-sm text-gray-400 mt-2">
                日記を書くと感情分析が表示されます
              </p>
            </div>
          </div>
        ) : (
          <div className="h-96">
            {chartView === 'line' && (
              <EmotionLineChart data={emotionData} period={period} />
            )}
            {chartView === 'pie' && (
              <EmotionPieChart data={emotionData} />
            )}
            {chartView === 'heatmap' && (
              <EmotionHeatmap data={emotionData} period={period} />
            )}
          </div>
        )}
      </div>

      {/* 凡例（ヒートマップ以外の時のみ表示） */}
      {chartView !== 'heatmap' && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            感情の種類
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: '喜び', color: '#FFD700' },
              { name: '悲しみ', color: '#4682B4' },
              { name: '怒り', color: '#DC143C' },
              { name: '恐れ', color: '#8B008B' },
              { name: '驚き', color: '#FF69B4' },
              { name: '嫌悪', color: '#228B22' },
              { name: '信頼', color: '#87CEEB' },
              { name: '期待', color: '#FFA500' }
            ].map(emotion => (
              <div key={emotion.name} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded" 
                  style={{ backgroundColor: emotion.color }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {emotion.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}