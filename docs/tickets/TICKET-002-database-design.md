# TICKET-002: データベース設計とセットアップ

## チケット情報
- **ID**: TICKET-002
- **タイプ**: タスク
- **優先度**: 高
- **ステータス**: 未着手
- **担当者**: -
- **作成日**: 2024-09-04
- **更新日**: 2024-09-04

## 概要
日記データ、画像、マインドマップのノード情報を効率的に保存するためのデータベース設計。

## 詳細説明
テキストデータと画像データを同一DBで管理し、日記エントリー、質問ノード、回答履歴、感情分析結果などを構造化して保存する。

## タスク一覧
- [ ] データベース選定（PostgreSQL推奨）
- [ ] ERD（エンティティ関係図）の作成
- [ ] スキーマ設計
- [ ] マイグレーションファイルの作成
- [ ] 画像保存戦略の決定（DB内BLOB vs 外部ストレージ参照）
- [ ] インデックス設計
- [ ] バックアップ戦略の策定

## 技術仕様
### 主要テーブル
```sql
-- ユーザー
users
- id (UUID)
- email
- username
- created_at
- updated_at

-- 日記エントリー
diary_entries
- id (UUID)
- user_id (FK)
- content (TEXT)
- created_at
- entry_date
- updated_at

-- 画像
images
- id (UUID)
- diary_entry_id (FK)
- image_data (BYTEA) または image_url (TEXT)
- thumbnail_data
- mime_type
- created_at

-- マインドマップノード
mindmap_nodes
- id (UUID)
- diary_entry_id (FK)
- parent_node_id (FK, nullable)
- node_type (ENUM: 'diary', 'question', 'answer')
- content (TEXT)
- position_x
- position_y
- created_at
- answered_at (nullable)

-- 感情分析結果
emotion_analyses
- id (UUID)
- diary_entry_id (FK)
- emotion_type (ENUM)
- score (FLOAT)
- color_code
- analyzed_at

-- 単語頻度
word_frequencies
- id (UUID)
- user_id (FK)
- word (TEXT)
- frequency (INTEGER)
- period_type (ENUM: 'daily', 'monthly', 'yearly')
- period_date
```

## 受け入れ条件
- [ ] 全テーブルが正しく作成される
- [ ] リレーションが適切に設定される
- [ ] パフォーマンステストが完了
- [ ] バックアップ・リストアが機能する

## 関連チケット
- TICKET-003: バックエンドAPI基盤構築
- TICKET-010: 画像アップロード機能

## 備考
画像データは初期はDBに直接保存し、スケール時に外部ストレージへの移行を検討。