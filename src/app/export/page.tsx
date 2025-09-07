'use client'

import React, { useState, useEffect } from 'react'
import { Download, FileJson, FileText, Calendar, CheckCircle, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface ExportFormat {
  id: string
  name: string
  description: string
  icon: React.ElementType
  extension: string
}

export default function ExportPage() {
  const [diaries, setDiaries] = useState<any[]>([])
  const [selectedFormat, setSelectedFormat] = useState<string>('json')
  const [dateRange, setDateRange] = useState<'all' | 'month' | 'year' | 'custom'>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  const exportFormats: ExportFormat[] = [
    {
      id: 'json',
      name: 'JSON形式',
      description: '完全なデータ構造を保持（バックアップ用）',
      icon: FileJson,
      extension: 'json'
    },
    {
      id: 'csv',
      name: 'CSV形式',
      description: 'Excel等で開ける表形式',
      icon: FileSpreadsheet,
      extension: 'csv'
    },
    {
      id: 'txt',
      name: 'テキスト形式',
      description: 'シンプルなテキストファイル',
      icon: FileText,
      extension: 'txt'
    }
  ]

  useEffect(() => {
    fetchDiaries()
  }, [])

  const fetchDiaries = async () => {
    try {
      const response = await fetch('/api/diary')
      if (response.ok) {
        const data = await response.json()
        setDiaries(data)
      }
    } catch (error) {
      console.error('日記データの取得に失敗:', error)
    }
  }

  const filterDiariesByDate = (diaries: any[]) => {
    const now = new Date()
    let filtered = [...diaries]

    switch (dateRange) {
      case 'month':
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        filtered = diaries.filter(d => new Date(d.entryDate) >= oneMonthAgo)
        break
      case 'year':
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        filtered = diaries.filter(d => new Date(d.entryDate) >= oneYearAgo)
        break
      case 'custom':
        if (startDate && endDate) {
          filtered = diaries.filter(d => {
            const date = new Date(d.entryDate)
            return date >= new Date(startDate) && date <= new Date(endDate)
          })
        }
        break
      default:
        // 'all' の場合は全件
        break
    }

    return filtered
  }

  const handleExport = async () => {
    setIsExporting(true)
    setExportSuccess(false)

    const filteredDiaries = filterDiariesByDate(diaries)
    
    try {
      let content = ''
      let filename = `diary_export_${format(new Date(), 'yyyyMMdd')}`
      let mimeType = ''

      switch (selectedFormat) {
        case 'json':
          content = JSON.stringify(filteredDiaries, null, 2)
          mimeType = 'application/json'
          break
          
        case 'csv':
          // CSVヘッダー
          content = '日付,内容\n'
          filteredDiaries.forEach(diary => {
            const date = format(new Date(diary.entryDate), 'yyyy-MM-dd', { locale: ja })
            const escapedContent = `"${(diary.content || '').replace(/"/g, '""')}"`
            
            content += `${date},${escapedContent}\n`
          })
          mimeType = 'text/csv;charset=utf-8'
          break
          
        case 'txt':
          filteredDiaries.forEach((diary, index) => {
            const date = format(new Date(diary.entryDate), 'yyyy年MM月dd日', { locale: ja })
            content += `${'='.repeat(50)}\n`
            content += `【${index + 1}】 ${date}\n`
            content += `${'='.repeat(50)}\n\n`
            content += diary.content + '\n\n'
            if (diary.tags && diary.tags.length > 0) {
              content += `タグ: ${diary.tags.join(', ')}\n\n`
            }
          })
          mimeType = 'text/plain;charset=utf-8'
          break
      }

      // BOMを追加（文字化け対策）
      const bom = new Uint8Array([0xEF, 0xBB, 0xBF])
      const blob = new Blob([bom, content], { type: mimeType })
      
      // ダウンロードリンクを作成
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.${exportFormats.find(f => f.id === selectedFormat)?.extension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } catch (error) {
      console.error('エクスポート処理でエラーが発生:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        日記データのエクスポート
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        日記データをバックアップ用にダウンロードできます
      </p>

      {/* エクスポート形式選択 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          エクスポート形式
        </h2>
        <div className="grid gap-4">
          {exportFormats.map(format => (
            <label
              key={format.id}
              className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                selectedFormat === format.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="format"
                value={format.id}
                checked={selectedFormat === format.id}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="mt-1"
              />
              <format.icon className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">
                  {format.name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {format.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 期間選択 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          エクスポート期間
        </h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="dateRange"
              value="all"
              checked={dateRange === 'all'}
              onChange={(e) => setDateRange(e.target.value as any)}
            />
            <span className="text-gray-900 dark:text-white">すべての日記</span>
            <span className="text-sm text-gray-500">（{diaries.length}件）</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="dateRange"
              value="month"
              checked={dateRange === 'month'}
              onChange={(e) => setDateRange(e.target.value as any)}
            />
            <span className="text-gray-900 dark:text-white">過去1ヶ月</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="dateRange"
              value="year"
              checked={dateRange === 'year'}
              onChange={(e) => setDateRange(e.target.value as any)}
            />
            <span className="text-gray-900 dark:text-white">過去1年</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="dateRange"
              value="custom"
              checked={dateRange === 'custom'}
              onChange={(e) => setDateRange(e.target.value as any)}
            />
            <span className="text-gray-900 dark:text-white">期間を指定</span>
          </label>
          
          {dateRange === 'custom' && (
            <div className="ml-6 mt-3 flex gap-3 items-center">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <span className="text-gray-600 dark:text-gray-400">〜</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* エクスポートボタン */}
      <div className="flex justify-center">
        <Button
          onClick={handleExport}
          disabled={isExporting || diaries.length === 0}
          className="gap-2"
          size="lg"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              エクスポート中...
            </>
          ) : exportSuccess ? (
            <>
              <CheckCircle className="w-5 h-5" />
              ダウンロード完了！
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              エクスポート
            </>
          )}
        </Button>
      </div>

      {/* 注意事項 */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
          <Calendar className="inline w-4 h-4 mr-2" />
          エクスポートデータについて
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li>• エクスポートされたデータは個人情報を含みます。取り扱いにご注意ください</li>
          <li>• JSONファイルは再インポート可能な形式です</li>
          <li>• CSVファイルはExcelやGoogleスプレッドシートで開けます</li>
          <li>• テキストファイルは読みやすい形式で出力されます</li>
        </ul>
      </div>
    </div>
  )
}