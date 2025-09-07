import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/services/ai-service'
import { ragService } from '@/lib/rag-service'
import { wandbService } from '@/lib/wandb-service'

export async function POST(request: NextRequest) {
  try {
    const { answer, originalQuestion, diaryContent } = await request.json()
    
    if (!answer) {
      return NextResponse.json({ error: '回答が必要です' }, { status: 400 })
    }

    const startTime = Date.now()
    
    // 1. 回答から新しい質問を生成
    const followUpQuestions = await aiService.generateQuestions(`
      以下の質問と回答から、さらに深掘りする質問を2つ生成してください：
      
      元の質問: ${originalQuestion}
      回答: ${answer}
      
      質問は以下のカテゴリから選んでください：
      - reflection: 振り返りと学び
      - detail: 詳細の確認
      - emotion: 感情の探求
      - action: 今後の行動
    `)

    // 2. 感情分析
    const emotions = await aiService.analyzeEmotions(answer)
    
    // 3. キーワード抽出
    const keywords = await aiService.extractKeywords(answer)
    
    // 4. RAGデータとして保存（将来の対話で活用）
    const ragContext = {
      id: `answer-${Date.now()}`,
      content: answer,
      date: new Date(),
      emotions: emotions,
      keywords: keywords,
      embedding: [] // 実際の実装では埋め込みベクトルを生成
    }
    
    // セッションストレージに保存（デモ版）
    if (typeof window !== 'undefined') {
      const existingContexts = sessionStorage.getItem('ragContexts')
      const contexts = existingContexts ? JSON.parse(existingContexts) : []
      contexts.push(ragContext)
      sessionStorage.setItem('ragContexts', JSON.stringify(contexts))
    }
    
    // 5. W&Bメトリクスを記録
    wandbService.logEmotionAnalysis(
      emotions.overallScore,
      emotions.dominantEmotions,
      0.9
    )
    wandbService.logResponseTime(startTime, 'answer-analysis')
    
    // 6. 統合データを生成
    const integrationData = {
      originalDiary: diaryContent,
      question: originalQuestion,
      answer: answer,
      emotions: emotions,
      keywords: keywords,
      followUpQuestions: followUpQuestions.questions || [],
      timestamp: new Date().toISOString(),
      analysisScore: emotions.overallScore
    }
    
    return NextResponse.json({
      success: true,
      followUpQuestions: followUpQuestions.questions || [
        { question: '具体的にどのような気持ちでしたか？', category: 'emotion' },
        { question: '次はどうしたいと思いますか？', category: 'action' }
      ],
      emotions,
      keywords,
      integrationData
    })
    
  } catch (error) {
    console.error('回答分析エラー:', error)
    
    // デモモードのフォールバック
    return NextResponse.json({
      success: true,
      followUpQuestions: [
        { question: 'それについてもう少し詳しく教えてください', category: 'detail' },
        { question: 'その経験から何を学びましたか？', category: 'reflection' }
      ],
      emotions: {
        overallScore: 3.5,
        dominantEmotions: ['思考的', '前向き'],
        emotionScores: { 思考的: 0.5, 前向き: 0.3, 穏やか: 0.2 }
      },
      keywords: ['成長', '学び', '挑戦'],
      integrationData: {
        analysisScore: 3.5
      }
    })
  }
}