/**
 * 環境設定の自動判定
 * ローカル開発: APIキー使用可能
 * 本番環境: デモモード強制
 */

export type AppMode = 'development' | 'demo' | 'production'

// 環境判定
export function getAppMode(): AppMode {
  // Vercelなどの本番環境
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return 'demo'
  }
  
  // APIキーが設定されている開発環境
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'demo-key-for-testing') {
    return 'development'
  }
  
  // その他はデモモード
  return 'demo'
}

// 設定値
export const config = {
  mode: getAppMode(),
  
  // API設定
  api: {
    useRealAPI: getAppMode() === 'development',
    openaiKey: process.env.OPENAI_API_KEY,
    googleKey: process.env.GOOGLE_API_KEY,
  },
  
  // レート制限
  rateLimit: {
    enabled: getAppMode() !== 'development',
    maxRequestsPerHour: 100,
    maxRequestsPerDay: 500,
  },
  
  // データ永続化
  database: {
    enabled: getAppMode() === 'development',
    url: process.env.DATABASE_URL,
  },
  
  // 機能フラグ
  features: {
    realTimeAI: getAppMode() === 'development',
    dataExport: getAppMode() === 'development',
    advancedAnalytics: getAppMode() === 'development',
    wandb: getAppMode() === 'development' && process.env.WANDB_API_KEY,
  },
  
  // UI表示
  ui: {
    showDemoNotice: getAppMode() === 'demo',
    showDevTools: getAppMode() === 'development',
  }
}

// モード別メッセージ
export const getModeMessage = () => {
  switch (config.mode) {
    case 'development':
      return '🚀 開発モード: フル機能が利用可能です'
    case 'demo':
      return '🎭 デモモード: 安全な体験版です'
    case 'production':
      return '✨ 本番モード'
    default:
      return ''
  }
}