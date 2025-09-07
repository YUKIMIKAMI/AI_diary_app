/**
 * Prompt Optimizer Service
 * AIプロンプトの最適化とパーソナライゼーション
 */

export interface PromptTemplate {
  id: string
  name: string
  template: string
  parameters: Record<string, any>
  effectiveness: number // 0-1のスコア
}

export interface OptimizationResult {
  originalPrompt: string
  optimizedPrompt: string
  improvements: string[]
  score: number
}

class PromptOptimizer {
  private templates: Map<string, PromptTemplate> = new Map()
  private performanceHistory: OptimizationResult[] = []
  
  constructor() {
    this.initializeTemplates()
  }
  
  /**
   * プロンプトテンプレートの初期化
   */
  private initializeTemplates() {
    // 対話型日記作成用テンプレート
    this.templates.set('diary_conversation', {
      id: 'diary_conversation',
      name: '対話型日記作成',
      template: `あなたは共感的で洞察力のある日記作成アシスタントです。

役割:
- ユーザーの感情に深く共感する
- 具体的で思慮深い質問をする
- ポジティブな視点を提供する
- 成長と自己理解を促進する

コミュニケーションスタイル:
- 温かく親しみやすい口調
- 判断せず受け入れる姿勢
- 適度な距離感を保つ
- 2-3文の簡潔な応答

現在の文脈:
{context}

ユーザーの発言: {userMessage}

応答ガイドライン:
1. まず共感を示す
2. 深掘りする質問を1つ含める
3. 必要に応じて励ましや洞察を提供`,
      parameters: {
        temperature: 0.7,
        maxTokens: 150,
        topP: 0.9
      },
      effectiveness: 0.85
    })
    
    // 感情分析用テンプレート
    this.templates.set('emotion_analysis', {
      id: 'emotion_analysis',
      name: '感情分析',
      template: `以下の日記テキストから感情を分析してください。

分析する要素:
1. 全体的な感情トーン（1-5のスコア）
2. 主要な感情（最大3つ）
3. 各感情の強度（0-1）
4. 潜在的な感情（明示されていないが示唆される感情）

テキスト: {text}

出力形式:
- overallScore: 数値
- dominantEmotions: 配列
- emotionScores: オブジェクト
- subtleEmotions: 配列

分析は客観的かつ共感的に行ってください。`,
      parameters: {
        temperature: 0.3,
        maxTokens: 200,
        topP: 0.95
      },
      effectiveness: 0.88
    })
    
    // 自己PR生成用テンプレート
    this.templates.set('self_pr_generation', {
      id: 'self_pr_generation',
      name: '自己PR生成',
      template: `過去の日記データを基に、魅力的な自己PRを作成します。

分析データ:
- 頻出テーマ: {themes}
- 強み: {strengths}
- 成長エピソード: {growthStories}
- 価値観: {values}

目的: {purpose}（転職/自己紹介/プロフィール等）

作成ガイドライン:
1. 具体的なエピソードを含める
2. 数値や成果を可能な限り含める
3. {purpose}に適した内容にする
4. 300-500文字程度
5. 前向きで誠実なトーン

自己PR:`,
      parameters: {
        temperature: 0.6,
        maxTokens: 500,
        topP: 0.9
      },
      effectiveness: 0.82
    })
    
    // 質問生成用テンプレート
    this.templates.set('question_generation', {
      id: 'question_generation',
      name: '深掘り質問生成',
      template: `日記の内容から、自己理解を深める質問を生成します。

日記内容: {content}
感情状態: {emotions}
キーワード: {keywords}

質問生成の観点:
1. 感情の原因を探る
2. 価値観を明確にする
3. 行動パターンを認識する
4. 成長機会を見出す
5. 関係性を深める

生成する質問（5つ）:
- 各質問は具体的で答えやすいものにする
- オープンエンドで深い思考を促す
- ポジティブな視点を含める`,
      parameters: {
        temperature: 0.8,
        maxTokens: 250,
        topP: 0.85
      },
      effectiveness: 0.87
    })
  }
  
