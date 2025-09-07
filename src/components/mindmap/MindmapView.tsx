'use client'

import React, { useCallback, useEffect, useState, useMemo } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  Position,
  MiniMap,
} from 'reactflow'
import 'reactflow/dist/style.css'
import DiaryNode from './DiaryNode'
import IntegratedQuestionNode from './IntegratedQuestionNode'

interface MindmapViewProps {
  diaryId?: string
}

// カスタムノードタイプをコンポーネント外で定義
const nodeTypes = {
  diaryNode: DiaryNode,
  integratedQuestionNode: IntegratedQuestionNode,
}

export default function MindmapView({ diaryId }: MindmapViewProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [diaryContent, setDiaryContent] = useState<any>(null)
  
  // sessionStorageからキャッシュを初期化
  const [aiCache, setAiCache] = useState<Map<string, any>>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('aiCache')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          return new Map(Object.entries(parsed))
        } catch (e) {
          console.error('キャッシュの読み込みエラー:', e)
        }
      }
    }
    return new Map()
  })
  
  // nodeTypesをメモ化（コンポーネント外で定義したものを使用）
  const memoizedNodeTypes = useMemo(() => {
    console.log('NodeTypes registration:', nodeTypes)
    return nodeTypes
  }, [])

  // エッジ接続時のハンドラー
  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  
  // 日記データとマインドマップの生成
  useEffect(() => {
    const fetchDiary = async () => {
      try {
        // まずlocalStorageから取得を試みる（デモモード対応）
        if (typeof window !== 'undefined') {
          const currentDiary = localStorage.getItem('currentDiary')
          if (currentDiary) {
            const diary = JSON.parse(currentDiary)
            console.log('localStorageから日記を取得:', diary)
            setDiaryContent(diary)
            generateMindmap(diary)
            return
          }
        }
        
        // APIから取得
        const response = await fetch('/api/diary')
        if (response.ok) {
          const diaries = await response.json()
          console.log('取得した日記一覧:', diaries)
          
          if (diaryId) {
            const diary = diaries.find((d: any) => d.id === diaryId)
            console.log('選択された日記:', diary)
            if (diary) {
              setDiaryContent(diary)
              generateMindmap(diary)
            }
          } else if (diaries.length > 0) {
            // diaryIdがない場合は最新の日記を表示
            const latestDiary = diaries[0]
            setDiaryContent(latestDiary)
            generateMindmap(latestDiary)
          }
        }
      } catch (error) {
        console.error('日記データの取得に失敗:', error)
      }
    }

    fetchDiary()
  }, [diaryId])

  // マインドマップを生成
  const generateMindmap = async (diary: any) => {
    console.log('マインドマップ生成開始:', diary)
    const newNodes: Node[] = []
    const newEdges: Edge[] = []

    try {
      // キャッシュをチェック
      const cacheKey = `${diary.id}_${diary.entryDate}`
      let questionsData, emotionsData
      
      if (aiCache.has(cacheKey)) {
        // キャッシュから取得
        const cached = aiCache.get(cacheKey)
        questionsData = cached.questionsData
        emotionsData = cached.emotionsData
        console.log('キャッシュから AI データを使用')
      } else {
        // AI APIを並行して呼び出し
        const [questionsResponse, emotionsResponse] = await Promise.all([
          fetch('/api/ai/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: diary.content })
          }),
          fetch('/api/ai/emotions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: diary.content })
          })
        ])

        questionsData = await questionsResponse.json()
        emotionsData = await emotionsResponse.json()
        
        // キャッシュに保存
        const newCache = new Map(aiCache)
        newCache.set(cacheKey, { questionsData, emotionsData })
        setAiCache(newCache)
        
        // sessionStorageにも保存
        if (typeof window !== 'undefined') {
          const cacheObject = Object.fromEntries(newCache)
          sessionStorage.setItem('aiCache', JSON.stringify(cacheObject))
        }
        console.log('新しい AI データを生成してキャッシュに保存')
      }

      console.log('AI API レスポンス:', { questionsData, emotionsData })

      // 感情とキーワードを取得
      const emotions = emotionsData.success 
        ? emotionsData.emotions.dominantEmotions || [] 
        : ['平穏']
      const keywords = emotionsData.success 
        ? emotionsData.keywords || [] 
        : []

      // 左側に日記ノード（カスタムノード）
      const diaryNode: Node = {
        id: 'diary-1',
        type: 'diaryNode',
        position: { x: 50, y: 200 },
        data: { 
          content: diary.content,
          emotions: emotions,
          keywords: keywords.slice(0, 5),
          date: new Date(diary.entryDate).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          emotionScore: emotionsData.success ? emotionsData.emotions.overallScore : 3,
        },
      }
      newNodes.push(diaryNode)

      // AI生成された質問を配置
      const questions = questionsData.success 
        ? questionsData.questions.slice(0, 2)
        : [
            { question: '今日の出来事から学んだことは何ですか？', category: 'reflection' },
            { question: '明日はどんな1日にしたいですか？', category: 'action' }
          ]
      
      questions.forEach((q: any, index: number) => {
        const x = 500
        const y = 100 + (index * 200) // ノード間の間隔を広げる

        const questionNodeId = `question-${index + 1}`
        
        const questionNode: Node = {
          id: questionNodeId,
          type: 'integratedQuestionNode',
          position: { x, y },
          data: { 
            question: q.question,
            category: q.category,
            answered: false,
          },
        }
        newNodes.push(questionNode)

        // エッジを追加（シンプルなデザイン）
        newEdges.push({
          id: `edge-diary-question-${index + 1}`,
          source: 'diary-1',
          target: `question-${index + 1}`,
          type: 'smoothstep',
          animated: false,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 15,
            height: 15,
            color: '#94a3b8',
          },
          style: {
            strokeWidth: 2,
            stroke: '#94a3b8',
          },
        })
      })

      console.log('生成されたノード数:', newNodes.length)
      console.log('生成されたエッジ数:', newEdges.length)
      
    } catch (error) {
      console.error('AI API呼び出しエラー:', error)
      
      // エラー時はフォールバック
      const diaryNode: Node = {
        id: 'diary-1',
        type: 'diaryNode',
        position: { x: 50, y: 200 },
        data: { 
          content: diary.content,
          emotions: ['平穏'],
          keywords: [],
          date: new Date(diary.entryDate).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        },
      }
      newNodes.push(diaryNode)
    }
    
    setNodes(newNodes)
    setEdges(newEdges)
  }

  return (
    <div className="w-full h-full" style={{ minHeight: '600px', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={memoizedNodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: false,
        }}
        attributionPosition="bottom-left"
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background 
          color="#e5e7eb" 
          gap={20}
          variant="dots"
          style={{ backgroundColor: '#f9fafb' }}
        />
        <Controls showInteractive={false} />
        <MiniMap 
          nodeColor="#3b82f6"
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
      </ReactFlow>
    </div>
  )
}