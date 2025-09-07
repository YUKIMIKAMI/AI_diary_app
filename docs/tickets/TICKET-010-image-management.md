# TICKET-010: 画像管理機能

## チケット情報
- **ID**: TICKET-010
- **タイプ**: 機能
- **優先度**: 中
- **ステータス**: 未着手
- **担当者**: -
- **作成日**: 2024-09-04
- **更新日**: 2024-09-04

## 概要
日記に添付する画像のアップロード、保存、表示機能の実装。

## 詳細説明
ユーザーが日記に画像を添付できるようにし、画像はテキストと同じデータベースに保存。サムネイル生成や圧縮も実装。

## タスク一覧
### アップロード機能
- [ ] ドラッグ&ドロップ対応
- [ ] ファイル選択ダイアログ
- [ ] 複数画像の同時アップロード
- [ ] プログレスバー表示

### 画像処理
- [ ] 画像圧縮（品質維持）
- [ ] サムネイル生成
- [ ] EXIF情報の削除（プライバシー）
- [ ] 形式変換（WebP対応）

### 保存機能
- [ ] データベースへの保存
- [ ] メタデータ管理
- [ ] 画像URLの生成
- [ ] CDN配信対応

### 表示機能
- [ ] インライン表示
- [ ] ライトボックス表示
- [ ] レイジーローディング
- [ ] レスポンシブ対応

## 技術仕様
### 画像処理ライブラリ
```typescript
import sharp from 'sharp'

// 画像圧縮とサムネイル生成
const processImage = async (buffer: Buffer) => {
  // オリジナル画像の圧縮
  const compressed = await sharp(buffer)
    .jpeg({ quality: 85 })
    .resize(1920, 1920, { 
      fit: 'inside', 
      withoutEnlargement: true 
    })
    .toBuffer()

  // サムネイル生成
  const thumbnail = await sharp(buffer)
    .resize(300, 300, { fit: 'cover' })
    .jpeg({ quality: 70 })
    .toBuffer()

  return { compressed, thumbnail }
}

// EXIF削除
const removeExif = async (buffer: Buffer) => {
  return await sharp(buffer)
    .rotate() // 自動回転
    .withMetadata({
      orientation: undefined // EXIF削除
    })
    .toBuffer()
}
```

### アップロードコンポーネント
```tsx
import { useDropzone } from 'react-dropzone'

const ImageUploader = ({ onUpload }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: async (acceptedFiles) => {
      const processedImages = await Promise.all(
        acceptedFiles.map(file => processAndUpload(file))
      )
      onUpload(processedImages)
    }
  })

  return (
    <div {...getRootProps()} className="dropzone">
      <input {...getInputProps()} />
      {isDragActive ? 
        <p>画像をドロップしてください...</p> : 
        <p>画像をドラッグ&ドロップまたはクリックして選択</p>
      }
    </div>
  )
}
```

### データベース構造
```sql
-- 画像テーブル
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diary_entry_id UUID REFERENCES diary_entries(id) ON DELETE CASCADE,
  original_data BYTEA,
  compressed_data BYTEA,
  thumbnail_data BYTEA,
  mime_type VARCHAR(50),
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_images_diary_entry ON images(diary_entry_id);
```

## 受け入れ条件
- [ ] 画像のアップロードが可能
- [ ] サムネイルが自動生成される
- [ ] 画像が圧縮される（品質維持）
- [ ] EXIF情報が削除される
- [ ] 大きな画像でもスムーズに表示

## 関連チケット
- TICKET-004: 日記入力機能の実装
- TICKET-002: データベース設計とセットアップ

## 備考
将来的にはAWS S3やCloudinaryなどの外部ストレージへの移行も検討。