'use client'

import React, { useState } from 'react'

export default function TestMindmapPage() {
  const [answer, setAnswer] = useState('')
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testAnswerAnalysis = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/answer-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answer: answer,
          originalQuestion: 'テスト質問',
          diaryContent: 'テスト日記内容'
        })
      })
      
      const data = await res.json()
      setResponse(data)
      console.log('API Response:', data)
    } catch (error) {
      console.error('Error:', error)
      setResponse({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">マインドマップ機能テスト</h1>
      
      <div className="mb-4">
        <label className="block mb-2">回答を入力:</label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full p-2 border rounded"
          rows={3}
          placeholder="楽しかったです"
        />
      </div>
      
      <button
        onClick={testAnswerAnalysis}
        disabled={loading || !answer}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {loading ? '処理中...' : 'APIテスト'}
      </button>
      
      {response && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="font-bold mb-2">レスポンス:</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}