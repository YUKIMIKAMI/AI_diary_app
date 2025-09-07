// 仮の認証処理（開発用）
// TODO: TICKET-013で本格的な認証システムを実装

export async function getCurrentUser() {
  // デモモードまたは開発環境では固定のテストユーザーを返す
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || process.env.NODE_ENV === 'development') {
    return {
      id: 'demo-user-001',
      email: 'demo@example.com',
      username: 'デモユーザー',
    }
  }
  
  return null
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('認証が必要です')
  }
  return user
}