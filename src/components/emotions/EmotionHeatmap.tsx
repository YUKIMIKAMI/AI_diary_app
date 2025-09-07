'use client'

import React from 'react'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns'
import { ja } from 'date-fns/locale'

interface EmotionHeatmapProps {
  data: any[]
  period: 'week' | 'month' | 'year'
}

export default function EmotionHeatmap({ data, period }: EmotionHeatmapProps) {
  // スコアに基づいて色を取得
  const getColorForScore = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-green-400'
    if (score >= 40) return 'bg-yellow-400'
    if (score >= 20) return 'bg-orange-400'
    return 'bg-red-400'
  }

  // 日付ごとのデータマップを作成
  const dataMap = new Map(
    data.map(d => [d.date, d.overall || 0])
  )

  // カレンダー形式のデータを生成
  const generateCalendarData = () => {
    const weeks = []
    const today = new Date()
    let currentDate = new Date()

    if (period === 'week') {
      currentDate = startOfWeek(today, { weekStartsOn: 0 }) // 日曜日から開始
      const endDate = endOfWeek(today, { weekStartsOn: 0 })
      const days = eachDayOfInterval({ start: currentDate, end: endDate })
      weeks.push(days)
    } else if (period === 'month') {
      // 過去30日分を週ごとに分割（日曜日から土曜日）
      const startDate = new Date(today)
      startDate.setDate(today.getDate() - 29) // 30日前から
      
      // 最初の日曜日まで戻る
      while (startDate.getDay() !== 0) {
        startDate.setDate(startDate.getDate() - 1)
      }
      
      // 週ごとにデータを作成
      let currentWeekStart = new Date(startDate)
      while (currentWeekStart <= today) {
        const week = []
        for (let d = 0; d < 7; d++) {
          const date = new Date(currentWeekStart)
          date.setDate(currentWeekStart.getDate() + d)
          week.push(date)
        }
        weeks.push(week)
        currentWeekStart.setDate(currentWeekStart.getDate() + 7)
      }
    } else {
      // 年間表示（簡易版：月ごとの平均）
      const months = []
      for (let m = 11; m >= 0; m--) {
        const date = new Date(today)
        date.setMonth(today.getMonth() - m)
        months.push(date)
      }
      return months
    }

    return weeks
  }

  const calendarData = generateCalendarData()

  // 年間表示の場合
  if (period === 'year') {
    return (
      <div className="p-4">
        <div className="grid grid-cols-6 gap-2">
          {(calendarData as Date[]).map((date, index) => {
            const dateStr = format(date, 'yyyy-MM-dd')
            const monthData = data.filter(d => 
              d.date.startsWith(format(date, 'yyyy-MM'))
            )
            const avgScore = monthData.length > 0
              ? monthData.reduce((sum, d) => sum + (d.overall || 0), 0) / monthData.length
              : 0

            return (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-500 mb-1">
                  {format(date, 'M月', { locale: ja })}
                </div>
                <div
                  className={`w-full h-16 rounded ${avgScore > 0 ? getColorForScore(avgScore) : 'bg-gray-200'} 
                    flex items-center justify-center text-white font-medium`}
                  title={`平均: ${avgScore.toFixed(0)}`}
                >
                  {avgScore > 0 ? Math.round(avgScore) : '-'}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // 週・月表示
  return (
    <div className="p-4">
      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['日', '月', '火', '水', '木', '金', '土'].map(day => (
          <div key={day} className="text-center text-xs text-gray-500 font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* カレンダー本体 */}
      <div className="space-y-1">
        {(calendarData as Date[][]).map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((date, dayIndex) => {
              const dateStr = format(date, 'yyyy-MM-dd')
              const score = dataMap.get(dateStr) || 0
              const isToday = isSameDay(date, new Date())

              return (
                <div
                  key={dayIndex}
                  className={`relative aspect-square rounded-lg ${
                    score > 0 ? getColorForScore(score) : 'bg-gray-100 dark:bg-gray-700'
                  } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                  title={`${format(date, 'M/d')}: ${score > 0 ? Math.round(score) : 'データなし'}`}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-xs font-medium text-white dark:text-gray-900">
                      {format(date, 'd')}
                    </div>
                    {score > 0 && (
                      <div className="text-xs text-white dark:text-gray-900 opacity-90">
                        {Math.round(score)}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* 凡例 */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <span className="text-xs text-gray-500">悪い</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 bg-red-400 rounded" />
          <div className="w-4 h-4 bg-orange-400 rounded" />
          <div className="w-4 h-4 bg-yellow-400 rounded" />
          <div className="w-4 h-4 bg-green-400 rounded" />
          <div className="w-4 h-4 bg-green-500 rounded" />
        </div>
        <span className="text-xs text-gray-500">良い</span>
      </div>
    </div>
  )
}