import React from 'react'
import { Handle, Position } from 'reactflow'
import { Heart, Tag, Clock, User } from 'lucide-react'

interface AnswerDisplayNodeProps {
  data: {
    answer: string
    originalQuestion: string
    emotions?: string[]
    keywords?: string[]
    timestamp?: string
  }
}

export default function AnswerDisplayNode({ data }: AnswerDisplayNodeProps) {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl shadow-md border border-amber-200 dark:border-amber-700 p-4 min-w-[300px] max-w-[400px] transition-all hover:shadow-lg">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-gray-400" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-gray-400" />
      
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
          <User className="w-5 h-5" />
          <span className="text-sm font-semibold">あなたの回答</span>
        </div>
        
        <div className="text-xs text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 rounded p-2">
          <span className="font-medium">質問:</span> {data.originalQuestion}
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {data.answer}
          </p>
        </div>
        
        {data.emotions && data.emotions.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Heart className="w-4 h-4 text-pink-500" />
            {data.emotions.map((emotion, index) => (
              <span key={index} className="text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 px-2 py-1 rounded-full">
                {emotion}
              </span>
            ))}
          </div>
        )}
        
        {data.keywords && data.keywords.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="w-4 h-4 text-blue-500" />
            {data.keywords.map((keyword, index) => (
              <span key={index} className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                {keyword}
              </span>
            ))}
          </div>
        )}
        
        {data.timestamp && (
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3" />
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