import React from 'react'
import { Handle, Position } from 'reactflow'
import { MessageCircle, User } from 'lucide-react'

interface AnswerNodeProps {
  data: {
    answer: string
    originalQuestion: string
    emotions?: {
      overallScore: number
      dominantEmotions: string[]
    }
    keywords?: string[]
    timestamp?: string
  }
}

export default function AnswerNode({ data }: AnswerNodeProps) {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl shadow-md border border-amber-200 dark:border-amber-700 p-4 min-w-[280px] max-w-[380px] transition-all hover:shadow-lg">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-gray-400" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-gray-400" />
      
      <div className="space-y-3">
        {/* ヘッダー */}
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
          <User className="w-5 h-5" />
          <span className="text-sm font-semibold">あなたの回答</span>
        </div>
        
        {/* 元の質問（小さく表示） */}
        <div className="text-xs text-gray-500 dark:text-gray-400 italic">
          <MessageCircle className="w-3 h-3 inline mr-1" />
          {data.originalQuestion}
        </div>
        
        {/* 回答内容 */}
        <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-3">
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
            {data.answer}
          </p>
        </div>
        
        {/* 感情とキーワード */}
        {(data.emotions || data.keywords) && (
          <div className="space-y-2 pt-2 border-t border-amber-200 dark:border-amber-600">
            {data.emotions && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500">感情:</span>
                {data.emotions.dominantEmotions.map((emotion, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-800/30 rounded-full text-amber-700 dark:text-amber-300">
                    {emotion}
                  </span>
                ))}
              </div>
            )}
            
            {data.keywords && data.keywords.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500">キーワード:</span>
                {data.keywords.slice(0, 3).map((keyword, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-800/30 rounded-full text-orange-700 dark:text-orange-300">
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* タイムスタンプ */}
        {data.timestamp && (
          <div className="text-xs text-gray-400 text-right">
            {new Date(data.timestamp).toLocaleTimeString('ja-JP', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        )}
      </div>
    </div>
  )
}