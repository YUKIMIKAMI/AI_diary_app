'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  ConnectionMode,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Calendar, Filter, Layers, Sparkles, Users, Briefcase, Heart, Gamepad2, GraduationCap, Plane, TrendingUp, DollarSign, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { ja } from 'date-fns/locale'
import MergedDiaryNode from '@/components/mindmap/MergedDiaryNode'

// カテゴリー定義
const LifeCategory = {
  WORK: '仕事',
  FAMILY: '家族',
  FRIENDS: '友達',
  HOBBY: '趣味',
  HEALTH: '健康',
  RELATIONSHIP: '人間関係',
  GROWTH: '成長',
  FINANCE: '金銭',
  TRAVEL: '旅行',
  EDUCATION: '学習'
} as const

type LifeCategoryType = typeof LifeCategory[keyof typeof LifeCategory]

// カテゴリーごとの設定
const categoryConfig = {
  [LifeCategory.WORK]: { icon: Briefcase, color: '#3b82f6', bgColor: '#dbeafe' },
  [LifeCategory.FAMILY]: { icon: Heart, color: '#ef4444', bgColor: '#fee2e2' },
  [LifeCategory.FRIENDS]: { icon: Users, color: '#10b981', bgColor: '#d1fae5' },
  [LifeCategory.HOBBY]: { icon: Gamepad2, color: '#8b5cf6', bgColor: '#ede9fe' },
  [LifeCategory.HEALTH]: { icon: Activity, color: '#22c55e', bgColor: '#dcfce7' },
  [LifeCategory.RELATIONSHIP]: { icon: Heart, color: '#f59e0b', bgColor: '#fed7aa' },
  [LifeCategory.GROWTH]: { icon: TrendingUp, color: '#06b6d4', bgColor: '#cffafe' },
  [LifeCategory.FINANCE]: { icon: DollarSign, color: '#84cc16', bgColor: '#ecfccb' },
  [LifeCategory.TRAVEL]: { icon: Plane, color: '#ec4899', bgColor: '#fce7f3' },
  [LifeCategory.EDUCATION]: { icon: GraduationCap, color: '#6366f1', bgColor: '#e0e7ff' }
}

interface MergedMindmapData {
  categories: Map<string, any[]>
  totalEntries: number
  period: string
}

const nodeTypes = {
  merged: MergedDiaryNode,
}

function MindmapMergeContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [diaries, setDiaries] = useState<any[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | '3months' | 'year' | 'all'>('month')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [mergedData, setMergedData] = useState<MergedMindmapData | null>(null)

  useEffect(() => {
    fetchDiaries()
  }, [])

  useEffect(() => {
    if (diaries.length > 0) {
      generateMergedMindmap()
    }
  }, [diaries, selectedPeriod])

  const fetchDiaries = async () => {
    try {
      const response = await fetch('/api/diary')
      if (response.ok) {
        const data = await response.json()
        setDiaries(data)
      }
    } catch (error) {
      console.error('日記データの取得に失敗:', error)
    }
  }

  // 日記をカテゴリーに自動分類（簡易版）
  const categorizeDiary = (content: string): LifeCategoryType[] => {
    const categories: LifeCategoryType[] = []
    
    const categoryKeywords = {
      [LifeCategory.WORK]: ['仕事', 'メール', '会議', '業務', '会社', 'プロジェクト', '残業', '職場'],
      [LifeCategory.FAMILY]: ['家族', '子供', '親', '母', '父', '兄', '弟', '姉', '妹', '夫', '妻'],
      [LifeCategory.FRIENDS]: ['友達', '友人', '仲間', '同僚', '先輩', '後輩'],
      [LifeCategory.HOBBY]: ['趣味', '映画', '読書', '小説', 'ゲーム', '音楽', 'スポーツ', '料理'],
      [LifeCategory.HEALTH]: ['健康', '病気', '熱', '風邪', '運動', '散歩', 'ジム', '薬', '病院'],
      [LifeCategory.RELATIONSHIP]: ['恋愛', '彼氏', '彼女', 'デート', '結婚', '離婚'],
      [LifeCategory.GROWTH]: ['成長', '学習', '勉強', '挑戦', '目標', '達成', '成功', '失敗'],
      [LifeCategory.FINANCE]: ['お金', '給料', '貯金', '投資', '買い物', '節約'],
      [LifeCategory.TRAVEL]: ['旅行', '旅', '観光', '海外', '国内', 'ホテル', '飛行機'],
      [LifeCategory.EDUCATION]: ['勉強', '学習', '資格', '試験', '授業', '講座', 'セミナー']
    }

    Object.entries(categoryKeywords).forEach(([category, keywords]) => {
      if (keywords.some(keyword => content.includes(keyword))) {
        categories.push(category as LifeCategoryType)
      }
    })

    // カテゴリーが見つからない場合は「成長」カテゴリーに分類
    if (categories.length === 0) {
      categories.push(LifeCategory.GROWTH)
    }

    return categories
  }

  // カテゴリー関連の単語を抽出する関数
  const extractCategoryRelatedWords = (text: string, category: LifeCategory, limit: number = 8): string[] => {
    // カテゴリーごとの特徴的な単語パターン
    const categoryPatterns: Record<LifeCategory, RegExp[]> = {
      [LifeCategory.WORK]: [
        /会議|ミーティング|打ち合わせ/g,
        /プロジェクト|案件|タスク/g,
        /残業|締切|納期/g,
        /上司|部長|同僚|チーム/g,
        /資料|レポート|報告書/g,
        /メール|電話|連絡/g
      ],
      [LifeCategory.FAMILY]: [
        /[息娘]子|子供|赤ちゃん/g,
        /[夫妻]|パパ|ママ/g,
        /[父母]親|祖[父母]/g,
        /家族|実家|帰省/g,
        /誕生日|記念日/g
      ],
      [LifeCategory.FRIENDS]: [
        /友[達人]|仲間/g,
        /飲み会|パーティー|集まり/g,
        /遊び|カラオケ/g,
        /LINE|連絡|電話/g
      ],
      [LifeCategory.HOBBY]: [
        /映画|ドラマ|アニメ/g,
        /音楽|ライブ|コンサート/g,
        /ゲーム|PS|Switch/g,
        /読書|小説|漫画|本/g,
        /料理|レシピ|お菓子/g
      ],
      [LifeCategory.HEALTH]: [
        /運動|ジム|筋トレ|ランニング/g,
        /体調|風邪|熱|頭痛/g,
        /病院|診察|薬/g,
        /睡眠|疲れ|ストレス/g,
        /ダイエット|体重/g
      ],
      [LifeCategory.RELATIONSHIP]: [
        /彼[氏女]|恋人|パートナー/g,
        /デート|約束/g,
        /愛|好き|大切/g,
        /結婚|将来|夢/g
      ],
      [LifeCategory.GROWTH]: [
        /目標|計画|達成/g,
        /勉強|学習|資格/g,
        /成長|向上|改善/g,
        /挑戦|チャレンジ/g
      ],
      [LifeCategory.FINANCE]: [
        /給料|ボーナス|収入/g,
        /貯金|節約|お金/g,
        /買い物|購入|支払/g,
        /家計|生活費/g
      ],
      [LifeCategory.TRAVEL]: [
        /旅行|観光|ツアー/g,
        /ホテル|宿泊/g,
        /飛行機|新幹線|電車/g,
        /[温泉]|観光地/g
      ],
      [LifeCategory.EDUCATION]: [
        /授業|講義|セミナー/g,
        /宿題|課題|レポート/g,
        /試験|テスト|受験/g,
        /先生|教授|講師/g
      ]
    }

    const patterns = categoryPatterns[category] || []
    const foundWords = new Set<string>()
    
    // パターンマッチで単語を抽出
    patterns.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) {
        matches.forEach(word => {
          if (word && word.length >= 2 && word.length <= 10) {
            foundWords.add(word)
          }
        })
      }
    })

    // カテゴリーに関連する固有名詞や具体的な単語を抽出
    const specificWords: string[] = []
    
    // 数字を含む具体的な表現（例：3時間、10キロ、5000円など）
    const numberPatterns = /\d+[時間日分キロメートル円万]/g
    const numberMatches = text.match(numberPatterns)
    if (numberMatches && category === LifeCategory.WORK) {
      numberMatches.slice(0, 2).forEach(word => foundWords.add(word))
    }

    // 曜日（仕事や予定に関連）
    const dayPattern = /[月火水木金土日]曜日/g
    const dayMatches = text.match(dayPattern)
    if (dayMatches && (category === LifeCategory.WORK || category === LifeCategory.FRIENDS)) {
      dayMatches.slice(0, 2).forEach(word => foundWords.add(word))
    }

    // 見つからない場合はカテゴリー名と最も関連の深い基本単語を表示
    if (foundWords.size === 0) {
      const defaultWords: Record<LifeCategory, string[]> = {
        [LifeCategory.WORK]: ['仕事', '業務', 'タスク', '会社'],
        [LifeCategory.FAMILY]: ['家族', '家庭', '子供', '両親'],
        [LifeCategory.FRIENDS]: ['友達', '仲間', '友人', '交流'],
        [LifeCategory.HOBBY]: ['趣味', '楽しみ', '遊び', 'リラックス'],
        [LifeCategory.HEALTH]: ['健康', '体調', '運動', '休息'],
        [LifeCategory.RELATIONSHIP]: ['関係', '恋愛', 'パートナー', '感情'],
        [LifeCategory.GROWTH]: ['成長', '目標', '学習', '挑戦'],
        [LifeCategory.FINANCE]: ['お金', '貯金', '収支', '経済'],
        [LifeCategory.TRAVEL]: ['旅', '移動', '観光', '発見'],
        [LifeCategory.EDUCATION]: ['学習', '知識', '勉強', '教育']
      }
      return defaultWords[category] || []
    }

    return Array.from(foundWords).slice(0, limit)
  }

  const generateMergedMindmap = async () => {
    setIsAnalyzing(true)
    
    try {
      // 期間でフィルタリング
      let filteredDiaries = [...diaries]
      const now = new Date()
      
      switch (selectedPeriod) {
        case 'month':
          const monthStart = startOfMonth(now)
          const monthEnd = endOfMonth(now)
          filteredDiaries = diaries.filter(d => {
            const date = new Date(d.entryDate)
            return date >= monthStart && date <= monthEnd
          })
          break
        case '3months':
          const threeMonthsAgo = subMonths(now, 3)
          filteredDiaries = diaries.filter(d => new Date(d.entryDate) >= threeMonthsAgo)
          break
        case 'year':
          const oneYearAgo = subMonths(now, 12)
          filteredDiaries = diaries.filter(d => new Date(d.entryDate) >= oneYearAgo)
          break
        // 'all' の場合はフィルタリングしない
      }

      // カテゴリー別に分類と単語抽出
      const categorizedData = new Map<string, any[]>()
      const categoryWords = new Map<string, string[]>()
      
      filteredDiaries.forEach(diary => {
        const categories = categorizeDiary(diary.content || '')
        categories.forEach(category => {
          if (!categorizedData.has(category)) {
            categorizedData.set(category, [])
          }
          categorizedData.get(category)!.push(diary)
        })
      })

      // カテゴリーごとに関連する単語を抽出
      categorizedData.forEach((entries, category) => {
        const allText = entries.map(e => e.content || '').join(' ')
        const words = extractCategoryRelatedWords(allText, category as LifeCategory, 8) // カテゴリー関連の単語を最大8個
        categoryWords.set(category, words)
      })

      setMergedData({
        categories: categorizedData,
        totalEntries: filteredDiaries.length,
        period: selectedPeriod
      })

      // ノードとエッジを生成
      const newNodes: Node[] = []
      const newEdges: Edge[] = []

      // ルートノード
      const rootNode: Node = {
        id: 'root',
        type: 'merged',
        position: { x: 0, y: 0 },
        data: { 
          label: getPeriodLabel(selectedPeriod),
          type: 'root',
          count: filteredDiaries.length,
          emotionScore: 3
        }
      }
      newNodes.push(rootNode)

      // カテゴリーノードを円形に配置
      const radius = 300
      const angleStep = (2 * Math.PI) / categorizedData.size
      let angleIndex = 0

      Array.from(categorizedData.entries()).forEach(([category, entries]) => {
        const angle = angleIndex * angleStep
        const x = radius * Math.cos(angle)
        const y = radius * Math.sin(angle)
        
        const config = categoryConfig[category as LifeCategory]
        const categoryNodeId = `category-${category}`
        
        // カテゴリーノード
        newNodes.push({
          id: categoryNodeId,
          type: 'merged',
          position: { x, y },
          data: {
            label: category,
            type: 'category',
            icon: config.icon,
            color: config.color,
            bgColor: config.bgColor,
            count: entries.length,
            entries: entries
          }
        })

        // ルートからカテゴリーへのエッジ
        newEdges.push({
          id: `edge-root-${categoryNodeId}`,
          source: 'root',
          target: categoryNodeId,
          type: 'smoothstep',
          animated: entries.length > 3,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: config.color,
          },
          style: {
            stroke: config.color,
            strokeWidth: Math.min(entries.length * 0.8, 4),
            strokeOpacity: 0.8,
          }
        })

        // 各カテゴリーの単語を花火状に360度全体に配置
        const words = categoryWords.get(category) || []
        const baseRadius = 150
        const wordAngleStep = (2 * Math.PI) / Math.max(words.length, 1)

        words.forEach((word, index) => {
          // 各単語を円周上に均等に配置
          const wordAngle = index * wordAngleStep
          // ランダムな距離で花火のような広がりを演出
          const randomDistance = baseRadius + (Math.random() * 80 - 40)
          const wordX = x + randomDistance * Math.cos(wordAngle)
          const wordY = y + randomDistance * Math.sin(wordAngle)
          
          const wordNodeId = `word-${category}-${index}`
          
          // 単語ノード（花火の火花のような見た目）
          const brightness = 0.8 + Math.random() * 0.2  // 明るさのバリエーション
          const sizeVariation = Math.random() * 10 + 14  // サイズのバリエーション（14-24px）
          
          newNodes.push({
            id: wordNodeId,
            type: 'merged',
            position: { x: wordX, y: wordY },
            data: {
              label: word,
              type: 'word',
              category: category,
              color: config.color,
              bgColor: config.bgColor,
              size: sizeVariation,
              opacity: brightness  // 明るさのバリエーションを追加
            }
          })

          // カテゴリーから単語へのエッジ（花火の光のような演出）
          newEdges.push({
            id: `edge-${categoryNodeId}-${wordNodeId}`,
            source: categoryNodeId,
            target: wordNodeId,
            type: 'straight',  // 直線で放射状に
            animated: true,  // アニメーションで花火の輝きを表現
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 10,
              height: 10,
              color: config.color,
            },
            style: {
              stroke: config.color,
              strokeWidth: 1.5,
              strokeOpacity: 0.6,
              strokeDasharray: '3,3',  // 点線で軽やかに
            }
          })
        })

        angleIndex++
      })

      setNodes(newNodes)
      setEdges(newEdges)

    } catch (error) {
      console.error('マインドマップ生成エラー:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'month': return `今月の人生マップ`
      case '3months': return `過去3ヶ月の人生マップ`
      case 'year': return `今年の人生マップ`
      case 'all': return `人生の全体マップ`
      default: return '人生マップ'
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      {/* ヘッダー */}
      <div className="bg-white dark:bg-gray-800 shadow-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Layers className="w-6 h-6 text-purple-500" />
              統合マインドマップ
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              日記をカテゴリー別に分類して人生の全体像を可視化
            </p>
          </div>
          
          {/* 期間選択 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="month">今月</option>
                <option value="3months">過去3ヶ月</option>
                <option value="year">過去1年</option>
                <option value="all">全期間</option>
              </select>
            </div>
            
            <Button
              onClick={generateMergedMindmap}
              disabled={isAnalyzing}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isAnalyzing ? '分析中...' : '再生成'}
            </Button>
          </div>
        </div>

        {/* 統計情報 */}
        {mergedData && (
          <div className="mt-4 flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">
                {mergedData.totalEntries}件の日記
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">
                {mergedData.categories.size}個のカテゴリー
              </span>
            </div>
          </div>
        )}
      </div>

      {/* マインドマップ */}
      <div className="flex-1">
        {isAnalyzing ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">日記を分析してカテゴリーに分類中...</p>
            </div>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
            className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900"
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        )}
      </div>

      {/* カテゴリー凡例 */}
      <div className="bg-white dark:bg-gray-800 px-6 py-3 border-t">
        <div className="flex gap-4 items-center flex-wrap">
          <span className="text-xs text-gray-600 dark:text-gray-400">カテゴリー:</span>
          {Object.entries(categoryConfig).map(([category, config]) => {
            const Icon = config.icon
            return (
              <div key={category} className="flex items-center gap-1">
                <Icon className="w-3 h-3" style={{ color: config.color }} />
                <span className="text-xs" style={{ color: config.color }}>
                  {category}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function MindmapMergePage() {
  return (
    <ReactFlowProvider>
      <MindmapMergeContent />
    </ReactFlowProvider>
  )
}