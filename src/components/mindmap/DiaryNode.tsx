import React, { useState } from 'react'
import { Handle, Position } from 'reactflow'

interface DiaryNodeProps {
  data: {
    content: string
    emotions: string[]
    keywords: string[]
    date: string
    emotionScore?: number // 1-5の感情スコア
  }
}

// 感情のアイコンマップ
const emotionIcons: { [key: string]: string } = {
  '喜び': '😊',
  '楽しさ': '🎉',
  '悲しみ': '😢',
  '焦り': '😰',
  '不安': '😟',
  '心配': '😔',
  '満足感': '😌',
  '集中': '🎯',
  '疲労': '😫',
  '怒り': '😠',
  '感謝': '🙏',
  '期待': '✨',
  '平穏': '☺️',
}

export default function DiaryNode({ data }: DiaryNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const displayContent = isExpanded 
    ? data.content 
    : data.content.length > 100 
      ? data.content.substring(0, 100) + '...' 
      : data.content

  // 感情スコアに基づいて背景色を決定
  const getEmotionGradient = () => {
    const score = data.emotionScore || 3
    if (score >= 4) {
      return 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
    } else if (score >= 3) {
      return 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'
    } else if (score >= 2) {
      return 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20'
    } else {
      return 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20'
    }
  }

  const getEmotionBorder = () => {
    const score = data.emotionScore || 3
    if (score >= 4) {
      return 'border-green-200 dark:border-green-700'
    } else if (score >= 3) {
      return 'border-blue-200 dark:border-blue-700'
    } else if (score >= 2) {
      return 'border-yellow-200 dark:border-yellow-700'
    } else {
      return 'border-red-200 dark:border-red-700'
    }
  }

  return (
    <div 
      className={`bg-gradient-to-br ${getEmotionGradient()} rounded-xl shadow-lg border ${getEmotionBorder()} p-4 min-w-[280px] max-w-[400px] cursor-pointer transition-all hover:shadow-xl`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500" />
      
      <div className="space-y-3">
        {/* ヘッダー */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="text-2xl">📖</div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">今日の日記</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{data.date}</p>
            </div>
          </div>
        </div>

        {/* 感情アイコン */}
        {data.emotions.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {data.emotions.map((emotion, index) => (
              <span 
                key={index} 
                className="text-lg" 
                title={emotion}
              >
                {emotionIcons[emotion] || '💭'}
              </span>
            ))}
          </div>
        )}

        {/* 本文 */}
        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {displayContent}
        </div>

        {/* 展開ボタン */}
        {data.content.length > 100 && (
          <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
            {isExpanded ? '折りたたむ' : '全文を読む'}
          </button>
        )}

        {/* キーワードタグ（控えめに表示） */}
        {data.keywords.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {data.keywords.slice(0, 3).map((keyword, index) => (
              <span 
                key={index}
                className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
              >
                {keyword}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}