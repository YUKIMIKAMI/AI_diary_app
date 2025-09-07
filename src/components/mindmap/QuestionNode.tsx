import React, { useState } from 'react'
import { Handle, Position, useNodeId } from 'reactflow'
import { MessageSquare, Send, X, Edit2 } from 'lucide-react'
import { mindmapStore } from '@/lib/mindmap-store'

interface QuestionNodeProps {
  data: {
    question: string
    category: string
    hasAnswer?: boolean
    onAnswerSubmit?: (answer: string) => void
  }
}

// カテゴリごとのアイコンと色
const categoryStyles = {
  reflection: {
    icon: '🤔',
    bgColor: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
    borderColor: 'border-purple-200 dark:border-purple-700',
  },
  detail: {
    icon: '🔍',
    bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
    borderColor: 'border-green-200 dark:border-green-700',
  },
  emotion: {
    icon: '💭',
    bgColor: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-700',
  },
  action: {
    icon: '🎯',
    bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
    borderColor: 'border-blue-200 dark:border-blue-700',
  },
}

export default function QuestionNode({ data }: QuestionNodeProps) {
  const [isAnswering, setIsAnswering] = useState(false)
  const [tempAnswer, setTempAnswer] = useState('')
  const nodeId = useNodeId()
  
  const style = categoryStyles[data.category as keyof typeof categoryStyles] || categoryStyles.reflection

  const handleStartAnswer = () => {
    setIsAnswering(true)
    setTempAnswer('')
  }

  const handleSubmitAnswer = () => {
    if (tempAnswer.trim() && nodeId) {
      console.log('QuestionNode: Submitting answer:', tempAnswer)
      console.log('QuestionNode: Node ID:', nodeId)
      
      // グローバルストアから関数を取得
      const handler = mindmapStore.getAnswerHandler(nodeId)
      console.log('QuestionNode: Handler exists?', !!handler)
      
      if (handler) {
        handler(tempAnswer)
      }
      
      setIsAnswering(false)
      setTempAnswer('')
    }
  }

  const handleCancelAnswer = () => {
    setIsAnswering(false)
    setTempAnswer('')
  }

  return (
    <div 
      className={`bg-gradient-to-br ${style.bgColor} rounded-xl shadow-md border ${style.borderColor} p-4 min-w-[250px] max-w-[350px] transition-all hover:shadow-lg cursor-pointer`}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-gray-400" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-gray-400" />
      
      <div className="space-y-3">
        {/* 質問部分 */}
        <div className="flex items-start gap-3">
          <div className="text-2xl flex-shrink-0">{style.icon}</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-relaxed">
              {data.question}
            </p>
          </div>
        </div>

        {/* 回答済みの表示 */}
        {data.hasAnswer && (
          <div className="bg-green-100/50 dark:bg-green-800/20 rounded-lg p-2 mt-2">
            <p className="text-xs text-green-600 dark:text-green-400 text-center">
              ✓ 回答済み
            </p>
          </div>
        )}

        {/* 回答入力フォーム */}
        {isAnswering && (
          <div className="space-y-2 mt-3">
            <textarea
              value={tempAnswer}
              onChange={(e) => setTempAnswer(e.target.value)}
              placeholder="この質問について考えてみましょう..."
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              rows={3}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleCancelAnswer()
                }}
                className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <X className="w-3 h-3 inline mr-1" />
                キャンセル
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleSubmitAnswer()
                }}
                disabled={!tempAnswer.trim()}
                className="px-3 py-1 text-xs bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-3 h-3 inline mr-1" />
                送信
              </button>
            </div>
          </div>
        )}

        {/* 回答を促すボタン */}
        {!isAnswering && !data.hasAnswer && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleStartAnswer()
            }}
            className="w-full mt-2 px-3 py-2 text-xs bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-3 h-3" />
            回答を入力
          </button>
        )}
      </div>
    </div>
  )
}