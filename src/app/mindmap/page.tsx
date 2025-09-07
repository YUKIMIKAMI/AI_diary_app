'use client'

import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'

// 動的インポートでMindmapViewをロード
const MindmapView = dynamic(
  () => import('@/components/mindmap/MindmapView'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">マインドマップを読み込み中...</p>
        </div>
      </div>
    )
  }
)

function MindmapContent() {
  return <MindmapView />
}

export default function MindmapPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">読み込み中...</p>
        </div>
      </div>
    }>
      <MindmapContent />
    </Suspense>
  )
}