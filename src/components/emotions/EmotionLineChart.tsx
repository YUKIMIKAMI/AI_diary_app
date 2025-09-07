'use client'

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface EmotionLineChartProps {
  data: any[]
  period: 'week' | 'month' | 'year'
}

const emotionColors = {
  joy: '#FFD700',
  sadness: '#4682B4',
  anger: '#DC143C',
  fear: '#8B008B',
  surprise: '#FF69B4',
  disgust: '#228B22',
  trust: '#87CEEB',
  anticipation: '#FFA500',
  overall: '#6B7280'
}

const emotionLabels: { [key: string]: string } = {
  joy: '喜び',
  sadness: '悲しみ',
  anger: '怒り',
  fear: '恐れ',
  surprise: '驚き',
  disgust: '嫌悪',
  trust: '信頼',
  anticipation: '期待',
  overall: '総合'
}

export default function EmotionLineChart({ data, period }: EmotionLineChartProps) {
  // 日付フォーマット
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    if (period === 'week') {
      return format(date, 'E', { locale: ja })
    } else if (period === 'month') {
      return format(date, 'd日', { locale: ja })
    } else {
      return format(date, 'M月', { locale: ja })
    }
  }

  // データを間引く（年間表示の場合）
  const processedData = period === 'year' 
    ? data.filter((_, index) => index % 7 === 0) // 週1回のデータポイント
    : data

  // カスタムツールチップ
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white mb-2">
            {label}
          </p>
          {payload.map((entry: any) => (
            <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600 dark:text-gray-400">
                {emotionLabels[entry.dataKey]}:
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {Math.round(entry.value)}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={processedData.map(d => ({
          ...d,
          date: formatDate(d.date)
        }))}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="date" 
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          domain={[0, 100]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          formatter={(value) => emotionLabels[value]}
          wrapperStyle={{ fontSize: '12px' }}
        />
        
        {/* 総合スコアを太い線で表示 */}
        <Line
          type="monotone"
          dataKey="overall"
          stroke={emotionColors.overall}
          strokeWidth={3}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        
        {/* 各感情の線 */}
        <Line
          type="monotone"
          dataKey="joy"
          stroke={emotionColors.joy}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="sadness"
          stroke={emotionColors.sadness}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="trust"
          stroke={emotionColors.trust}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="anticipation"
          stroke={emotionColors.anticipation}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}