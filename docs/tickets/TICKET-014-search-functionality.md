# TICKET-014: 検索機能

## チケット情報
- **ID**: TICKET-014
- **タイプ**: 機能
- **優先度**: 中
- **ステータス**: 未着手
- **担当者**: -
- **作成日**: 2024-09-04
- **更新日**: 2024-09-04

## 概要
過去の日記、マインドマップノード、画像を横断的に検索する機能。

## 詳細説明
マインドマップページやその他のビューで、キーワード、日付、感情、タグなどで過去のコンテンツを検索。

## タスク一覧
### 検索エンジン
- [ ] 全文検索の実装
- [ ] インデックス作成
- [ ] 検索クエリパーサー
- [ ] 検索結果のランキング

### フィルター機能
- [ ] 日付範囲フィルター
- [ ] カテゴリーフィルター
- [ ] 感情スコアフィルター
- [ ] タグフィルター

### UI実装
- [ ] 検索バー
- [ ] フィルターパネル
- [ ] 検索結果表示
- [ ] ハイライト機能

## 技術仕様
### 全文検索実装
```typescript
// PostgreSQL全文検索
const searchDiaries = async (query: string, filters?: SearchFilters) => {
  const sql = `
    SELECT 
      d.*,
      ts_rank(to_tsvector('japanese', content), query) AS rank,
      ts_headline('japanese', content, query, 
        'StartSel=<mark>, StopSel=</mark>, MaxWords=50'
      ) AS highlighted_content
    FROM diary_entries d,
      to_tsquery('japanese', $1) query
    WHERE 
      to_tsvector('japanese', content) @@ query
      ${filters?.dateFrom ? 'AND entry_date >= $2' : ''}
      ${filters?.dateTo ? 'AND entry_date <= $3' : ''}
      ${filters?.emotion ? 'AND emotion_score = $4' : ''}
    ORDER BY rank DESC
    LIMIT 20
  `
  
  return await db.query(sql, [query, ...Object.values(filters)])
}

// Elasticsearchオプション
import { Client } from '@elastic/elasticsearch'

const client = new Client({ node: 'http://localhost:9200' })

const searchWithElastic = async (query: string) => {
  const result = await client.search({
    index: 'diaries',
    body: {
      query: {
        multi_match: {
          query: query,
          fields: ['content', 'tags', 'title'],
          type: 'best_fields',
          fuzziness: 'AUTO'
        }
      },
      highlight: {
        fields: {
          content: {}
        }
      }
    }
  })
  
  return result.body.hits
}
```

### フロントエンド検索UI
```tsx
const SearchInterface = () => {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({})
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  
  const performSearch = useDebounce(async () => {
    setIsSearching(true)
    const data = await searchAPI(query, filters)
    setResults(data)
    setIsSearching(false)
  }, 300)
  
  return (
    <div className="search-container">
      <SearchBar 
        value={query}
        onChange={setQuery}
        onSearch={performSearch}
        placeholder="日記を検索..."
      />
      
      <FilterPanel 
        filters={filters}
        onChange={setFilters}
      />
      
      <SearchResults 
        results={results}
        isLoading={isSearching}
        renderResult={(result) => (
          <DiaryCard 
            {...result}
            highlightedContent={result.highlighted_content}
          />
        )}
      />
    </div>
  )
}
```

### 検索インデックス
```sql
-- 全文検索用インデックス
CREATE INDEX idx_diary_content_gin 
ON diary_entries 
USING gin(to_tsvector('japanese', content));

-- 複合インデックス
CREATE INDEX idx_diary_search 
ON diary_entries(entry_date DESC, user_id)
WHERE deleted_at IS NULL;
```

## 受け入れ条件
- [ ] キーワード検索が機能
- [ ] 日本語検索に対応
- [ ] 検索結果のハイライト
- [ ] フィルターが正しく動作
- [ ] 高速な検索（< 1秒）

## 関連チケット
- TICKET-005: マインドマップページの実装
- TICKET-004: 日記入力機能の実装

## 備考
将来的にはAIベースのセマンティック検索も実装予定。