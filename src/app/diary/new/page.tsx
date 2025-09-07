'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { FreewriteMode } from '@/components/diary/FreewriteMode'
import { InteractiveMode } from '@/components/diary/InteractiveMode'
import { useAutoSave } from '@/hooks/useAutoSave'
import { useDraftStorage } from '@/hooks/useDraftStorage'
import { Save, Loader2, PenTool, MessageSquare, Sparkles } from 'lucide-react'

export default function NewDiaryPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'freewrite' | 'interactive'>('freewrite')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('calm')
  const [tags, setTags] = useState<string[]>(['日常', '振り返り'])
  const [isSaving, setIsSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  const { draft, saveDraft, clearDraft } = useDraftStorage()

  // ユーザー初期化
  useEffect(() => {
    const initUser = async () => {
      try {
        const response = await fetch('/api/init-user')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error('ユーザー初期化エラー:', error)
      }
    }
    initUser()
  }, [])

  // 下書きの読み込み
  useEffect(() => {
    if (draft) {
      setContent(draft.content || '')
      setMood(draft.mood || 'calm')
      setTags(draft.tags || ['日常', '振り返り'])
      if (draft.mode) {
        setMode(draft.mode)
      }
    }
  }, [draft])

  // 自動保存
  useAutoSave({
    data: { content, mood, tags, mode },
    onSave: (data) => saveDraft(data),
    interval: 30000,
    enabled: mode === 'freewrite' && content.length > 0
  })

  // 日記を保存
  const handleSave = async () => {
    if (!content.trim()) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, mood, tags })
      })

      if (response.ok) {
        const data = await response.json()
        clearDraft()
        // デモモードではlocalStorageに保存してからリダイレクト
        if (typeof window !== 'undefined') {
          const existingDiaries = JSON.parse(localStorage.getItem('diaries') || '[]')
          const newDiary = {
            ...data,
            content,
            mood,
            tags,
            createdAt: new Date().toISOString()
          }
          localStorage.setItem('diaries', JSON.stringify([...existingDiaries, newDiary]))
          localStorage.setItem('currentDiary', JSON.stringify(newDiary))
        }
        router.push(`/mindmap?diaryId=${data.id}`)
      }
    } catch (error) {
      console.error('保存エラー:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // 対話モード完了時の処理
  const handleInteractiveComplete = (newContent: string, newMood: string, newTags: string[]) => {
    setContent(newContent)
    setMood(newMood)
    setTags(newTags)
    setMode('freewrite')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          新しい日記を書く
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          今日の出来事や気持ちを記録しましょう
        </p>
      </div>

      {/* モード切替 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex gap-2 mb-6">
          <Button
            variant={mode === 'freewrite' ? 'default' : 'outline'}
            onClick={() => setMode('freewrite')}
            className="flex-1"
          >
            <PenTool className="h-4 w-4 mr-2" />
            自由に書く
          </Button>
          <Button
            variant={mode === 'interactive' ? 'default' : 'outline'}
            onClick={() => setMode('interactive')}
            className="flex-1"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            対話しながら書く
          </Button>
        </div>

        {/* モードごとのコンテンツ */}
        {mode === 'freewrite' ? (
          <FreewriteMode
            content={content}
            mood={mood}
            tags={tags}
            onContentChange={setContent}
            onMoodChange={setMood}
            onTagsChange={setTags}
          />
        ) : (
          <InteractiveMode
            onComplete={handleInteractiveComplete}
          />
        )}
      </div>

      {/* 保存ボタン（フリーライトモードのみ） */}
      {mode === 'freewrite' && (
        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={!content.trim() || isSaving}
            className="flex-1"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                日記を保存
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setContent('')
              setMood('calm')
              setTags(['日常', '振り返り'])
              clearDraft()
            }}
          >
            クリア
          </Button>
        </div>
      )}

      {/* 下書き保存インジケーター */}
      {mode === 'freewrite' && content.length > 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
          <Sparkles className="inline h-3 w-3 mr-1" />
          下書きは自動的に保存されます
        </p>
      )}
    </div>
  )
}