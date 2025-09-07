const dotenv = require('dotenv')
dotenv.config()

async function testWandBConnection() {
  console.log('Testing W&B connection...')
  console.log('=====================================')
  
  // Check environment variables
  const hasApiKey = !!process.env.WANDB_API_KEY
  const hasEntity = !!process.env.WANDB_ENTITY
  const project = process.env.WANDB_PROJECT || 'ai-diary-app'
  
  console.log('Environment check:')
  console.log(`- API Key: ${hasApiKey ? '✓ Found' : '✗ Not found'}`)
  console.log(`- Entity: ${hasEntity ? '✓ ' + process.env.WANDB_ENTITY : '⚠ Not set (will use default)'}`)
  console.log(`- Project: ${project}`)
  console.log('')
  
  if (!hasApiKey) {
    console.error('Error: WANDB_API_KEY not found in .env file')
    console.log('Please add your W&B API key to the .env file')
    process.exit(1)
  }
  
  try {
    const wandb = require('@wandb/sdk').default
    
    // Initialize W&B - Try with default project first
    console.log('Initializing W&B...')
    console.log('Note: If this is your first time, the project will be created automatically.')
    
    await wandb.init({
      project: 'ai-diary-app',  // Use a simpler project name
      // entity: process.env.WANDB_ENTITY,  // Entityを省略（デフォルトユーザーを使用）
      name: 'test-connection',
      config: {
        test: true,
        timestamp: new Date().toISOString()
      }
    })
    
    // Log a test metric
    console.log('Logging test metric...')
    wandb.log({
      test_metric: Math.random() * 100,
      connection_test: 'successful'
    })
    
    // Finish the run
    await wandb.finish()
    
    console.log('')
    console.log('✓ W&B connection test successful!')
    console.log(`View your run at: https://wandb.ai/${process.env.WANDB_ENTITY || 'your-entity'}/${project}`)
    
  } catch (error) {
    console.error('Error connecting to W&B:', error.message)
    console.log('')
    console.log('Troubleshooting tips:')
    console.log('1. Check your internet connection')
    console.log('2. Verify your API key is correct')
    console.log('3. Try running: wandb login <your-api-key>')
    process.exit(1)
  }
}

testWandBConnection()