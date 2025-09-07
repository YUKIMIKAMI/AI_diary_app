'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Filter, ChevronLeft, ChevronRight, Star, TrendingUp, Heart, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface TimelineEntry {
  id: string
  date: Date
  content: string
  mood?: string
  tags: string[]
  isHighlight?: boolean
  emotionScore?: number
}

export default function TimelinePage() {
  const [diaries, setDiaries] = useState<any[]>([])
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<'1month' | '3months' | '1year' | '5years' | 'all'>('1year')
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [selectedMood, setSelectedMood] = useState<string>('')
  const [selectedEmotionRange, setSelectedEmotionRange] = useState<string>('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [allTags, setAllTags] = useState<string[]>([])

  useEffect(() => {
    fetchDiaries()
  }, [])

  const fetchDiaries = async () => {
    try {
      const response = await fetch('/api/diary')
      if (response.ok) {
        const data = await response.json()
        setDiaries(data)
        
        // Extract all unique tags
        const tags = new Set<string>()
        data.forEach((diary: any) => {
          if (diary.tags && Array.isArray(diary.tags)) {
            diary.tags.forEach((tag: string) => tags.add(tag))
          }
        })
        setAllTags(Array.from(tags))
        
        processTimelineData(data, selectedPeriod, selectedTag, selectedMood, selectedEmotionRange)
      }
    } catch (error) {
      console.error('日記データの取得に失敗:', error)
    }
  }

  const processTimelineData = (
    diaryData: any[], 
    period: string, 
    tag: string, 
    mood: string,
    emotionRange: string
  ) => {
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case '1month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case '3months':
        startDate.setMonth(now.getMonth() - 3)
        break
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case '5years':
        startDate.setFullYear(now.getFullYear() - 5)
        break
      case 'all':
        startDate = new Date(0)
        break
    }

    let filtered = diaryData.filter((diary: any) => 
      new Date(diary.entryDate) >= startDate
    )

    if (tag) {
      filtered = filtered.filter((diary: any) =>
        diary.tags && diary.tags.includes(tag)
      )
    }

    if (mood) {
      filtered = filtered.filter((diary: any) =>
        diary.mood === mood
      )
    }

    // AI感情分析スコアでフィルタリング
    if (emotionRange) {
      filtered = filtered.filter((diary: any) => {
        const score = diary.emotionScore || 0
        switch (emotionRange) {
          case 'positive':
            return score >= 4
          case 'neutral':
            return score >= 2.5 && score < 4
          case 'negative':
            return score > 0 && score < 2.5
          default:
            return true
        }
      })
    }

    // Sort by date (newest first)
    filtered.sort((a: any, b: any) => 
      new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
    )

    // Identify highlights (entries with high emotion scores or many words)
    const entries: TimelineEntry[] = filtered.map((diary: any) => {
      const wordCount = diary.content ? diary.content.length : 0
      const isHighlight = wordCount > 200 || (diary.emotionScore && diary.emotionScore >= 4)
      
      return {
        id: diary.id,
        date: new Date(diary.entryDate),
        content: diary.content || '',
        mood: diary.mood,
        tags: diary.tags || [],
        isHighlight,
        emotionScore: diary.emotionScore
      }
    })

    setTimelineEntries(entries)
    setCurrentIndex(0)
  }

  useEffect(() => {
    processTimelineData(diaries, selectedPeriod, selectedTag, selectedMood, selectedEmotionRange)
  }, [selectedPeriod, selectedTag, selectedMood, selectedEmotionRange, diaries])

  const navigateTimeline = (direction: 'prev' | 'next') => {
    setIsAnimating(true)
    setTimeout(() => {
      if (direction === 'next' && currentIndex < timelineEntries.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else if (direction === 'prev' && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1)
      }
      setIsAnimating(false)
    }, 150)
  }

  const currentEntry = timelineEntries[currentIndex]

  const getTimelineIcon = (entry: TimelineEntry) => {
    if (entry.isHighlight) return Star
    if (entry.emotionScore && entry.emotionScore >= 4) return Heart
    if (entry.tags.includes('成長')) return TrendingUp
    return Lightbulb
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            タイムライン
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            過去の日記を振り返り、成長の軌跡を辿る
          </p>
        </div>

        {/* フィルターコントロール */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              フィルター
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {/* 期間選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                期間
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="1month">過去1ヶ月</option>
                <option value="3months">過去3ヶ月</option>
                <option value="1year">過去1年</option>
                <option value="5years">過去5年</option>
                <option value="all">全期間</option>
              </select>
            </div>

            {/* タグフィルター */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                タグ
              </label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">すべて</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            {/* 気分フィルター（ユーザー入力） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                気分（手動入力）
              </label>
              <select
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">すべて</option>
                <option value="happy">😊 嬉しい</option>
                <option value="sad">😢 悲しい</option>
                <option value="angry">😠 怒り</option>
                <option value="excited">🎉 興奮</option>
                <option value="calm">😌 穏やか</option>
                <option value="anxious">😰 不安</option>
              </select>
            </div>

            {/* AI感情分析フィルター */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                AI感情分析
              </label>
              <select
                value={selectedEmotionRange}
                onChange={(e) => setSelectedEmotionRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">すべて</option>
                <option value="positive">😄 ポジティブ (4-5)</option>
                <option value="neutral">😐 ニュートラル (2.5-4)</option>
                <option value="negative">😔 ネガティブ (1-2.5)</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            {timelineEntries.length}件の日記が見つかりました
          </div>
        </div>

        {/* タイムライン表示 */}
        {timelineEntries.length > 0 && currentEntry && (
          <div className="relative">
            {/* メインコンテンツ */}
            <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 transition-opacity duration-300 ${
              isAnimating ? 'opacity-50' : 'opacity-100'
            }`}>
              {/* ヘッダー */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {React.createElement(getTimelineIcon(currentEntry), {
                      className: `w-6 h-6 ${currentEntry.isHighlight ? 'text-yellow-500' : 'text-purple-500'}`
                    })}
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {format(currentEntry.date, 'yyyy年MM月dd日', { locale: ja })}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    {format(currentEntry.date, 'HH:mm', { locale: ja })}
                    {currentEntry.mood && (
                      <>
                        <span className="mx-2">•</span>
                        <span>
                          {currentEntry.mood === 'happy' && '😊 嬉しい'}
                          {currentEntry.mood === 'sad' && '😢 悲しい'}
                          {currentEntry.mood === 'angry' && '😠 怒り'}
                          {currentEntry.mood === 'excited' && '🎉 興奮'}
                          {currentEntry.mood === 'calm' && '😌 穏やか'}
                          {currentEntry.mood === 'anxious' && '😰 不安'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                {currentEntry.isHighlight && (
                  <div className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-medium">
                    ハイライト
                  </div>
                )}
              </div>

              {/* 本文 */}
              <div className="prose dark:prose-invert max-w-none mb-6">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {currentEntry.content}
                </p>
              </div>

              {/* タグ */}
              {currentEntry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {currentEntry.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* ナビゲーション */}
              <div className="flex items-center justify-between border-t pt-6">
                <Button
                  variant="outline"
                  onClick={() => navigateTimeline('prev')}
                  disabled={currentIndex === 0}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  前の日記
                </Button>

                <div className="text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {currentIndex + 1} / {timelineEntries.length}
                  </div>
                  <div className="flex gap-1 justify-center mt-2">
                    {[...Array(Math.min(5, timelineEntries.length))].map((_, i) => {
                      const dotIndex = Math.max(0, Math.min(currentIndex - 2 + i, timelineEntries.length - 1))
                      return (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            dotIndex === currentIndex
                              ? 'bg-purple-500'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        />
                      )
                    })}
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => navigateTimeline('next')}
                  disabled={currentIndex === timelineEntries.length - 1}
                  className="gap-2"
                >
                  次の日記
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* タイムラインインジケーター */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-between">
                  {timelineEntries.slice(0, 5).map((entry, i) => (
                    <button
                      key={entry.id}
                      onClick={() => setCurrentIndex(i)}
                      className={`w-4 h-4 rounded-full border-2 transition-all ${
                        i === currentIndex
                          ? 'bg-purple-500 border-purple-500 scale-125'
                          : entry.isHighlight
                          ? 'bg-yellow-400 border-yellow-400'
                          : 'bg-white dark:bg-gray-700 border-gray-400'
                      }`}
                      title={format(entry.date, 'MM/dd', { locale: ja })}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 空の状態 */}
        {timelineEntries.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              日記が見つかりません
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              フィルターを変更するか、新しい日記を書いてみましょう
            </p>
          </div>
        )}
      </div>
    </div>
  )
}