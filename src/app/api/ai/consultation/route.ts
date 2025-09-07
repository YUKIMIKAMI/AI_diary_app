import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/services/ai-service'

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()

    // 過去の日記データを取得
    const diariesPath = './data/diaries.json'
    let allDiaries: any[] = []
    
    try {
      const fs = (await import('fs')).default
      const data = fs.readFileSync(diariesPath, 'utf8')
      allDiaries = JSON.parse(data)
    } catch (error) {
      console.log('日記データの読み込みエラー:', error)
    }

    // 過去の日記から関連する内容を抽出（簡易版）
    const relevantContext = extractRelevantContext(message, allDiaries)

    // AIに問い合わせ
    const response = await aiService.generateConsultationResponse(
      message,
      relevantContext,
      history
    )

    return NextResponse.json({
      success: true,
      response: response
    })
  } catch (error) {
    console.error('相談API エラー:', error)
    return NextResponse.json(
      {
        success: false,
        response: '申し訳ございません。現在、システムに問題が発生しています。しばらくお待ちいただいてから再度お試しください。'
      },
      { status: 200 } // エラーでも200で返す
    )
  }
}

// 関連する日記を抽出する関数
function extractRelevantContext(message: string, diaries: any[]): string {
  if (!diaries || diaries.length === 0) {
    return ''
  }

  // メッセージに含まれるキーワードを抽出（簡易版）
  const keywords = message.split(/[\s、。！？]/).filter(word => word.length > 2)
  
  // 関連度の高い日記を検索
  const relevantDiaries = diaries
    .map(diary => {
      // キーワードマッチングでスコアを計算
      let score = 0
      keywords.forEach(keyword => {
        if (diary.content && diary.content.includes(keyword)) {
          score += 1
        }
      })
      
      // 時期に関する質問の場合、日付も考慮
      if (message.includes('最近') || message.includes('今月') || message.includes('先月')) {
        const diaryDate = new Date(diary.entryDate)
        const now = new Date()
        const daysDiff = Math.floor((now.getTime() - diaryDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (message.includes('最近') && daysDiff < 7) {
          score += 3
        } else if (message.includes('今月') && daysDiff < 30) {
          score += 2
        } else if (message.includes('先月') && daysDiff >= 30 && daysDiff < 60) {
          score += 2
        }
      }
      
      return { ...diary, relevanceScore: score }
    })
    .filter(diary => diary.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 3) // 最も関連性の高い3件を抽出

  // コンテキストとして整形
  if (relevantDiaries.length === 0) {
    // 関連する日記がない場合は、最新の日記を使用
    const recentDiaries = diaries
      .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())
      .slice(0, 3)
    
    return recentDiaries
      .map(diary => `【${new Date(diary.entryDate).toLocaleDateString('ja-JP')}の日記】\n${diary.content}`)
      .join('\n\n')
  }

  return relevantDiaries
    .map(diary => `【${new Date(diary.entryDate).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}の日記】\n${diary.content}`)
    .join('\n\n')
}