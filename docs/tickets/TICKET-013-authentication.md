# TICKET-013: 認証・認可システム

## チケット情報
- **ID**: TICKET-013
- **タイプ**: 機能
- **優先度**: 高
- **ステータス**: 未着手
- **担当者**: -
- **作成日**: 2024-09-04
- **更新日**: 2024-09-04

## 概要
ユーザー認証と認可システムの実装。JWT、リフレッシュトークン、セキュアなセッション管理。

## 詳細説明
プライバシー重視のアプリケーションとして、強固な認証システムを実装。将来的にはMFA（多要素認証）にも対応。

## タスク一覧
### 基本認証
- [ ] ユーザー登録機能
- [ ] ログイン/ログアウト
- [ ] パスワードリセット
- [ ] メール認証

### セキュリティ
- [ ] パスワードハッシング（bcrypt）
- [ ] JWT実装
- [ ] リフレッシュトークン
- [ ] CSRF対策

### セッション管理
- [ ] トークン有効期限管理
- [ ] 自動ログアウト
- [ ] デバイス管理
- [ ] ログイン履歴

## 技術仕様
### 認証フロー
```typescript
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// パスワードハッシング
const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

// JWT生成
const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  )
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.REFRESH_SECRET,
    { expiresIn: '7d' }
  )
  
  return { accessToken, refreshToken }
}

// 認証ミドルウェア
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' })
    }
    return res.status(403).json({ error: 'Invalid token' })
  }
}
```

### フロントエンド認証
```typescript
// 認証コンテキスト
import { createContext, useContext } from 'react'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [tokens, setTokens] = useState(null)
  
  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
    
    const data = await response.json()
    setTokens(data.tokens)
    setUser(data.user)
    
    // トークンを安全に保存
    localStorage.setItem('refreshToken', data.tokens.refreshToken)
  }
  
  // 自動トークン更新
  useEffect(() => {
    const interval = setInterval(async () => {
      if (tokens?.refreshToken) {
        await refreshToken()
      }
    }, 14 * 60 * 1000) // 14分ごと
    
    return () => clearInterval(interval)
  }, [tokens])
}
```

### データベース
```sql
-- ユーザーテーブル
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100),
  password_hash VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- セッションテーブル
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  refresh_token VARCHAR(500) UNIQUE NOT NULL,
  device_info JSONB,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ログイン履歴
CREATE TABLE login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  login_at TIMESTAMP DEFAULT NOW()
);
```

## 受け入れ条件
- [ ] 安全なユーザー登録・ログイン
- [ ] トークンの自動更新
- [ ] パスワードリセット機能
- [ ] セッションタイムアウト
- [ ] ログイン履歴の記録

## 関連チケット
- TICKET-011: バックエンドAPI基盤構築
- TICKET-003: フロントエンド基盤構築

## 備考
将来的にOAuth（Google、GitHub）やMFA実装を検討。