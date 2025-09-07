# TICKET-009: AI相談モード（過去の自分との対話）

## チケット情報
- **ID**: TICKET-009
- **タイプ**: 機能
- **優先度**: 高
- **ステータス**: 未着手
- **担当者**: -
- **作成日**: 2024-09-04
- **更新日**: 2024-09-04

## 概要
過去の日記データを学習したAIが、ユーザー自身以上に詳しい相談相手として機能する対話システム。

## 詳細説明
ChatGPTのような対話インターフェースで、過去の日記、画像、感情データを基に、パーソナライズされたアドバイスや洞察を提供。

## タスク一覧
### データ準備
- [ ] 過去の日記のベクトル化
- [ ] 画像キャプション生成
- [ ] コンテキスト検索システム
- [ ] ユーザープロファイル生成

### 対話システム
- [ ] チャット UI の実装
- [ ] メッセージ履歴管理
- [ ] ストリーミングレスポンス
- [ ] タイピングインジケーター

### AI機能
- [ ] RAG（Retrieval-Augmented Generation）実装
- [ ] パーソナライズされたプロンプト生成
- [ ] 関連する過去の日記の検索
- [ ] コンテキスト管理

### 分析機能
- [ ] パターン認識
- [ ] 行動傾向の分析
- [ ] 成長の可視化
- [ ] アドバイス生成

## 技術仕様
### RAGアーキテクチャ
```typescript
// ベクトルデータベース設定
import { Pinecone } from '@pinecone-database/pinecone'

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
  environment: 'production'
})

// 日記の埋め込みベクトル生成
const embedDiary = async (text: string) => {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text
  })
  return response.data[0].embedding
}

// 関連する過去の日記を検索
const searchRelevantDiaries = async (query: string, top_k = 5) => {
  const queryEmbedding = await embedDiary(query)
  const results = await pinecone.query({
    vector: queryEmbedding,
    topK: top_k,
    includeMetadata: true
  })
  return results
}
```

### 対話コンポーネント
```tsx
interface ConsultationChat {
  messages: Message[]
  userProfile: UserProfile
  relevantDiaries: DiaryEntry[]
}

const ConsultationMode = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)

  const handleSendMessage = async (content: string) => {
    // 1. 関連する過去の日記を検索
    const relevantDiaries = await searchRelevantDiaries(content)
    
    // 2. コンテキストを含むプロンプトを生成
    const prompt = generateContextualPrompt(content, relevantDiaries)
    
    // 3. AIレスポンスを生成
    const response = await generateAIResponse(prompt)
    
    // 4. ストリーミングで表示
    streamResponse(response)
  }
}
```

### プロンプトテンプレート
```typescript
const consultationPrompt = `
あなたは{user_name}さんの過去の日記を全て理解している相談相手です。

## ユーザープロファイル
{user_profile}

## 関連する過去の日記
{relevant_diaries}

## 過去の傾向
- よく使う言葉: {frequent_words}
- 感情パターン: {emotion_patterns}
- 関心事: {interests}

## 質問
{user_question}

ユーザーの過去の経験や感情パターンを踏まえて、
共感的かつ建設的なアドバイスを提供してください。
`
```

## 受け入れ条件
- [ ] 過去の日記を参照した回答が生成される
- [ ] 自然な対話が可能
- [ ] レスポンスが高速（3秒以内）
- [ ] 個人情報のプライバシーが保護される
- [ ] 対話履歴が保存される

## 関連チケット
- TICKET-006: AI機能統合とAPI設定
- TICKET-010: ベクトルデータベース設定
- TICKET-016: 自己PR生成機能

## 備考
プライバシー保護のため、全データはローカルまたはユーザー専用の暗号化領域に保存。