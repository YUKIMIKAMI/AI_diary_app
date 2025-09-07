import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q') || ''
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')
  const mood = searchParams.get('mood')
  const tags = searchParams.get('tags')
  const category = searchParams.get('category')
  
  // 一時的にモックデータのみを返す（Prismaの問題を回避）
  const mockResults = query || mood || tags ? [
    {
      id: '1',
      content: `${query || '今日'}についての日記です。とても充実した一日でした。`,
      highlightedContent: query ? `<mark>${query}</mark>についての日記です。とても充実した一日でした。` : undefined,
      entryDate: new Date().toISOString(),
      mood: mood || 'happy',
      tags: tags ? tags.split(',') : ['日常', '振り返り'],
      emotionScore: 4,
      category: category || 'personal'
    },
    {
      id: '2',
      content: `昨日は${query || '仕事'}で忙しかったです。でも達成感がありました。`,
      highlightedContent: query ? `昨日は<mark>${query}</mark>で忙しかったです。でも達成感がありました。` : undefined,
      entryDate: new Date(Date.now() - 86400000).toISOString(),
      mood: mood || 'excited',
      tags: tags ? tags.split(',') : ['仕事', '成長'],
      emotionScore: 3,
      category: category || 'work'
    },
    {
      id: '3',
      content: `週末は${query || '友達'}と過ごしました。リラックスできる時間でした。`,
      highlightedContent: query ? `週末は<mark>${query}</mark>と過ごしました。リラックスできる時間でした。` : undefined,
      entryDate: new Date(Date.now() - 172800000).toISOString(),
      mood: mood || 'calm',
      tags: tags ? tags.split(',') : ['週末', 'リラックス'],
      emotionScore: 5,
      category: category || 'personal'
    }
  ] : []
  
  return NextResponse.json({
    results: mockResults,
    total: mockResults.length,
    query: {
      q: query,
      filters: {
        dateFrom,
        dateTo,
        mood,
        tags,
        category
      }
    }
  })
}