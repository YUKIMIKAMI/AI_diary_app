'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Send, Loader2, CheckCircle } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface InteractiveModeProps {
  onComplete: (content: string, mood: string, tags: string[]) => void
}

export function InteractiveMode({ onComplete }: InteractiveModeProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '今日はどんな一日でしたか？何か印象に残ったことがあれば教えてください。' }
  ])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return

    const userMessage = { role: 'user' as const, content: currentMessage }
    setMessages(prev => [...prev, userMessage])
    setCurrentMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: currentMessage,
          conversationHistory: messages 
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.response 
        }])
      }
    } catch (error) {
      console.error('対話エラー:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '申し訳ありません。応答の生成中にエラーが発生しました。' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinishConversation = async () => {
    if (messages.length < 2) return
    setIsFinishing(true)

    try {
      const response = await fetch('/api/ai/dialogue/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      })

      if (response.ok) {
        const data = await response.json()
        // デフォルト値を設定して undefined を防ぐ
        const content = data.content || data.diary || '今日の出来事を記録しました。'
        const mood = data.mood || 'calm'
        const tags = data.tags || ['日常', '振り返り']
        onComplete(content, mood, tags)
      } else {
        // エラー時のフォールバック
        const userContent = messages
          .filter(msg => msg.role === 'user')
          .map(msg => msg.content)
          .join(' ')
        onComplete(
          userContent || '今日の出来事を記録しました。',
          'calm',
          ['日常', '振り返り']
        )
      }
    } catch (error) {
      console.error('要約エラー:', error)
    } finally {
      setIsFinishing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="メッセージを入力..."
          disabled={isLoading || isFinishing}
          className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        />
        <Button
          onClick={handleSendMessage}
          disabled={!currentMessage.trim() || isLoading || isFinishing}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {messages.length > 2 && (
        <Button
          onClick={handleFinishConversation}
          disabled={isFinishing}
          className="w-full"
          variant="outline"
        >
          {isFinishing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          )}
          対話を終了して日記を作成
        </Button>
      )}
    </div>
  )
}