  /**
   * プロンプトを最適化
   */
  optimizePrompt(
    templateId: string,
    variables: Record<string, any>
  ): OptimizationResult {
    const template = this.templates.get(templateId)
    if (!template) {
      throw new Error(`Template ${templateId} not found`)
    }
    
    // 変数を埋め込み
    let optimizedPrompt = template.template
    const improvements: string[] = []
    
    // 変数の置換
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{${key}}`
      if (optimizedPrompt.includes(placeholder)) {
        optimizedPrompt = optimizedPrompt.replace(
          new RegExp(placeholder, 'g'),
          String(value)
        )
      }
    })
    
    // コンテキストの長さ最適化
    if (variables.context && String(variables.context).length > 500) {
      const truncated = this.truncateContext(String(variables.context), 500)
      optimizedPrompt = optimizedPrompt.replace(variables.context, truncated)
      improvements.push('コンテキストを最適な長さに調整')
    }
    
    // 感情的なキーワードの強調
    const emotionalKeywords = this.detectEmotionalKeywords(optimizedPrompt)
    if (emotionalKeywords.length > 0) {
      improvements.push(`感情キーワード検出: ${emotionalKeywords.join(', ')}`)
    }
    
    // トーンの調整
    if (variables.userMood) {
      optimizedPrompt = this.adjustToneForMood(optimizedPrompt, variables.userMood)
      improvements.push(`ユーザーの気分に合わせてトーン調整: ${variables.userMood}`)
    }
    
    // スコア計算
    const score = this.calculatePromptScore(optimizedPrompt, template)
    
    const result: OptimizationResult = {
      originalPrompt: template.template,
      optimizedPrompt,
      improvements,
      score
    }
    
    // パフォーマンス履歴に追加
    this.performanceHistory.push(result)
    
    return result
  }
  
  /**
   * コンテキストを適切な長さに切り詰める
   */
  private truncateContext(context: string, maxLength: number): string {
    if (context.length <= maxLength) return context
    
    // 重要な部分を保持しながら切り詰め
    const sentences = context.split('。')
    let result = ''
    let currentLength = 0
    
    for (const sentence of sentences) {
      if (currentLength + sentence.length > maxLength) break
      result += sentence + '。'
      currentLength += sentence.length + 1
    }
    
    return result || context.substring(0, maxLength) + '...'
  }
  
  /**
   * 感情的なキーワードを検出
   */
  private detectEmotionalKeywords(text: string): string[] {
    const emotionalWords = [
      '嬉しい', '悲しい', '楽しい', '辛い', '幸せ', '不安',
      '怒り', '喜び', '恐れ', '期待', '失望', '感動',
      '緊張', '安心', '満足', '後悔', '感謝', '愛'
    ]
    
    return emotionalWords.filter(word => text.includes(word))
  }
  
  /**
   * ユーザーの気分に合わせてトーンを調整
   */
  private adjustToneForMood(prompt: string, mood: string): string {
    const toneAdjustments: Record<string, string> = {
      'positive': '\n\n追加指示: 明るく前向きなトーンを維持してください。',
      'negative': '\n\n追加指示: 特に共感的で優しいトーンで応答してください。',
      'neutral': '\n\n追加指示: バランスの取れた落ち着いたトーンで応答してください。',
      'anxious': '\n\n追加指示: 安心感を与える穏やかなトーンで応答してください。',
      'excited': '\n\n追加指示: エネルギッシュで励ましのあるトーンで応答してください。'
    }
    
    return prompt + (toneAdjustments[mood] || '')
  }
  
  /**
   * プロンプトのスコアを計算
   */
  private calculatePromptScore(
    prompt: string,
    template: PromptTemplate
  ): number {
    let score = template.effectiveness
    
    // 明確性スコア
    const hasClearInstructions = prompt.includes('役割:') || prompt.includes('ガイドライン')
    if (hasClearInstructions) score += 0.05
    
    // 具体性スコア
    const hasSpecificContext = !prompt.includes('{') // 全ての変数が置換されている
    if (hasSpecificContext) score += 0.05
    
    // 長さの適切性
    const idealLength = 500
    const lengthDiff = Math.abs(prompt.length - idealLength) / idealLength
    score -= lengthDiff * 0.1
    
    return Math.max(0, Math.min(1, score))
  }
  
  /**
   * チェーンオブソート（Chain of Thought）プロンプトを生成
   */
  generateChainOfThought(task: string, context: string): string {
    return `タスク: ${task}

ステップバイステップで考えてみましょう：

1. 状況の理解
   - 現在の文脈: ${context}
   - 解決すべき課題は何か？

2. 可能なアプローチの検討
   - どのような方法が考えられるか？
   - それぞれの長所と短所は？

3. 最適な解決策の選択
   - なぜこのアプローチが最適か？
   - 期待される結果は？

4. 実行計画
   - 具体的にどのように進めるか？
   - 注意すべき点は？

5. 結論と提案
   - 最終的な回答
   - 追加の考慮事項

では、順番に考えていきましょう：`
  }
  
  /**
   * Few-shotラーニング用のプロンプトを生成
   */
  generateFewShotPrompt(
    task: string,
    examples: Array<{ input: string; output: string }>
  ): string {
    const exampleText = examples
      .map((ex, idx) => `例${idx + 1}:\n入力: ${ex.input}\n出力: ${ex.output}`)
      .join('\n\n')
    
    return `以下の例を参考に、同様のタスクを実行してください。

${exampleText}

では、以下の入力に対して同様に処理してください：
入力: ${task}
出力:`
  }
  
  /**
   * パフォーマンス統計を取得
   */
  getPerformanceStats(): {
    averageScore: number
    totalOptimizations: number
    topImprovements: string[]
  } {
    if (this.performanceHistory.length === 0) {
      return {
        averageScore: 0,
        totalOptimizations: 0,
        topImprovements: []
      }
    }
    
    const averageScore = this.performanceHistory.reduce(
      (sum, result) => sum + result.score, 0
    ) / this.performanceHistory.length
    
    const allImprovements = this.performanceHistory
      .flatMap(result => result.improvements)
    
    const improvementCounts = new Map<string, number>()
    allImprovements.forEach(imp => {
      improvementCounts.set(imp, (improvementCounts.get(imp) || 0) + 1)
    })
    
    const topImprovements = Array.from(improvementCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([improvement]) => improvement)
    
    return {
      averageScore,
      totalOptimizations: this.performanceHistory.length,
      topImprovements
    }
  }
}

// シングルトンインスタンス
export const promptOptimizer = new PromptOptimizer()

export default promptOptimizer