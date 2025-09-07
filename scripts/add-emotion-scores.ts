import fs from 'fs/promises'
import path from 'path'
import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'

// .env.localの設定を読み込み
dotenv.config({ path: '.env.local' })

const DATA_PATH = path.join(process.cwd(), 'data', 'diaries.json')

// 感情分析関数（既存のAIサービスの簡易版）
async function analyzeEmotion(content: string): Promise<number> {
  // Google Gemini APIが設定されている場合は使用
  const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  
  if (geminiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      
      const prompt = `以下の日記の感情を1-5のスコアで評価してください。
1=非常にネガティブ、2=ややネガティブ、3=中立、4=ややポジティブ、5=非常にポジティブ

日記内容: ${content}

スコアのみを数字で回答してください（1-5の整数）。`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const scoreText = response.text().trim()
      const score = parseInt(scoreText, 10)
      
      if (!isNaN(score) && score >= 1 && score <= 5) {
        return score
      }
    } catch (error) {
      console.error('AI分析エラー:', error)
    }
  }
  
  // APIが使えない場合は簡易的なテキスト分析
  return analyzeEmotionLocal(content)
}

// ローカル感情分析（簡易版）
function analyzeEmotionLocal(content: string): number {
  const positiveWords = [
    '嬉しい', '楽しい', '幸せ', '良い', 'よかった', '素晴らしい', 
    '心に残る', '集中できた', '達成', '完成', '成功', '素敵',
    '穏やか', 'ありがとう', '感謝'
  ]
  
  const negativeWords = [
    '悲しい', '辛い', '疲れ', '不安', '心配', '焦る', '焦り',
    'もやもや', 'イライラ', '怒り', '失敗', 'ダメ', '最悪',
    '嫌', '困る', 'つらい'
  ]
  
  let positiveCount = 0
  let negativeCount = 0
  
  for (const word of positiveWords) {
    if (content.includes(word)) positiveCount++
  }
  
  for (const word of negativeWords) {
    if (content.includes(word)) negativeCount++
  }
  
  // スコア計算
  if (positiveCount > negativeCount * 2) return 4
  if (positiveCount > negativeCount) return 3.5
  if (negativeCount > positiveCount * 2) return 2
  if (negativeCount > positiveCount) return 2.5
  return 3 // 中立
}

async function addEmotionScores() {
  console.log('📊 日記データの感情分析を開始します...')
  
  try {
    // 既存データを読み込み
    const data = await fs.readFile(DATA_PATH, 'utf-8')
    const diaries = JSON.parse(data)
    
    console.log(`📚 ${diaries.length}件の日記を処理します`)
    
    // 各日記に感情スコアを追加
    for (let i = 0; i < diaries.length; i++) {
      const diary = diaries[i]
      
      if (!diary.emotionScore && diary.content) {
        console.log(`分析中 [${i + 1}/${diaries.length}]: ${diary.content.substring(0, 30)}...`)
        
        const score = await analyzeEmotion(diary.content)
        diary.emotionScore = score
        
        console.log(`  → スコア: ${score} ${'⭐'.repeat(Math.round(score))}`)
        
        // API制限を避けるため少し待機
        if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      } else if (diary.emotionScore) {
        console.log(`スキップ [${i + 1}/${diaries.length}]: 既にスコアあり (${diary.emotionScore})`)
      }
    }
    
    // データを保存
    await fs.writeFile(DATA_PATH, JSON.stringify(diaries, null, 2), 'utf-8')
    
    console.log('✅ 感情分析が完了しました！')
    
    // 統計情報を表示
    const scores = diaries.map((d: any) => d.emotionScore).filter((s: any) => s)
    const avgScore = scores.reduce((a: number, b: number) => a + b, 0) / scores.length
    const positiveCount = scores.filter((s: number) => s >= 4).length
    const neutralCount = scores.filter((s: number) => s >= 2.5 && s < 4).length
    const negativeCount = scores.filter((s: number) => s < 2.5).length
    
    console.log('\n📈 統計情報:')
    console.log(`  平均スコア: ${avgScore.toFixed(2)}`)
    console.log(`  ポジティブ: ${positiveCount}件 (${(positiveCount / scores.length * 100).toFixed(1)}%)`)
    console.log(`  ニュートラル: ${neutralCount}件 (${(neutralCount / scores.length * 100).toFixed(1)}%)`)
    console.log(`  ネガティブ: ${negativeCount}件 (${(negativeCount / scores.length * 100).toFixed(1)}%)`)
    
  } catch (error) {
    console.error('エラーが発生しました:', error)
    process.exit(1)
  }
}

// 実行
addEmotionScores()