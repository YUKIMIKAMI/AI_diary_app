'use client'

import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts'

interface EmotionPieChartProps {
  data: any[]
}

const emotionColors = {
  joy: '#FFD700',
  sadness: '#4682B4',
  anger: '#DC143C',
  fear: '#8B008B',
  surprise: '#FF69B4',
  disgust: '#228B22',
  trust: '#87CEEB',
  anticipation: '#FFA500'
}

const emotionLabels: { [key: string]: string } = {
  joy: '喜び',
  sadness: '悲しみ',
  anger: '怒り',
  fear: '恐れ',
  surprise: '驚き',
  disgust: '嫌悪',
  trust: '信頼',
  anticipation: '期待'
}

export default function EmotionPieChart({ data }: EmotionPieChartProps) {
  // 全期間の感情を集計
  const emotionTotals = Object.keys(emotionColors).reduce((acc, emotion) => {
    const total = data.reduce((sum, day) => sum + (day[emotion] || 0), 0)
    return { ...acc, [emotion]: total }
  }, {} as { [key: string]: number })

  // パイチャート用のデータ形式に変換
  const pieData = Object.entries(emotionTotals)
    .map(([emotion, value]) => ({
      name: emotionLabels[emotion],
      value: Math.round(value),
      color: emotionColors[emotion as keyof typeof emotionColors]
    }))
    .sort((a, b) => b.value - a.value)

  // カスタムラベル
  const renderCustomLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    if (percent < 0.05) return null // 5%未満は表示しない
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  // カスタムツールチップ
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.payload.color }}
            />
            <span className="font-medium text-gray-900 dark:text-white">
              {data.name}
            </span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            合計: {data.value.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            割合: {((data.percent || 0) * 100).toFixed(1)}%
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomLabel}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value) => value}
          wrapperStyle={{ fontSize: '12px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}