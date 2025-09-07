# TICKET-016: 自己PR・経歴書生成機能

## チケット情報
- **ID**: TICKET-016
- **タイプ**: 機能
- **優先度**: 低
- **ステータス**: 未着手
- **担当者**: -
- **作成日**: 2024-09-04
- **更新日**: 2024-09-04

## 概要
過去の日記データから自己PRや経歴書を自動生成する機能。

## 詳細説明
蓄積された日記データを分析し、ユーザーの強み、成長、実績、価値観を抽出。転職やキャリアチェンジの際に活用できる自己PR文や経歴書を生成。

## タスク一覧
### データ分析
- [ ] 成果・実績の抽出
- [ ] スキルの識別
- [ ] 成長エピソードの発見
- [ ] 価値観の分析

### 文書生成
- [ ] 自己PRテンプレート
- [ ] 経歴書フォーマット
- [ ] 志望動機生成
- [ ] 強みの言語化

### カスタマイズ
- [ ] 業界別調整
- [ ] 職種別最適化
- [ ] トーン調整
- [ ] 長さ調整

## 技術仕様
### 実績抽出アルゴリズム
```typescript
interface Achievement {
  date: Date
  category: string
  description: string
  impact: string
  skills: string[]
  quantifiableResult?: string
}

const extractAchievements = async (
  diaries: DiaryEntry[]
): Promise<Achievement[]> => {
  const prompt = `
以下の日記エントリーから、仕事や個人的な成果・実績を抽出してください。

日記内容:
${diaries.map(d => d.content).join('\n---\n')}

以下の観点で分析してください：
1. 達成した目標や成果
2. 克服した課題
3. 学んだスキル
4. リーダーシップの発揮
5. 創造的な解決策
6. 数値化可能な結果

JSON形式で出力してください。
`

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "system", content: prompt }],
    response_format: { type: "json_object" }
  })
  
  return JSON.parse(response.choices[0].message.content).achievements
}
```

### 自己PR生成
```typescript
const generateSelfPR = async (
  profile: UserProfile,
  achievements: Achievement[],
  targetJob?: JobDescription
): Promise<string> => {
  // 強みの分析
  const strengths = analyzeStrengths(achievements)
  
  // エピソードの選定
  const topEpisodes = selectBestEpisodes(achievements, targetJob)
  
  const prompt = `
以下の情報を基に、説得力のある自己PRを作成してください。

## ユーザー情報
- 価値観: ${profile.values}
- 強み: ${strengths.join(', ')}
- 目標: ${profile.goals}

## 主要な実績
${topEpisodes.map(e => `- ${e.description}`).join('\n')}

## 要件
- 文字数: 400-600文字
- トーン: プロフェッショナルかつ誠実
- 構成: 結論 → 根拠エピソード → 今後の貢献

${targetJob ? `## 応募先情報\n${targetJob.description}` : ''}
`

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "system", content: prompt }],
    temperature: 0.7
  })
  
  return response.choices[0].message.content
}
```

### UIコンポーネント
```tsx
const SelfPRGenerator = () => {
  const [period, setPeriod] = useState<DateRange>()
  const [targetJob, setTargetJob] = useState('')
  const [generatedPR, setGeneratedPR] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  
  const generatePR = async () => {
    setIsGenerating(true)
    
    // 1. 期間内の日記を取得
    const diaries = await fetchDiaries(period)
    
    // 2. 実績を抽出
    const achievements = await extractAchievements(diaries)
    
    // 3. 自己PRを生成
    const pr = await generateSelfPR(
      userProfile,
      achievements,
      targetJob ? { description: targetJob } : undefined
    )
    
    setGeneratedPR(pr)
    setIsGenerating(false)
  }
  
  return (
    <div className="self-pr-generator">
      <h2>自己PR生成</h2>
      
      <DateRangePicker 
        value={period}
        onChange={setPeriod}
        label="分析期間"
      />
      
      <TextArea
        value={targetJob}
        onChange={setTargetJob}
        placeholder="応募先の求人情報（任意）"
      />
      
      <Button 
        onClick={generatePR}
        loading={isGenerating}
      >
        自己PR生成
      </Button>
      
      {generatedPR && (
        <div className="generated-pr">
          <EditableText value={generatedPR} />
          <CopyButton text={generatedPR} />
          <ExportOptions formats={['pdf', 'docx', 'txt']} />
        </div>
      )}
    </div>
  )
}
```

### 経歴書フォーマット
```typescript
interface Resume {
  personalInfo: {
    name: string
    email: string
    phone?: string
  }
  summary: string
  experience: Array<{
    period: string
    title: string
    description: string
    achievements: string[]
  }>
  skills: string[]
  education: Array<{
    period: string
    institution: string
    degree: string
  }>
}

const generateResume = async (
  diaries: DiaryEntry[],
  profile: UserProfile
): Promise<Resume> => {
  // 日記から経歴情報を構築
  const experiences = await extractExperiences(diaries)
  const skills = await extractSkills(diaries)
  
  return {
    personalInfo: profile.personalInfo,
    summary: await generateProfessionalSummary(profile, experiences),
    experience: experiences,
    skills: skills,
    education: profile.education
  }
}
```

## 受け入れ条件
- [ ] 自己PRが生成される
- [ ] 実績が正しく抽出される
- [ ] カスタマイズが可能
- [ ] 複数フォーマットで出力
- [ ] 編集機能が動作

## 関連チケット
- TICKET-009: AI相談モード
- TICKET-006: AI機能統合とAPI設定

## 備考
生成された文書は必ず人間がレビュー・編集することを推奨。