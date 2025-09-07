import { useState, useEffect } from 'react'

interface DraftData {
  content: string
  mood?: string
  tags?: string[]
  mode?: 'freewrite' | 'interactive'
}

const DRAFT_KEY = 'diary_draft'

export function useDraftStorage() {
  const [draft, setDraft] = useState<DraftData | null>(null)

  // 下書きを読み込む
  const loadDraft = () => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY)
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft)
        setDraft(parsed)
        return parsed
      }
    } catch (error) {
      console.error('下書きの読み込みに失敗しました:', error)
    }
    return null
  }

  // 下書きを保存する
  const saveDraft = (data: DraftData) => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data))
      setDraft(data)
    } catch (error) {
      console.error('下書きの保存に失敗しました:', error)
    }
  }

  // 下書きをクリアする
  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY)
      setDraft(null)
    } catch (error) {
      console.error('下書きのクリアに失敗しました:', error)
    }
  }

  // 初回読み込み
  useEffect(() => {
    loadDraft()
  }, [])

  return {
    draft,
    loadDraft,
    saveDraft,
    clearDraft
  }
}