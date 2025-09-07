'use client'

import React, { useState, useEffect, useRef } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer } from 'recharts'
import { Filter, Cloud, TrendingUp, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns'
import { ja } from 'date-fns/locale'
import * as d3 from 'd3'
import cloud from 'd3-cloud'

interface WordFrequency {
  word: string
  count: number
  type?: string // 名詞、動詞、形容詞など
}

interface MonthlyWordData {
  month: string
  words: WordFrequency[]
}

export default function WordAnalysisPage() {
  const [diaries, setDiaries] = useState<any[]>([])
  const [wordData, setWordData] = useState<WordFrequency[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyWordData[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | '3months' | 'year' | 'all'>('month')
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [viewMode, setViewMode] = useState<'cloud' | 'bar' | 'timeline'>('cloud')
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    fetchDiaries()
  }, [])

  useEffect(() => {
    if (diaries.length > 0) {
      analyzeWords()
    }
  }, [diaries, selectedPeriod, selectedMonth])

  useEffect(() => {
    if (wordData.length > 0 && viewMode === 'cloud' && svgRef.current) {
      drawWordCloud()
    }
  }, [wordData, viewMode])

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

  // 日本語の単語を抽出する簡易的な関数（kuromojiが使えない環境用）
  const extractWords = (text: string): WordFrequency[] => {
    // ストップワード（除外する単語）
    const stopWords = new Set([
      'の', 'に', 'は', 'を', 'た', 'が', 'で', 'て', 'と', 'し', 'れ', 'さ',
      'ある', 'いる', 'も', 'する', 'から', 'な', 'こと', 'として', 'い', 'や',
      'れる', 'など', 'なっ', 'ない', 'この', 'ため', 'その', 'あっ', 'よう',
      'また', 'もの', 'という', 'あり', 'まで', 'られ', 'なる', 'へ', 'か',
      'だ', 'これ', 'によって', 'により', 'おり', 'より', 'による', 'ず', 'なり',
      'ら', 'なく', 'しかし', 'について', 'だけ', 'だっ', 'それ', 'でも', 'でし', 
      'です', 'ます', 'ました', 'ません', 'でした', 'だった', 'って', 'ちょっと',
      'いい', 'ので', 'けど', 'みたい', 'とか', 'だから', 'けれど', 'でき',
      'きた', 'いた', 'あった', 'なんだか', 'かんだ', 'ながら', 'たら', 'すごく'
    ])

    // 短い単語を抽出（2-3文字の名詞を優先）
    const shortWordPattern = /([一-龯]{1,3}|[ァ-ヴー]{2,4}|[ぁ-ん]{2,3})/g
    const longWordPattern = /([一-龯ぁ-んァ-ヴー]{2,5})/g
    
    // まず短い単語を試す
    let matches = text.match(shortWordPattern) || []
    
    // 短い単語が少ない場合は長めの単語も含める
    if (matches.length < 20) {
      matches = text.match(longWordPattern) || []
    }
    
    const wordCount = new Map<string, number>()
    
    matches.forEach(word => {
      // 1-3文字の単語を優先、ストップワードでない単語をカウント
      if (word.length >= 1 && word.length <= 3 && !stopWords.has(word) && !word.match(/^[ぁ-ん]+$/)) {
        const count = wordCount.get(word) || 0
        wordCount.set(word, count + 1)
      }
    })

    return Array.from(wordCount.entries())
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50) // 上位50単語
  }

  const analyzeWords = async () => {
    setIsAnalyzing(true)
    
    try {
      // 期間でフィルタリング
      let filteredDiaries = [...diaries]
      const now = new Date()
      
      switch (selectedPeriod) {
        case 'month':
          const monthStart = startOfMonth(selectedMonth)
          const monthEnd = endOfMonth(selectedMonth)
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

      // すべての日記テキストを結合
      const allText = filteredDiaries
        .map(d => d.content || '')
        .join(' ')

      // 単語を抽出
      const words = extractWords(allText)
      setWordData(words)

      // 月別データの作成（タイムライン用）- 3ヶ月も追加
      if (selectedPeriod === '3months' || selectedPeriod === 'year' || selectedPeriod === 'all') {
        const months = selectedPeriod === 'year'
          ? eachMonthOfInterval({ start: subMonths(now, 11), end: now })
          : selectedPeriod === '3months'
          ? eachMonthOfInterval({ start: subMonths(now, 2), end: now })
          : eachMonthOfInterval({ 
              start: new Date(Math.min(...diaries.map(d => new Date(d.entryDate).getTime()))),
              end: now
            })

        const monthlyWordData: MonthlyWordData[] = months.map(month => {
          const monthStart = startOfMonth(month)
          const monthEnd = endOfMonth(month)
          const monthDiaries = diaries.filter(d => {
            const date = new Date(d.entryDate)
            return date >= monthStart && date <= monthEnd
          })
          
          const monthText = monthDiaries.map(d => d.content || '').join(' ')
          const monthWords = extractWords(monthText).slice(0, 10) // 月ごとの上位10単語
          
          return {
            month: format(month, 'yyyy-MM', { locale: ja }),
            words: monthWords
          }
        })

        setMonthlyData(monthlyWordData)
      }

    } catch (error) {
      console.error('単語分析エラー:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const drawWordCloud = () => {
    if (!svgRef.current || wordData.length === 0) return

    // 既存のSVG要素をクリア
    d3.select(svgRef.current).selectAll('*').remove()

    const width = 800
    const height = 400

    // フォントサイズの範囲を設定
    const fontSizeScale = d3.scaleLinear()
      .domain([1, Math.max(...wordData.map(d => d.count))])
      .range([16, 80])

    // カラースケール
    const colorScale = d3.scaleOrdinal(d3.schemeSet3)

    // D3-cloudレイアウトを作成
    const layout = cloud()
      .size([width, height])
      .words(wordData.map(d => ({ ...d, text: d.word, size: fontSizeScale(d.count) })))
      .padding(5)
      .rotate(() => (Math.random() - 0.5) * 60)
      .font('sans-serif')
      .fontSize((d: any) => d.size)
      .on('end', draw)

    layout.start()

    function draw(words: any) {
      const svg = d3.select(svgRef.current)
        .attr('width', width)
        .attr('height', height)

      const g = svg.append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`)

      g.selectAll('text')
        .data(words)
        .enter().append('text')
        .style('font-size', (d: any) => `${d.size}px`)
        .style('font-family', 'sans-serif')
        .style('font-weight', 'bold')
        .style('fill', (d: any, i: number) => colorScale(i.toString()))
        .attr('text-anchor', 'middle')
        .attr('transform', (d: any) => `translate(${d.x},${d.y})rotate(${d.rotate})`)
        .text((d: any) => d.text)
        .style('cursor', 'pointer')
        .on('mouseover', function() {
          d3.select(this).style('opacity', 0.7)
        })
        .on('mouseout', function() {
          d3.select(this).style('opacity', 1)
        })
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  // 時系列データの準備（特定の単語の推移）
  const getTimelineData = () => {
    if (monthlyData.length === 0 || wordData.length === 0) return []

    // 上位5単語の時系列データを作成
    const topWords = wordData.slice(0, 5).map(w => w.word)
    
    return monthlyData.map(month => {
      const data: any = { month: month.month }
      topWords.forEach(word => {
        const found = month.words.find(w => w.word === word)
        data[word] = found ? found.count : 0
      })
      return data
    })
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        単語分析
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        日記に登場する頻出単語を可視化します
      </p>

      {/* フィルターコントロール */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              分析期間
            </h2>
          </div>

          {/* ビューモード切り替え */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'cloud' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('cloud')}
            >
              <Cloud className="w-4 h-4 mr-1" />
              クラウド
            </Button>
            <Button
              variant={viewMode === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('bar')}
            >
              <BarChart className="w-4 h-4 mr-1" />
              棒グラフ
            </Button>
            <Button
              variant={viewMode === 'timeline' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('timeline')}
              disabled={selectedPeriod === 'month'}
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              時系列
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="month">月単位</option>
            <option value="3months">過去3ヶ月</option>
            <option value="year">過去1年</option>
            <option value="all">全期間</option>
          </select>

          {selectedPeriod === 'month' && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-3 py-2 text-gray-900 dark:text-white">
                {format(selectedMonth, 'yyyy年MM月', { locale: ja })}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth('next')}
                disabled={selectedMonth >= new Date()}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 分析結果表示 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        {isAnalyzing ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">単語を分析中...</p>
            </div>
          </div>
        ) : wordData.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Cloud className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                この期間の日記データがありません
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ワードクラウド表示 */}
            {viewMode === 'cloud' && (
              <div className="flex justify-center">
                <svg ref={svgRef}></svg>
              </div>
            )}

            {/* 棒グラフ表示 */}
            {viewMode === 'bar' && (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={wordData.slice(0, 20)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="word"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8b5cf6" name="出現回数" />
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* 時系列グラフ表示 */}
            {viewMode === 'timeline' && selectedPeriod !== 'month' && (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={getTimelineData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {wordData.slice(0, 5).map((word, i) => (
                    <Line
                      key={word.word}
                      type="monotone"
                      dataKey={word.word}
                      stroke={d3.schemeSet3[i]}
                      strokeWidth={2}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}

            {/* 単語リスト */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                頻出単語TOP20
              </h3>
              <div className="flex flex-wrap gap-2">
                {wordData.slice(0, 20).map((word, i) => (
                  <span
                    key={word.word}
                    className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                    style={{
                      fontSize: `${Math.max(12, Math.min(20, 12 + word.count / 2))}px`
                    }}
                  >
                    {word.word} ({word.count})
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 説明 */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
          単語分析について
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li>• 日記に頻繁に登場する単語を抽出して可視化します</li>
          <li>• ワードクラウドでは、文字の大きさが出現頻度を表します</li>
          <li>• 時系列グラフで、特定の単語の使用頻度の変化を追跡できます</li>
          <li>• あなたの関心事や思考パターンの変化を発見できます</li>
        </ul>
      </div>
    </div>
  )
}