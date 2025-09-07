# TICKET-018: PWA・モバイル対応

## チケット情報
- **ID**: TICKET-018
- **タイプ**: 機能
- **優先度**: 中
- **ステータス**: 未着手
- **担当者**: -
- **作成日**: 2024-09-04
- **更新日**: 2024-09-04

## 概要
Progressive Web App (PWA) として実装し、将来的なネイティブアプリ移行の基盤を構築。

## 詳細説明
Webアプリをスマートフォンにインストール可能なPWAとして実装。オフライン対応、プッシュ通知、カメラアクセスなどのネイティブ機能を活用。

## タスク一覧
### PWA基本機能
- [ ] Service Worker実装
- [ ] マニフェストファイル作成
- [ ] オフライン対応
- [ ] アプリアイコン設定

### ネイティブ機能
- [ ] プッシュ通知
- [ ] カメラアクセス
- [ ] 位置情報取得
- [ ] ローカルストレージ同期

### モバイル最適化
- [ ] レスポンシブデザイン
- [ ] タッチジェスチャー対応
- [ ] モバイルパフォーマンス最適化
- [ ] データ使用量削減

## 技術仕様
### Service Worker
```javascript
// service-worker.js
const CACHE_NAME = 'ai-diary-v1'
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/bundle.js',
  '/offline.html'
]

// インストール
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  )
})

// キャッシュ戦略
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // キャッシュ優先、ネットワークフォールバック
        if (response) {
          return response
        }
        
        return fetch(event.request).then(response => {
          // 重要なリソースはキャッシュに追加
          if (!response || response.status !== 200) {
            return response
          }
          
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache)
          })
          
          return response
        })
      })
      .catch(() => {
        // オフラインフォールバック
        return caches.match('/offline.html')
      })
  )
})

// バックグラウンド同期
self.addEventListener('sync', event => {
  if (event.tag === 'sync-diaries') {
    event.waitUntil(syncDiaries())
  }
})
```

### マニフェスト
```json
{
  "name": "AI Diary - あなたの思い出を記録",
  "short_name": "AI Diary",
  "description": "AIが支援する次世代の日記アプリ",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#4A90E2",
  "background_color": "#ffffff",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "share_target": {
    "action": "/share",
    "method": "POST",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url",
      "files": [{
        "name": "image",
        "accept": ["image/*"]
      }]
    }
  }
}
```

### プッシュ通知
```typescript
// 通知の許可取得
const requestNotificationPermission = async () => {
  if ('Notification' in window && 'serviceWorker' in navigator) {
    const permission = await Notification.requestPermission()
    
    if (permission === 'granted') {
      // Push APIのサブスクリプション
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(PUBLIC_VAPID_KEY)
      })
      
      // サーバーに登録
      await fetch('/api/push/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }
  }
}

// 日記リマインダー通知
const scheduleReminder = () => {
  if ('showTrigger' in Notification.prototype) {
    navigator.serviceWorker.ready.then(async registration => {
      await registration.showNotification('日記を書く時間です', {
        body: '今日の出来事を記録しましょう',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        showTrigger: new TimestampTrigger(Date.now() + 24 * 60 * 60 * 1000),
        tag: 'diary-reminder',
        requireInteraction: true,
        actions: [
          { action: 'write', title: '書く' },
          { action: 'later', title: '後で' }
        ]
      })
    })
  }
}
```

### モバイル最適化
```tsx
// タッチジェスチャー対応
import { useGesture } from '@use-gesture/react'

const MobileOptimizedDiary = () => {
  const bind = useGesture({
    onDrag: ({ down, movement: [mx], direction: [xDir], velocity }) => {
      // スワイプで日記切り替え
      if (!down && velocity > 0.2) {
        if (xDir < 0) navigateNext()
        else navigatePrevious()
      }
    },
    onPinch: ({ offset: [scale] }) => {
      // ピンチでズーム
      setZoom(scale)
    }
  })
  
  return (
    <div {...bind()} className="touch-area">
      {/* モバイル最適化されたUI */}
    </div>
  )
}
```

## 受け入れ条件
- [ ] PWAとしてインストール可能
- [ ] オフラインで基本機能が動作
- [ ] プッシュ通知が機能
- [ ] Lighthouseスコア90以上
- [ ] iOS/Androidで動作確認

## 関連チケット
- TICKET-003: フロントエンド基盤構築
- TICKET-019: パフォーマンス最適化

## 備考
将来的なReact Native移行を考慮し、ビジネスロジックとUIを分離。