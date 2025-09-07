import * as dotenv from 'dotenv'

dotenv.config()

interface WandbConfig {
  apiKey: string | undefined
  project: string
  entity: string | undefined
}

export const wandbConfig: WandbConfig = {
  apiKey: process.env.WANDB_API_KEY,
  project: process.env.WANDB_PROJECT || 'ai-diary-app',
  entity: undefined,  // Entityを使用しない（デフォルトユーザーを使用）
}

export const initWandb = async () => {
  if (!wandbConfig.apiKey) {
    console.warn('W&B API key not found. Metrics will not be tracked.')
    return null
  }

  try {
    const wandb = await import('@wandb/sdk').then(m => m.default)
    
    await wandb.init({
      project: wandbConfig.project,
      entity: wandbConfig.entity,
      config: {
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version,
      },
    })
    
    console.log('W&B initialized successfully')
    return wandb
  } catch (error) {
    console.error('Failed to initialize W&B:', error)
    return null
  }
}

export const logMetric = async (name: string, value: number, metadata?: Record<string, any>) => {
  try {
    const wandb = await import('@wandb/sdk').then(m => m.default)
    wandb.log({
      [name]: value,
      ...metadata,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to log metric to W&B:', error)
  }
}