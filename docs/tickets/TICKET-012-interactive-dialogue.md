# TICKET-012: 対話型日記入力モード

## チケット情報
- **ID**: TICKET-012
- **タイプ**: 機能
- **優先度**: 高
- **ステータス**: 未着手
- **担当者**: -
- **作成日**: 2024-09-04
- **更新日**: 2024-09-04

## 概要
AIが対話的に質問しながら、ユーザーの1日を振り返る手助けをする機能。

## 詳細説明
日記を書く習慣がない人でも使いやすいよう、AIが「今日はどんな一日でしたか？」などの質問を投げかけ、回答を基に追加質問を生成。最終的に対話内容から日記を自動生成。

## タスク一覧
### UI実装
- [ ] 対話インターフェースの作成
- [ ] チャットバブルUI
- [ ] 入力フォーム
- [ ] モード切り替えボタン

### 対話フロー
- [ ] 初期質問テンプレート
- [ ] 文脈に応じた追加質問生成
- [ ] 対話の終了判定
- [ ] 日記への変換ロジック

### AI統合
- [ ] 質問生成プロンプト
- [ ] 回答分析
- [ ] 感情認識
- [ ] 記憶の深掘り

## 技術仕様
### 対話フロー管理
```typescript
interface DialogueState {
  mode: 'greeting' | 'exploring' | 'deepening' | 'closing'
  messages: Message[]
  extractedTopics: string[]
  emotionalTone: EmotionType
}

const dialogueFlow = {
  greeting: [
    "今日はどんな一日でしたか？",
    "今日一番印象に残った出来事は何ですか？",
    "今日の気分を一言で表すとどんな感じですか？"
  ],
  exploring: [
    "それについてもう少し詳しく教えていただけますか？",
    "その時、どんな気持ちでしたか？",
    "誰と一緒でしたか？"
  ],
  deepening: [
    "なぜそう感じたと思いますか？",
    "それは以前の経験と何か関係がありますか？",
    "今後同じような状況ではどうしたいですか？"
  ],
  closing: [
    "今日一日を振り返ってみて、何か気づいたことはありますか？",
    "明日はどんな一日にしたいですか？"
  ]
}
```

### AI質問生成
```typescript
const generateFollowUpQuestion = async (
  userResponse: string,
  context: DialogueState
) => {
  const prompt = `
ユーザーの回答: ${userResponse}
これまでの文脈: ${JSON.stringify(context.messages)}
抽出されたトピック: ${context.extractedTopics}

この回答を踏まえて、ユーザーの記憶や感情をより深く引き出すための
自然な追加質問を1つ生成してください。
質問は共感的で、押し付けがましくないものにしてください。
`

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "system", content: prompt }],
    temperature: 0.7
  })

  return response.choices[0].message.content
}
```

### 日記生成
```typescript
const generateDiaryFromDialogue = async (
  dialogue: Message[]
): Promise<string> => {
  const prompt = `
以下の対話から、一人称の日記を生成してください。

対話内容:
${dialogue.map(m => `${m.role}: ${m.content}`).join('\n')}

要件:
- 自然な日記形式で書く
- 重要な出来事と感情を含める
- 時系列を整理する
- 500-1000文字程度
`

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "system", content: prompt }]
  })

  return response.choices[0].message.content
}
```

### UIコンポーネント
```tsx
const InteractiveDialogue = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isAITyping, setIsAITyping] = useState(false)

  return (
    <div className="dialogue-container">
      <div className="chat-window">
        {messages.map((msg, i) => (
          <ChatBubble 
            key={i}
            message={msg}
            isAI={msg.role === 'ai'}
          />
        ))}
        {isAITyping && <TypingIndicator />}
      </div>
      
      <MessageInput 
        onSend={handleUserMessage}
        placeholder="回答を入力..."
      />
      
      <button onClick={finishDialogue}>
        日記として保存
      </button>
    </div>
  )
}
```

## 受け入れ条件
- [ ] 自然な対話が可能
- [ ] 文脈を理解した質問生成
- [ ] 対話から日記が生成される
- [ ] モード切り替えがスムーズ
- [ ] 対話履歴が保存される

## 関連チケット
- TICKET-004: 日記入力機能の実装
- TICKET-006: AI機能統合とAPI設定

## 備考
質問は押し付けがましくならないよう、スキップ機能も実装。