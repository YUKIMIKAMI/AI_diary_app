import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { diaryHistory } = await request.json()
    
    if (!diaryHistory || diaryHistory.length === 0) {
      return NextResponse.json({ 
        error: '日記データが必要です' 
      }, { status: 400 })
    }
    
    // デモ用の固定PR文を返す
    const demoSelfPR = {
      title: 'あなたの成長の軌跡',
      content: `これまでの日記から、以下のような強みと成長が見られます：

【主な強み】
• 継続的な自己改善への意欲
• 困難に直面しても前向きに取り組む姿勢
• 新しいことへの挑戦を恐れない好奇心
• 周囲との協調性とコミュニケーション能力

【成長のポイント】
日々の記録から、着実に成長している様子が伺えます。
特に問題解決能力と、感情のコントロール力が向上しています。

【今後の可能性】
この調子で自己理解を深めていけば、
より大きな目標達成も可能でしょう。`,
      keywords: ['成長', '挑戦', '継続', '前向き']
    }
    
    return NextResponse.json(demoSelfPR)
    
  } catch (error) {
    console.error('自己PR生成エラー:', error)
    return NextResponse.json({ 
      error: '自己PRの生成に失敗しました' 
    }, { status: 500 })
  }
}