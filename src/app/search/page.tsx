'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Search, Calendar, Tag, Heart, Filter, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface SearchFilters {
  dateFrom?: string
  dateTo?: string
  mood?: string
  tags?: string[]
  category?: string
}

interface SearchResult {
  id: string
  content: string
  highlightedContent?: string
  entryDate: string
  mood?: string
  tags?: string[]
  emotionScore?: number
  category?: string
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({})
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  // 検索実行
  const performSearch = useCallback(async (searchQuery: string, searchFilters: SearchFilters) => {
    if (!searchQuery.trim() && Object.keys(searchFilters).length === 0) {
      setResults([])
      setHasSearched(false)
      return
    }

    setIsSearching(true)
    setHasSearched(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('q', searchQuery)
      if (searchFilters.dateFrom) params.append('dateFrom', searchFilters.dateFrom)
      if (searchFilters.dateTo) params.append('dateTo', searchFilters.dateTo)
      if (searchFilters.mood) params.append('mood', searchFilters.mood)
      if (searchFilters.tags?.length) params.append('tags', searchFilters.tags.join(','))
      if (searchFilters.category) params.append('category', searchFilters.category)

      const response = await fetch(`/api/search?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.results || [])
      }
    } catch (error) {
      console.error('検索エラー:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  // デバウンス処理付き検索
  useEffect(() => {
    // 初期レンダリング時や空のクエリの場合は検索しない
    if (!query && Object.keys(filters).length === 0) {
      return
    }
    
    if (searchDebounce) clearTimeout(searchDebounce)
    
    const timeout = setTimeout(() => {
      performSearch(query, filters)
    }, 500)
    
    setSearchDebounce(timeout)
    
    return () => {
      if (searchDebounce) clearTimeout(searchDebounce)
    }
  }, [query, filters])

  // フィルターのクリア
  const clearFilters = () => {
    setFilters({})
    setQuery('')
  }

  // 気分の選択肢
  const moods = [
    { value: 'happy', label: '😊 嬉しい', color: 'text-yellow-500' },
    { value: 'sad', label: '😢 悲しい', color: 'text-blue-500' },
    { value: 'angry', label: '😠 怒り', color: 'text-red-500' },
    { value: 'excited', label: '🎉 興奮', color: 'text-purple-500' },
    { value: 'calm', label: '😌 穏やか', color: 'text-green-500' },
    { value: 'anxious', label: '😰 不安', color: 'text-gray-500' },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          日記を検索
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          キーワードや日付、気分から過去の日記を検索できます
        </p>
      </div>

      {/* 検索バー */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="キーワードを入力..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className="h-12 w-12"
          >
            <Filter className="h-5 w-5" />
          </Button>
        </div>

        {/* フィルターパネル */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t dark:border-gray-700 space-y-4">
            {/* 日付範囲 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  開始日
                </label>
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  終了日
                </label>
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* 気分フィルター */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                気分で絞り込み
              </label>
              <div className="flex flex-wrap gap-2">
                {moods.map((mood) => (
                  <Button
                    key={mood.value}
                    variant={filters.mood === mood.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilters({ 
                      ...filters, 
                      mood: filters.mood === mood.value ? undefined : mood.value 
                    })}
                  >
                    {mood.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* フィルタークリア */}
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500"
              >
                <X className="h-4 w-4 mr-1" />
                フィルターをクリア
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 検索結果 */}
      <div className="space-y-4">
        {isSearching ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-500" />
            <p className="mt-2 text-gray-500 dark:text-gray-400">検索中...</p>
          </div>
        ) : hasSearched && results.length > 0 ? (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {results.length}件の結果が見つかりました
            </p>
            {results.map((result) => (
              <div
                key={result.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {format(new Date(result.entryDate), 'yyyy年M月d日(E)', { locale: ja })}
                    </span>
                    {result.mood && (
                      <span className="text-sm">
                        {moods.find(m => m.value === result.mood)?.label}
                      </span>
                    )}
                  </div>
                  <Link href={`/diary/${result.id}`}>
                    <Button variant="ghost" size="sm">
                      詳細を見る
                    </Button>
                  </Link>
                </div>

                {/* ハイライトされたコンテンツまたは通常のコンテンツ */}
                <div className="text-gray-700 dark:text-gray-300">
                  {result.highlightedContent ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: result.highlightedContent }}
                      className="prose dark:prose-invert max-w-none"
                    />
                  ) : (
                    <p className="line-clamp-3">{result.content}</p>
                  )}
                </div>

                {/* タグ */}
                {result.tags && result.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        ) : hasSearched ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              検索結果が見つかりませんでした
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              別のキーワードやフィルターをお試しください
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              キーワードを入力して検索を開始
            </p>
          </div>
        )}
      </div>
    </div>
  )
}