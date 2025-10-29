import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/campaigns/drafts - 임시저장 생성
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
    console.log('📝 캠페인 임시저장 시도:', { userId: session.user.id })

    // 임시저장 데이터 준비
    const draftData = {
      user_id: session.user.id,
      title: body.title || '',
      category: body.category || null,
      recruit_type: body.recruitType || body.recruit_type || null,
      recruit_count: body.recruitCount || body.recruit_count || 1,
      visit_type: body.visitType || body.visit_type || 'visit',
      reward_type: body.rewardType || body.reward_type || null,
      payment_amount: body.paymentAmount || body.payment_amount || null,
      product_name: body.productName || body.product_name || null,
      other_reward: body.otherReward || body.other_reward || null,
      additional_reward_info: body.additionalRewardInfo || body.additional_reward_info || null,
      is_deal_possible: body.isDealPossible || body.is_deal_possible || false,
      negotiation_option: body.negotiationOption || body.negotiation_option || null,
      content_type: body.contentType || body.content_type || null,
      video_duration: body.videoDuration || body.video_duration || null,
      required_content: body.requiredContent || body.required_content || null,
      required_scenes: body.requiredScenes || body.required_scenes || null,
      hashtags: body.hashtags || [],
      link_url: body.linkUrl || body.link_url || null,
      additional_memo: body.additionalMemo || body.additional_memo || null,
      uploaded_photos: body.uploadedPhotos || body.uploaded_photos || body.images || [],
      thumbnail: body.thumbnail || (body.uploadedPhotos?.[0]) || (body.images?.[0]) || null,
    }

    console.log('📤 임시저장 데이터:', draftData)

    // Supabase에 임시저장
    const { data: draft, error } = await supabaseAdmin
      .from('campaign_drafts')
      .insert(draftData)
      .select()
      .single()

    if (error) {
      console.error('❌ 임시저장 오류:', error)
      return NextResponse.json(
        { error: '임시저장 중 오류가 발생했습니다.', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ 임시저장 성공:', draft.id)

    return NextResponse.json(
      { 
        success: true, 
        message: '캠페인이 임시저장되었습니다.',
        draft 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('❌ 임시저장 오류:', error)
    return NextResponse.json(
      { error: '임시저장 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// GET /api/campaigns/drafts - 임시저장 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    console.log('🔍 임시저장 목록 조회:', { userId: session.user.id })

    const { data: drafts, error } = await supabaseAdmin
      .from('campaign_drafts')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ 임시저장 조회 오류:', error)
      return NextResponse.json(
        { error: '임시저장 조회 중 오류가 발생했습니다.', details: error.message },
        { status: 500 }
      )
    }

    console.log(`✅ 임시저장 ${drafts?.length || 0}개 조회 성공`)

    return NextResponse.json({ 
      success: true,
      drafts: drafts || [],
      total: drafts?.length || 0
    })

  } catch (error) {
    console.error('❌ 임시저장 조회 오류:', error)
    return NextResponse.json(
      { error: '임시저장 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}