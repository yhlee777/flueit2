// app/api/naver-place-search/route.ts
// 네이버 장소 검색 API를 프록시하는 서버 사이드 엔드포인트

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query')

  if (!query) {
    return NextResponse.json(
      { error: '검색어를 입력해주세요' },
      { status: 400 }
    )
  }

  // 네이버 API 키를 환경 변수에서 가져옵니다
  const CLIENT_ID = process.env.NAVER_CLIENT_ID
  const CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET

  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('네이버 API 키가 설정되지 않았습니다')
    return NextResponse.json(
      { error: 'API 설정 오류' },
      { status: 500 }
    )
  }

  try {
    const response = await fetch(
      `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=10&start=1&sort=random`,
      {
        headers: {
          'X-Naver-Client-Id': CLIENT_ID,
          'X-Naver-Client-Secret': CLIENT_SECRET,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`네이버 API 오류: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('네이버 장소 검색 오류:', error)
    return NextResponse.json(
      { error: '장소 검색에 실패했습니다' },
      { status: 500 }
    )
  }
}