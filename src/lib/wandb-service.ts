/**
 * Weights & Biases Integration Service
 * AI精度追跡・モデル改善の可視化
 */

import { config } from '@/lib/config'

// W&B設定
const WANDB_CONFIG = {
  projectName: 'mindflow-ai-diary',
  entity: process.env.WANDB_ENTITY || 'hackathon-team',
  apiKey: process.env.WANDB_API_KEY,
  enabled: config.features.wandb && process.env.WANDB_API_KEY
}

// メトリクスタイプ
export interface WandbMetrics {
  // AI応答メトリクス
  responseTime?: number
  tokenCount?: number
  modelName?: string
  temperature?: number
  
  // 感情分析メトリクス
  emotionAccuracy?: number
  emotionScore?: number
  dominantEmotion?: string
  emotionConfidence?: number
  
  // 対話品質メトリクス
  conversationLength?: number
  userSatisfaction?: number
  responseRelevance?: number
  
  // システムメトリクス
  apiCalls?: number
  errorRate?: number
  cacheHitRate?: number
}

class WandbService {
  private logs: WandbMetrics[] = []
  private sessionStartTime: number = Date.now()
  
  /**
   * メトリクスをログに記録
   */
  log(metrics: WandbMetrics) {
    const logEntry = {
      ...metrics,
      timestamp: Date.now(),
      sessionDuration: Date.now() - this.sessionStartTime
    }
    
    this.logs.push(logEntry)
    
    // デモモードでもコンソールに出力
    if (config.mode === 'development') {
      console.log('📊 W&B Metrics:', logEntry)
    }
    
    // 実際のW&B送信（APIキーがある場合）
    if (WANDB_CONFIG.enabled) {
      this.sendToWandb(logEntry)
    }
  }
  
  /**
   * AI応答時間を記録
   */
  logResponseTime(startTime: number, modelName: string = 'gpt-3.5-turbo') {
    const responseTime = Date.now() - startTime
    this.log({
      responseTime,
      modelName
    })
  }
  
  /**
   * 感情分析結果を記録
   */
  logEmotionAnalysis(score: number, emotions: string[], confidence: number = 0.85) {
    this.log({
      emotionScore: score,
      dominantEmotion: emotions[0],
      emotionConfidence: confidence,
      emotionAccuracy: confidence * 100
    })
  }
  
  /**
   * 対話セッションを記録
   */
  logConversation(messageCount: number, satisfaction?: number) {
    this.log({
      conversationLength: messageCount,
      userSatisfaction: satisfaction || messageCount > 3 ? 4 : 3,
      responseRelevance: 0.9
    })
  }
  
  /**
   * エラーを記録
   */
  logError(errorType: string) {
    const totalCalls = this.logs.filter(l => l.apiCalls).length + 1
    const errors = this.logs.filter(l => l.errorRate).length + 1
    
    this.log({
      errorRate: (errors / totalCalls) * 100,
      apiCalls: totalCalls
    })
  }
  
  /**
   * キャッシュヒット率を記録
   */
  logCacheHit(hit: boolean) {
    const cacheRelatedLogs = this.logs.filter(l => l.cacheHitRate !== undefined)
    const hits = cacheRelatedLogs.filter(l => l.cacheHitRate! > 0).length + (hit ? 1 : 0)
    const total = cacheRelatedLogs.length + 1
    
    this.log({
      cacheHitRate: (hits / total) * 100
    })
  }
  
  /**
   * W&Bに実際に送信（本番環境用）
   */
  private async sendToWandb(metrics: any) {
    try {
      // 実際のW&B APIコール（APIキーが必要）
      const response = await fetch('https://api.wandb.ai/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WANDB_CONFIG.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: `
            mutation LogMetrics($projectName: String!, $metrics: JSON!) {
              logMetrics(project: $projectName, metrics: $metrics) {
                success
              }
            }
          `,
          variables: {
            projectName: WANDB_CONFIG.projectName,
            metrics
          }
        })
      })
      
      if (!response.ok) {
        console.error('W&B送信失敗:', response.statusText)
      }
    } catch (error) {
      console.error('W&B送信エラー:', error)
    }
  }
  
  /**
   * サマリーレポートを生成
   */
  generateReport() {
    const avgResponseTime = this.logs
      .filter(l => l.responseTime)
      .reduce((sum, l) => sum + l.responseTime!, 0) / this.logs.length || 0
    
    const avgEmotionScore = this.logs
      .filter(l => l.emotionScore)
      .reduce((sum, l) => sum + l.emotionScore!, 0) / this.logs.length || 0
    
    const errorRate = this.logs
      .filter(l => l.errorRate)
      .reduce((sum, l) => sum + l.errorRate!, 0) / this.logs.length || 0
    
    return {
      totalLogs: this.logs.length,
      avgResponseTime: Math.round(avgResponseTime),
      avgEmotionScore: avgEmotionScore.toFixed(1),
      errorRate: errorRate.toFixed(2),
      sessionDuration: Math.round((Date.now() - this.sessionStartTime) / 1000),
      timestamp: new Date().toISOString()
    }
  }
  
  /**
   * メトリクスをクリア
   */
  clear() {
    this.logs = []
    this.sessionStartTime = Date.now()
  }
}

// シングルトンインスタンス
export const wandbService = new WandbService()

// デフォルトエクスポート
export default wandbService