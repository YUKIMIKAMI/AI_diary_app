import React from 'react'
import { Handle, Position, useReactFlow, useNodeId } from 'reactflow'

interface SimpleQuestionNodeProps {
  data: {
    question: string
    category: string
    answered?: boolean
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

export default function SimpleQuestionNode({ data }: SimpleQuestionNodeProps) {
  const { getNodes, setNodes, getEdges, setEdges } = useReactFlow()
  const nodeId = useNodeId()
  
  const style = categoryStyles[data.category as keyof typeof categoryStyles] || categoryStyles.reflection

  const handleClick = () => {
    if (data.answered || !nodeId) return
    
    console.log('Question node clicked:', nodeId)
    
    const nodes = getNodes()
    const edges = getEdges()
    const currentNode = nodes.find(n => n.id === nodeId)
    
    if (!currentNode) return
    
    // 既に回答入力ノードがあるかチェック
    const answerInputNodeId = `answer-input-${nodeId}`
    const existingAnswerNode = nodes.find(n => n.id === answerInputNodeId)
    
    if (!existingAnswerNode) {
      // 回答入力ノードを作成
      const newNode = {
        id: answerInputNodeId,
        type: 'answerInputNode',
        position: { 
          x: currentNode.position.x + 300,
          y: currentNode.position.y
        },
        data: {
          originalQuestion: data.question,
          questionNodeId: nodeId,
        }
      }
      
      // エッジを作成
      const newEdge = {
        id: `edge-${nodeId}-${answerInputNodeId}`,
        source: nodeId,
        target: answerInputNodeId,
        type: 'smoothstep',
        animated: true,
        style: { strokeWidth: 2, stroke: '#94a3b8' },
      }
      
      // 現在のノードを回答済みに更新し、新しいノードを追加
      setNodes([
        ...nodes.map(node => 
          node.id === nodeId 
            ? { ...node, data: { ...node.data, answered: true } }
            : node
        ),
        newNode
      ])
      setEdges([...edges, newEdge])
    }
  }

  return (
    <div 
      onClick={handleClick}
      className={`bg-gradient-to-br ${style.bgColor} ${!data.answered ? style.hoverBg : ''} rounded-xl shadow-md border ${style.borderColor} p-4 min-w-[250px] max-w-[350px] transition-all hover:shadow-lg ${!data.answered ? 'cursor-pointer' : 'cursor-default'}`}
    >
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
        
        {!data.answered && (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
            クリックして回答する
          </div>
        )}
        
        {data.answered && (
          <div className="bg-green-100/50 dark:bg-green-800/20 rounded-lg p-2 mt-2">
            <p className="text-xs text-green-600 dark:text-green-400 text-center">
              ✓ 回答済み
            </p>
          </div>
        )}
      </div>
    </div>
  )
}