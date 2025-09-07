import React, { memo, useState } from 'react'
import { Handle, Position } from 'reactflow'
import { Calendar, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'

interface MergedDiaryNodeData {
  label: string
  type: 'root' | 'category' | 'entry' | 'word'
  icon?: React.ComponentType<any>
  color?: string
  bgColor?: string
  count?: number
  entries?: any[]
  date?: string
  emotionScore?: number
  fullContent?: string
  category?: string
  size?: number
  opacity?: number
}

const MergedDiaryNode = memo(({ data }: { data: MergedDiaryNodeData }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // ノードタイプ別のスタイリング
  const getNodeStyle = () => {
    switch (data.type) {
      case 'root':
        return {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          width: '200px',
          minHeight: '80px',
          fontSize: '16px',
          fontWeight: 'bold',
          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
        }
      case 'category':
        return {
          background: data.bgColor || '#f3f4f6',
          color: data.color || '#374151',
          width: '180px',
          minHeight: '70px',
          border: `2px solid ${data.color || '#9ca3af'}`,
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        }
      case 'word':
        return {
          background: `${data.bgColor || '#f3f4f6'}`,
          color: data.color || '#374151',
          width: 'auto',
          minWidth: '60px',
          padding: '6px 12px',
          fontSize: `${data.size || 14}px`,
          fontWeight: '500',
          border: `2px solid ${data.color || '#9ca3af'}`,
          boxShadow: `0 0 12px ${data.color || '#9ca3af'}40`,  // グロー効果を追加
          cursor: 'pointer',
          opacity: data.opacity || 1,  // 明るさのバリエーション
          transition: 'all 0.3s ease',
        }
      case 'entry':
        return {
          background: getEmotionGradient(data.emotionScore || 3),
          color: '#1f2937',
          width: '160px',
          minHeight: '60px',
          fontSize: '12px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        }
      default:
        return {}
    }
  }

  const getEmotionGradient = (score: number) => {
    if (score >= 4) return 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)'
    if (score >= 3) return 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    if (score >= 2) return 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    return 'linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)'
  }

  const Icon = data.icon

  return (
    <div
      className={`rounded-lg ${data.type === 'word' ? 'px-3 py-2' : 'p-3'} cursor-pointer transition-all duration-300 hover:scale-105`}
      style={getNodeStyle()}
      onClick={() => data.type === 'entry' && setIsExpanded(!isExpanded)}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        style={{ background: '#555', width: 8, height: 8 }}
      />
      
      <div className="flex flex-col items-center justify-center h-full">
        {/* アイコン表示（カテゴリーノードのみ） */}
        {Icon && data.type === 'category' && (
          <Icon className="w-6 h-6 mb-2" style={{ color: data.color }} />
        )}
        
        {/* ルートノード */}
        {data.type === 'root' && (
          <>
            <Sparkles className="w-8 h-8 mb-2" />
            <div className="text-center">
              <div>{data.label}</div>
              {data.count && (
                <div className="text-sm opacity-90 mt-1">
                  {data.count}件の日記
                </div>
              )}
            </div>
          </>
        )}
        
        {/* カテゴリーノード */}
        {data.type === 'category' && (
          <>
            <div className="font-semibold">{data.label}</div>
            {data.count && (
              <div className="text-sm mt-1 opacity-80">
                {data.count}件
              </div>
            )}
            {data.entries && data.entries.length > 5 && (
              <div className="text-xs mt-1 opacity-60">
                他{data.entries.length - 5}件...
              </div>
            )}
          </>
        )}
        
        {/* エントリーノード */}
        {data.type === 'entry' && (
          <>
            {data.date && (
              <div className="flex items-center gap-1 text-xs opacity-70 mb-1">
                <Calendar className="w-3 h-3" />
                {data.date}
              </div>
            )}
            <div className={`text-center ${isExpanded ? '' : 'line-clamp-2'}`}>
              {data.label}
            </div>
            {data.fullContent && (
              <div className="flex justify-center mt-1">
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 opacity-50" />
                ) : (
                  <ChevronDown className="w-4 h-4 opacity-50" />
                )}
              </div>
            )}
            {isExpanded && data.fullContent && (
              <div className="text-xs mt-2 p-2 bg-white/50 dark:bg-black/20 rounded max-h-32 overflow-y-auto">
                {data.fullContent}
              </div>
            )}
          </>
        )}
        
        {/* 単語ノード */}
        {data.type === 'word' && (
          <div className="text-center font-medium">
            {data.label}
          </div>
        )}
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        style={{ background: '#555', width: 8, height: 8 }}
      />
    </div>
  )
})

MergedDiaryNode.displayName = 'MergedDiaryNode'

export default MergedDiaryNode