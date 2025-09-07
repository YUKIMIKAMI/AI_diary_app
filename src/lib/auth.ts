// 仮の認証処理（開発用）
// TODO: TICKET-013で本格的な認証システムを実装

export async function getCurrentUser() {
  // 開発環境では固定のテストユーザーを返す
  if (process.env.NODE_ENV === 'development') {
    return {
      id: 'test-user-001',
      email: 'test@example.com',
      username: 'テストユーザー',
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