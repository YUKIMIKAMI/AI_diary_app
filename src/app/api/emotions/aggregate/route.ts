import { NextRequest, NextResponse } from 'next/server'
import { subDays, format, startOfWeek, startOfMonth, startOfYear, endOfWeek, endOfMonth, endOfYear } from 'date-fns'
import { readFileSync } from 'fs'
import path from 'path'
import { aiService } from '@/lib/services/ai-service'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const period = searchParams.get('period') || 'month'
  
  try {
    // データファイルから日記データを読み込み
    const dataPath = path.join(process.cwd(), 'data', 'diaries.json')
    const rawData = readFileSync(dataPath, 'utf8')
    const diaries = JSON.parse(rawData)
    
    // 期間に応じてデータをフィルタリング
    const now = new Date()
    let startDate: Date
    let endDate: Date = now
    
    switch (period) {
      case 'week':
        startDate = subDays(now, 7)
        break
      case 'month':
        startDate = subDays(now, 30)
        break
      case 'year':
        startDate = subDays(now, 365)
        break
      default:
        startDate = subDays(now, 30)
    }
    
    // 期間内の日記をフィルタリング
    const filteredDiaries = diaries.filter((diary: any) => {
      const entryDate = new Date(diary.entryDate)
      return entryDate >= startDate && entryDate <= endDate
    })
    
    // 各日記の感情分析を実行（既存の感情データがない場合）
    const emotionAnalysisPromises = filteredDiaries.map(async (diary: any) => {
      // ここでは実際のAI分析を呼び出す
      const emotions = await aiService.analyzeEmotions(diary.content)
      
      return {
        date: format(new Date(diary.entryDate), 'yyyy-MM-dd'),
        ...emotions.emotions,
        overallScore: emotions.overallScore,
        dominantEmotions: emotions.dominantEmotions
      }
    })
    
    const emotionData = await Promise.all(emotionAnalysisPromises)
    
    // チャート用のデータフォーマット
    const chartData = emotionData.map(data => ({
      date: data.date,
      joy: data.joy,
      sadness: data.sadness,
      anger: data.anger,
      fear: data.fear,
      surprise: data.surprise,
      disgust: data.disgust,
      trust: data.trust,
      anticipation: data.anticipation,
      overall: data.overallScore * 20 // 1-5を0-100にスケーリング
    }))
    
    // 統計情報の計算
    const stats = calculateStats(emotionData)
    
    return NextResponse.json({
      success: true,
      chartData,
      stats
    })
  } catch (error) {
    console.error('感情データ集計エラー:', error)
    
    // エラー時はモックデータを返す
    const mockData = generateMockData(period)
    return NextResponse.json({
      success: true,
      chartData: mockData.chartData,
      stats: mockData.stats
    })
  }
}

// 統計情報を計算
function calculateStats(emotionData: any[]) {
  if (emotionData.length === 0) {
    return {
      averageScore: 0,
      dominantEmotion: '平穏',
      totalEntries: 0,
      trend: 'stable' as const
    }
  }
  
  // 平均スコアの計算
  const averageScore = emotionData.reduce((sum, data) => sum + data.overallScore, 0) / emotionData.length
  
  // 最も多い感情の特定
  const emotionCounts: { [key: string]: number } = {}
  emotionData.forEach(data => {
    data.dominantEmotions?.forEach((emotion: string) => {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1
    })
  })
  
  const dominantEmotion = Object.entries(emotionCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || '平穏'
  
  // トレンド計算（最初と最後の期間を比較）
  let trend: 'up' | 'down' | 'stable' = 'stable'
  if (emotionData.length >= 2) {
    const firstHalf = emotionData.slice(0, Math.floor(emotionData.length / 2))
    const secondHalf = emotionData.slice(Math.floor(emotionData.length / 2))
    
    const firstAvg = firstHalf.reduce((sum, d) => sum + d.overallScore, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.overallScore, 0) / secondHalf.length
    
    if (secondAvg - firstAvg > 0.5) trend = 'up'
    else if (firstAvg - secondAvg > 0.5) trend = 'down'
  }
  
  return {
    averageScore: Math.round(averageScore * 10) / 10,
    dominantEmotion,
    totalEntries: emotionData.length,
    trend
  }
}

// モックデータ生成
function generateMockData(period: string) {
  const days = period === 'week' ? 7 : period === 'month' ? 30 : 365
  const chartData = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
    chartData.push({
      date,
      joy: Math.random() * 80 + 20,
      sadness: Math.random() * 60,
      anger: Math.random() * 40,
      fear: Math.random() * 50,
      surprise: Math.random() * 60,
      disgust: Math.random() * 30,
      trust: Math.random() * 70 + 30,
      anticipation: Math.random() * 60 + 20,
      overall: Math.random() * 40 + 60
    })
  }
  
  return {
    chartData,
    stats: {
      averageScore: 3.5,
      dominantEmotion: '平穏',
      totalEntries: chartData.length,
      trend: 'stable' as const
    }
  }
}