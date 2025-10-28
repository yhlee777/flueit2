// app/api/campaigns/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// ✅ camelCase를 snake_case로 변환하는 유틸리티
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

function convertKeysToSnakeCase(obj: any): any {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj
  }

  return Object.keys(obj).reduce((acc: any, key: string) => {
    const snakeKey = toSnakeCase(key)
    acc[snakeKey] = obj[key]
    return acc
  }, {})
}

// POST: 캠페인 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('🔍 캠페인 생성 시도:', body)

    // 필수 필드 검증
    if (!body.title || !body.category) {
      return NextResponse.json(
        { error: '제목과 카테고리는 필수입니다.' },
        { status: 400 }
      )
    }

    // ✅ 데이터 준비 (snake_case로 통일)
    const campaignData = {
      user_id: session.user.id,
      title: body.title,
      category: body.category,
      status: body.status || '구인 진행 중',
      
      // 모집 정보
      recruit_type: body.recruitType || body.recruit_type,
      recruit_count: body.recruitCount || body.recruit_count || null,
      applicants: 0,
      confirmed_applicants: 0,
      
      // 방문 유형
      visit_type: body.visitType || body.visit_type,
      
      // 리워드 정보
      reward_type: body.rewardType || body.reward_type,
      payment_amount: body.paymentAmount || body.payment_amount,
      product_name: body.productName || body.product_name,
      other_reward: body.otherReward || body.other_reward,
      additional_reward_info: body.additionalRewardInfo || body.additional_reward_info,
      
      // 협상 옵션
      is_deal_possible: body.isDealPossible ?? body.is_deal_possible ?? false,
      negotiation_option: body.negotiationOption || body.negotiation_option || null,
      
      // 콘텐츠 정보
      content_type: body.contentType || body.content_type,
      video_duration: body.videoDuration || body.video_duration,
      required_content: body.requiredContent || body.required_content,
      required_scenes: body.requiredScenes || body.required_scenes,
      
      // 메타 정보
      hashtags: body.hashtags || [],
      link_url: body.linkUrl || body.link_url,
      additional_memo: body.additionalMemo || body.additional_memo,
      uploaded_photos: body.uploadedPhotos || body.uploaded_photos || body.images || [],
      thumbnail: body.thumbnail || (body.uploadedPhotos?.[0]) || (body.images?.[0]) || null,
      
      // 통계
      views: 0,
      likes: 0,
      comments: 0,
    }

    console.log('📤 DB 저장 데이터:', campaignData)

    // Supabase에 캠페인 저장
    const { data: campaign, error } = await supabaseAdmin
      .from('campaigns')
      .insert(campaignData)
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase 삽입 오류:', error)
      return NextResponse.json(
        { error: '캠페인 생성 중 오류가 발생했습니다.', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ 캠페인 생성 성공:', campaign)

    return NextResponse.json(
      { 
        success: true, 
        message: '캠페인이 생성되었습니다.',
        campaign 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('❌ 캠페인 생성 오류:', error)
    return NextResponse.json(
      { error: '캠페인 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// GET: 캠페인 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // 쿼리 파라미터
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const visitType = searchParams.get('visit_type') || searchParams.get('visitType')
    const userId = searchParams.get('user_id') || searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // 쿼리 빌더
    let query = supabaseAdmin
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // 필터 적용
    if (status) {
      query = query.eq('status', status)
    }
    if (category) {
      query = query.eq('category', category)
    }
    if (visitType) {
      query = query.eq('visit_type', visitType)
    }
    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: campaigns, error, count } = await query

    if (error) {
      console.error('❌ 캠페인 조회 오류:', error)
      return NextResponse.json(
        { error: '캠페인 조회 중 오류가 발생했습니다.', details: error.message },
        { status: 500 }
      )
    }

    console.log(`✅ 캠페인 ${campaigns?.length || 0}개 조회 성공`)

    return NextResponse.json({ 
      success: true,
      campaigns: campaigns || [],
      total: count || campaigns?.length || 0
    })

  } catch (error) {
    console.error('❌ 캠페인 조회 오류:', error)
    return NextResponse.json(
      { error: '캠페인 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}