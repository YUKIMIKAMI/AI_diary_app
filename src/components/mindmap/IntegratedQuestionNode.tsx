import React, { useState } from 'react'
import { Handle, Position, useReactFlow, useNodeId } from 'reactflow'
import { MessageSquare, Send, X } from 'lucide-react'

interface IntegratedQuestionNodeProps {
  data: {
    question: string
    category: string
    answered?: boolean
    answer?: string
  }
}

// カテゴリごとのアイコンと色
const categoryStyles = {
  reflection: {
    icon: '🤔',
    bgColor: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
    borderColor: 'border-purple-200 dark:border-purple-700',
    hoverBg: 'hover:from-purple-100 hover:to-pink-100',
  },
  detail: {
    icon: '🔍',
    bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
    borderColor: 'border-green-200 dark:border-green-700',
    hoverBg: 'hover:from-green-100 hover:to-emerald-100',
  },
  emotion: {
    icon: '💭',
    bgColor: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-700',
    hoverBg: 'hover:from-yellow-100 hover:to-orange-100',
  },
  action: {
    icon: '🎯',
    bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
    borderColor: 'border-blue-200 dark:border-blue-700',
    hoverBg: 'hover:from-blue-100 hover:to-cyan-100',
  },
}

export default function IntegratedQuestionNode({ data }: IntegratedQuestionNodeProps) {
  const [isAnswering, setIsAnswering] = useState(false)
  const [tempAnswer, setTempAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { getNodes, setNodes, getEdges, setEdges } = useReactFlow()
  const nodeId = useNodeId()
  
  const style = categoryStyles[data.category as keyof typeof categoryStyles] || categoryStyles.reflection

  const handleSubmit = async () => {
    if (!tempAnswer.trim() || !nodeId || isSubmitting) return
    
    setIsSubmitting(true)
    console.log('Submitting answer:', tempAnswer)
    
    try {
      // APIに回答を送信
      const response = await fetch('/api/ai/answer-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answer: tempAnswer,
          originalQuestion: data.question,
          diaryContent: '日記の内容'
        })
      })
      
      const result = await response.json()
      console.log('API Response:', result)
      
      const nodes = getNodes()
      const edges = getEdges()
      const currentNode = nodes.find(n => n.id === nodeId)
      
      if (currentNode) {
        const newNodes = []
        const newEdges = []
        
        // 新しい質問ノードを生成
        if (result.followUpQuestions) {
          // 既存のノードの位置を確認して重複を避ける
          const existingPositions = nodes.map(n => ({ x: n.position.x, y: n.position.y }))
          
          result.followUpQuestions.slice(0, 2).forEach((q: any, index: number) => {
            const qNodeId = `question-${nodeId}-${index}-${Date.now()}`
            let x = currentNode.position.x + 450
            let y = currentNode.position.y + (index * 250) - 125
            
            // 既存のノードと重なる場合は位置を調整
            const isOverlapping = existingPositions.some(pos => 
              Math.abs(pos.x - x) < 100 && Math.abs(pos.y - y) < 100
            )
            
            if (isOverlapping) {
              // 重なる場合はさらに右にずらす
              x += 150
              y += index * 50
            }
            
            newNodes.push({
              id: qNodeId,
              type: 'integratedQuestionNode',
              position: { x, y },
              data: {
                question: q.question,
                category: q.category || 'reflection',
                answered: false,
              }
            })
            
            // 現在のノードから新しい質問ノードへのエッジ
            newEdges.push({
              id: `edge-${nodeId}-${qNodeId}`,
              source: nodeId,
              target: qNodeId,
              type: 'smoothstep',
              animated: true,
              style: { strokeWidth: 2, stroke: '#10b981' },
            })
          })
        }
        
        // 現在のノードを回答済みに更新し、新しいノードも追加
        setNodes(nodes => [
          ...nodes.map(node => 
            node.id === nodeId 
              ? { 
                  ...node, 
                  data: { 
                    ...node.data, 
                    answered: true,
                    answer: tempAnswer,
                    emotions: result.emotions,
                    keywords: result.keywords 
                  } 
                }
              : node
          ),
          ...newNodes
        ])
        
        // エッジを追加
        if (newEdges.length > 0) {
          setEdges(e => [...e, ...newEdges])
        }
      }
      
      setIsAnswering(false)
      setTempAnswer('')
      
    } catch (error) {
      console.error('Error submitting answer:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setIsAnswering(false)
    setTempAnswer('')
  }

  return (
    <div className={`bg-gradient-to-br ${style.bgColor} ${!data.answered && !isAnswering ? style.hoverBg : ''} rounded-xl shadow-md border ${style.borderColor} p-4 min-w-[280px] max-w-[380px] transition-all hover:shadow-lg`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-gray-400" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-gray-400" />
      
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="text-2xl flex-shrink-0">{style.icon}</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-relaxed">
              {data.question}
            </p>
          </div>
        </div>

        {/* 回答済みの場合は回答を表示 */}
        {data.answered && data.answer && (
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 space-y-2">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">あなたの回答:</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {data.answer}
            </p>
            {data.emotions && data.emotions.length > 0 && (
              <div className="flex gap-1 flex-wrap mt-2">
                {data.emotions.map((emotion: string, idx: number) => (
                  <span key={idx} className="text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 px-2 py-0.5 rounded-full">
                    {emotion}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 回答入力フォーム */}
        {isAnswering && !data.answered && (
          <div className="space-y-2">
            <textarea
              value={tempAnswer}
              onChange={(e) => setTempAnswer(e.target.value)}
              placeholder="この質問について考えてみましょう..."
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              rows={3}
              autoFocus
              disabled={isSubmitting}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                <X className="w-3 h-3 inline mr-1" />
                キャンセル
              </button>
              <button
                onClick={handleSubmit}
                disabled={!tempAnswer.trim() || isSubmitting}
                className="px-3 py-1 text-xs bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-3 h-3 inline mr-1" />
                {isSubmitting ? '送信中...' : '送信'}
              </button>
            </div>
          </div>
        )}

        {/* 回答を促すボタン */}
        {!isAnswering && !data.answered && (
          <button
            onClick={() => setIsAnswering(true)}
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