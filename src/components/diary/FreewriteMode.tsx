'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Tag, X } from 'lucide-react'

interface FreewriteModeProps {
  content: string
  mood: string
  tags: string[]
  onContentChange: (content: string) => void
  onMoodChange: (mood: string) => void
  onTagsChange: (tags: string[]) => void
}

export function FreewriteMode({
  content,
  mood,
  tags,
  onContentChange,
  onMoodChange,
  onTagsChange
}: FreewriteModeProps) {
  const [newTag, setNewTag] = React.useState('')

  const moods = [
    { value: 'happy', label: '😊 嬉しい' },
    { value: 'sad', label: '😢 悲しい' },
    { value: 'angry', label: '😠 怒り' },
    { value: 'excited', label: '🎉 興奮' },
    { value: 'calm', label: '😌 穏やか' },
    { value: 'anxious', label: '😰 不安' },
  ]

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onTagsChange([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove))
  }

  return (
    <div className="space-y-6">
      {/* 日記本文 */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium mb-2">
          今日の出来事
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          rows={8}
          placeholder="今日はどんな一日でしたか？"
        />
      </div>

      {/* 気分選択 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          今日の気分
        </label>
        <div className="grid grid-cols-3 gap-2">
          {moods.map((moodOption) => (
            <Button
              key={moodOption.value}
              type="button"
              variant={mood === moodOption.value ? 'default' : 'outline'}
              onClick={() => onMoodChange(moodOption.value)}
              className="w-full"
            >
              {moodOption.label}
            </Button>
          ))}
        </div>
      </div>

      {/* タグ */}
      <div>
        <label className="block text-sm font-medium mb-2">
          タグ
        </label>
        <div className="flex gap-2 mb-2 flex-wrap">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-primary-900 dark:hover:text-primary-100"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            placeholder="タグを追加"
            className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500"
          />
          <Button
            type="button"
            onClick={handleAddTag}
            variant="outline"
            size="icon"
          >
            <Tag className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}