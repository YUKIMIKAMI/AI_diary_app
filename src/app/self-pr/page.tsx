'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, Copy, RefreshCw, Briefcase, Award, Target, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface PRVersion {
  id: string
  title: string
  content: string
  type: 'career' | 'strengths' | 'achievements'
  keywords: string[]
}

export default function SelfPRPage() {
  const [diaries, setDiaries] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [prVersions, setPrVersions] = useState<PRVersion[]>([])
  const [selectedVersion, setSelectedVersion] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<{
    strengths: string[]
    achievements: string[]
    skills: string[]
  } | null>(null)

  const prTypes = [
    {
      id: 'career',
      name: '転職用',
      icon: Briefcase,
      description: 'キャリアアップ向けの自己PR'
    },
    {
      id: 'strengths',
      name: '強み重視',
      icon: Award,
      description: '個人の強みを強調した自己PR'
    },
    {
      id: 'achievements',
      name: '実績重視',
      icon: Target,
      description: '具体的な成果を中心とした自己PR'
    }
  ]

  useEffect(() => {
    fetchDiaries()
  }, [])

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

  const analyzeDiaries = () => {
    // 日記から強み・成果・スキルを抽出（簡易版）
    const strengths = []
    const achievements = []
    const skills = []

    diaries.forEach(diary => {
      const content = diary.content || ''
      
      // 強みのキーワード
      if (content.includes('集中') || content.includes('できた')) {
        strengths.push('高い集中力')
      }
      if (content.includes('看病') || content.includes('世話')) {
        strengths.push('責任感と思いやり')
      }
      if (content.includes('仕事') && content.includes('メール')) {
        strengths.push('マルチタスク能力')
      }
      
      // 成果のキーワード
      if (content.includes('完成') || content.includes('達成')) {
        achievements.push('プロジェクトの完遂')
      }
      if (content.includes('解決') || content.includes('改善')) {
        achievements.push('問題解決の実績')
      }
      
      // スキルのキーワード
      if (content.includes('分析') || content.includes('検討')) {
        skills.push('分析力')
      }
      if (content.includes('計画') || content.includes('整理')) {
        skills.push('計画性')
      }
    })

    // 重複を削除
    return {
      strengths: [...new Set(strengths)].slice(0, 3),
      achievements: [...new Set(achievements)].slice(0, 3),
      skills: [...new Set(skills)].slice(0, 3)
    }
  }

  const generatePR = async () => {
    setIsGenerating(true)
    setPrVersions([])
    
    try {
      // 日記を分析
      const analysis = analyzeDiaries()
      setAnalysisResult(analysis)

      // AI APIを呼び出し（実際の実装ではここでAI APIを使用）
      const response = await fetch('/api/ai/generate-pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diaries: diaries.slice(0, 10), // 最新10件を送信
          analysis
        })
      })

      if (response.ok) {
        const data = await response.json()
        setPrVersions(data.versions)
        setSelectedVersion(data.versions[0]?.id || '')
      } else {
        // モックデータで代替
        generateMockPR(analysis)
      }
    } catch (error) {
      console.error('PR生成エラー:', error)
      // エラー時はモックデータを使用
      const analysis = analyzeDiaries()
      setAnalysisResult(analysis)
      generateMockPR(analysis)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateMockPR = (analysis: any) => {
    const mockVersions: PRVersion[] = [
      {
        id: '1',
        title: '転職用自己PR',
        type: 'career',
        content: `私は、困難な状況においても冷静に対処し、複数のタスクを効率的にこなす能力を持っています。

家族の看病をしながら仕事を続けた経験から、限られた時間の中で優先順位をつけ、効率的に業務を遂行する力を身につけました。また、隙間時間を有効活用し、自己研鑽を怠らない姿勢は、常に成長を求める私の強みです。

${analysis.strengths.length > 0 ? `特に、${analysis.strengths.join('、')}といった強みを活かし、` : ''}チームの一員として、また個人としても成果を出し続けることができると確信しています。

これまでの経験を活かし、新しい環境でもすぐに適応し、貢献できる人材として、御社の発展に寄与したいと考えています。`,
        keywords: ['責任感', 'マルチタスク', '成長志向', '適応力']
      },
      {
        id: '2',
        title: '強み重視の自己PR',
        type: 'strengths',
        content: `私の最大の強みは、どんな状況でも前向きに取り組む姿勢と、複雑な状況を整理する能力です。

日々の生活の中で培った${analysis.strengths.join('、')}は、仕事においても大きな武器となっています。特に、ストレスフルな状況下でも集中力を保ち、質の高いアウトプットを出せることは、多くの場面で評価されてきました。

また、限られた時間を最大限に活用する時間管理能力も私の強みの一つです。家族との時間、仕事、自己成長のバランスを取りながら、それぞれの領域で成果を出してきました。

これらの強みを活かし、チームの生産性向上と目標達成に貢献していきます。`,
        keywords: analysis.strengths
      },
      {
        id: '3',
        title: '実績重視の自己PR',
        type: 'achievements',
        content: `私はこれまで、様々な制約の中で確実に成果を出してきました。

${analysis.achievements.length > 0 ? `具体的には、${analysis.achievements.join('、')}などの実績があります。` : '日々の業務において、常に改善を意識し、小さな成功を積み重ねてきました。'}

特筆すべきは、家族の看病という予期せぬ状況においても、仕事の質を落とすことなく、むしろ効率を上げて対応できたことです。この経験から、危機管理能力と柔軟な対応力が身につきました。

また、限られた時間の中でも自己学習を続け、新しい知識やスキルを積極的に取り入れる姿勢は、変化の激しい現代において重要な資質だと考えています。

これらの実績と経験を基に、さらなる成果を生み出していく所存です。`,
        keywords: [...analysis.achievements, '危機管理', '継続学習']
      }
    ]

    setPrVersions(mockVersions)
    setSelectedVersion(mockVersions[0].id)
  }

  const copyToClipboard = () => {
    const selectedPR = prVersions.find(v => v.id === selectedVersion)
    if (selectedPR) {
      navigator.clipboard.writeText(selectedPR.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const selectedPR = prVersions.find(v => v.id === selectedVersion)

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        自己PR生成
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        これまでの日記から、あなたの強みや実績を分析して自己PRを生成します
      </p>

      {/* 生成ボタン */}
      {prVersions.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <Sparkles className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            AIが日記を分析して自己PRを作成
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {diaries.length}件の日記データから、あなたの強みを見つけ出します
          </p>
          <Button
            onClick={generatePR}
            disabled={isGenerating || diaries.length === 0}
            className="gap-2"
            size="lg"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                分析中...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                自己PRを生成
              </>
            )}
          </Button>
        </div>
      )}

      {/* 分析結果 */}
      {analysisResult && (
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-4">
            日記から抽出された要素
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">強み</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-500">
                {analysisResult.strengths.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">成果</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-500">
                {analysisResult.achievements.map((a, i) => (
                  <li key={i}>• {a}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">スキル</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-500">
                {analysisResult.skills.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* PRバージョン選択 */}
      {prVersions.length > 0 && (
        <>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                生成された自己PR
              </h3>
              <Button
                onClick={generatePR}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                再生成
              </Button>
            </div>
            
            {/* バージョン選択タブ */}
            <div className="flex gap-2 mb-4">
              {prVersions.map(version => {
                const typeInfo = prTypes.find(t => t.id === version.type)
                const Icon = typeInfo?.icon || Sparkles
                return (
                  <Button
                    key={version.id}
                    variant={selectedVersion === version.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedVersion(version.id)}
                    className="gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {version.title}
                  </Button>
                )
              })}
            </div>

            {/* PR内容表示 */}
            {selectedPR && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="prose dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                    {selectedPR.content}
                  </div>
                </div>
                
                {/* キーワード */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex flex-wrap gap-2">
                    {selectedPR.keywords.map((keyword, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                      >
                        #{keyword}
                      </span>
                    ))}
                  </div>
                </div>

                {/* コピーボタン */}
                <div className="mt-6 flex justify-center">
                  <Button
                    onClick={copyToClipboard}
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        コピーしました！
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        クリップボードにコピー
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* 使用方法 */}
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
          使い方のヒント
        </h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• 日記を多く書くほど、より正確な自己PRが生成されます</li>
          <li>• 用途に応じて3つのバージョンから選べます</li>
          <li>• 生成された文章は自由に編集してご利用ください</li>
          <li>• 定期的に再生成すると、新しい視点の自己PRが得られます</li>
        </ul>
      </div>
    </div>
  )
}