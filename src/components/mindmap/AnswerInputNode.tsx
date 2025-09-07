import React, { useState } from 'react'
import { Handle, Position, useReactFlow, useNodeId } from 'reactflow'
import { Send, X, User } from 'lucide-react'

interface AnswerInputNodeProps {
  data: {
    originalQuestion: string
    questionNodeId: string
  }
}

export default function AnswerInputNode({ data }: AnswerInputNodeProps) {
  const [answer, setAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { getNodes, setNodes, getEdges, setEdges } = useReactFlow()
  const nodeId = useNodeId()

  const handleSubmit = async () => {
    if (!answer.trim() || !nodeId || isSubmitting) return
    
    setIsSubmitting(true)
    console.log('Submitting answer:', answer)
    
    try {
      // APIに回答を送信
      const response = await fetch('/api/ai/answer-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answer: answer,
          originalQuestion: data.originalQuestion,
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
        
        // 現在の回答入力ノードを回答表示ノードに変換
        setNodes(nodes => nodes.map(node => 
          node.id === nodeId 
            ? { 
                ...node, 
                type: 'answerDisplayNode',
                data: { 
                  answer: answer,
                  originalQuestion: data.originalQuestion,
                  emotions: result.emotions,
                  keywords: result.keywords,
                  timestamp: new Date().toISOString()
                }
              }
            : node
        ))
        
        // 新しい質問ノードを生成
        if (result.followUpQuestions) {
          result.followUpQuestions.slice(0, 2).forEach((q: any, index: number) => {
            const qNodeId = `question-${nodeId}-${index}`
            newNodes.push({
              id: qNodeId,
              type: 'simpleQuestionNode',
              position: { 
                x: currentNode.position.x + 350,
                y: currentNode.position.y + (index - 0.5) * 150
              },
              data: {
                question: q.question,
                category: q.category || 'reflection',
                answered: false,
              }
            })
            
            // 回答ノードから質問ノードへのエッジ
            newEdges.push({
              id: `edge-${nodeId}-${qNodeId}`,
              source: nodeId,
              target: qNodeId,
              type: 'smoothstep',
              animated: true,
              style: { strokeWidth: 2, stroke: '#10b981' },
            })
          })
          
          // 新しいノードとエッジを追加
          if (newNodes.length > 0) {
            setNodes(n => [...n, ...newNodes])
            setEdges(e => [...e, ...newEdges])
          }
        }
      }
      
    } catch (error) {
      console.error('Error submitting answer:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (!nodeId) return
    
    const nodes = getNodes()
    const edges = getEdges()
    
    // 回答入力ノードとそのエッジを削除
    setNodes(nodes.filter(n => n.id !== nodeId))
    setEdges(edges.filter(e => e.target !== nodeId && e.source !== nodeId))
    
    // 質問ノードの回答済みフラグをリセット
    setNodes(nodes => nodes.map(node => 
      node.id === data.questionNodeId 
        ? { ...node, data: { ...node.data, answered: false } }
        : node
    ))
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl shadow-md border border-amber-200 dark:border-amber-700 p-4 min-w-[280px] max-w-[380px] transition-all hover:shadow-lg">
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
        
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="この質問について考えてみましょう..."
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-amber-300 dark:border-amber-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
          rows={4}
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
            disabled={!answer.trim() || isSubmitting}
            className="px-3 py-1 text-xs bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-3 h-3 inline mr-1" />
            {isSubmitting ? '送信中...' : '送信'}
          </button>
        </div>
      </div>
    </div>
  )
}